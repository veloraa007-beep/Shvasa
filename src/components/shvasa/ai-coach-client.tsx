'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AiCoach } from '@/components/shvasa/ai-coach';
import { readSnapshot } from '@/lib/shvasa/local-store';
import { ShvasaUser } from '@/lib/shvasa/types';

export function ClientAiCoach() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ShvasaUser | null>(null);

  useEffect(() => {
    setMounted(true);
    const raw = window.localStorage.getItem('shvasa:user');
    if (raw) {
      try {
        setUser(JSON.parse(raw) as ShvasaUser);
      } catch (e) {
        console.error('Failed to parse user from local storage', e);
      }
    }
  }, []);

  const snapshotQuery = useQuery({
    queryKey: ['snapshot', user?.id],
    queryFn: () => readSnapshot(user!.id),
    enabled: Boolean(user) && mounted,
  });

  // To prevent hydration mismatch, render a placeholder with the same structure
  // until the component has mounted on the client.
  if (!mounted) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-2xl">🌿</span>
        </div>
        <h3 className="font-editorial text-primary text-lg mb-2">Bloom AI</h3>
        <p className="text-sm text-on-surface-variant mb-4">
          Loading your calm guide...
        </p>
      </div>
    );
  }

  const tasks = snapshotQuery.data?.tasks ?? [];
  const profile = snapshotQuery.data?.profile ?? null;

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-2xl">🌿</span>
        </div>
        <h3 className="font-editorial text-primary text-lg mb-2">Bloom AI</h3>
        <p className="text-sm text-on-surface-variant mb-4">
          Connect your account to receive gentle guidance and stay focused.
        </p>
        <a
          href="/"
          className="text-sm text-primary font-medium hover:underline"
        >
          Sign in to begin
        </a>
      </div>
    );
  }

  return (
    <AiCoachWrapper user={user} profile={profile} tasks={tasks} />
  );
}

function AiCoachWrapper({
  user,
  profile,
  tasks,
}: {
  user: ShvasaUser;
  profile: ReturnType<typeof readSnapshot> extends { profile: infer P } ? P : null;
  tasks: ReturnType<typeof readSnapshot> extends { tasks: infer T } ? T : never[];
}) {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🌿</span>
          <h2 className="font-editorial italic text-primary text-lg">Bloom AI</h2>
        </div>
        <p className="text-xs text-on-surface-variant">Your calm guide.</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <AiCoach user={user} profile={profile} tasks={tasks} />
      </div>
    </div>
  );
}
