import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseEnv } from '@/lib/env/public';

function withSecurityHeaders(response: NextResponse) {
  response.headers.set('Content-Security-Policy', "default-src 'self'");
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export async function middleware(request: NextRequest) {
  // Refresh tokens so cookies stay alive
  const response = await updateSession(request);
  const env = getSupabaseEnv();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() { /* handled by updateSession */ },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Define route categories
  const isAuthPage = path === '/login' || path === '/signup';
  const isLandingPage = path === '/';
  const isOnboardingPage = path.startsWith('/onboarding');
  const isPublicPage = isAuthPage || isLandingPage;

  // No session: allow public pages, redirect everything else to login.
  if (!user) {
    if (!isPublicPage && !isOnboardingPage) {
      url.pathname = '/login';
      return withSecurityHeaders(NextResponse.redirect(url));
    }

    if (isOnboardingPage) {
      url.pathname = '/login';
      return withSecurityHeaders(NextResponse.redirect(url));
    }

    return withSecurityHeaders(response);
  }

  // Authenticated session: keep onboarding status redirects intact.
  if (isPublicPage || isLandingPage || isOnboardingPage) {
    const { data: profile } = await supabase
      .from('user_profile')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single();

    const isComplete = profile?.onboarding_complete === true;

    if (isOnboardingPage && isComplete) {
      url.pathname = '/dashboard';
      return withSecurityHeaders(NextResponse.redirect(url));
    } else if (isPublicPage || isLandingPage) {
      url.pathname = isComplete ? '/dashboard' : '/onboarding';
      return withSecurityHeaders(NextResponse.redirect(url));
    }
  }

  return withSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
