import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getSupabaseEnv } from '@/lib/env/public';

const NotifySchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(180),
});

async function verifySupabaseToken(token: string) {
  const env = getSupabaseEnv();

  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  return response.ok;
}

export async function POST(request: NextRequest) {
  const bearer = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!bearer || !(await verifySupabaseToken(bearer))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serverKey = process.env.FIREBASE_SERVER_KEY;
  if (!serverKey) {
    return NextResponse.json({ error: 'Missing FCM server key' }, { status: 500 });
  }

  const { userId, title, body } = NotifySchema.parse(await request.json());

  const env = getSupabaseEnv();

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data: tokens, error: tokenError } = await supabase
    .from('device_tokens')
    .select('token')
    .eq('user_id', userId);

  if (tokenError) {
    return NextResponse.json({ error: tokenError.message }, { status: 502 });
  }

  if (!tokens || tokens.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const results = await Promise.allSettled(
    tokens.map((t: { token: string }) =>
      fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          Authorization: `key=${serverKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: t.token,
          notification: { title, body },
        }),
      })
    )
  );

  const successes = results.filter((result) => result.status === 'fulfilled' && result.value.ok);
  const failures = results.filter((result) => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.ok));

  return NextResponse.json({
    ok: failures.length === 0,
    sent: successes.length,
    failed: failures.length,
  });
}
