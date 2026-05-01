'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShvasaUser } from '@/lib/shvasa/types';

function readUser(): ShvasaUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem('shvasa:user');
  return raw ? JSON.parse(raw) as ShvasaUser : null;
}

function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = window.localStorage.getItem('shvasa:onboarding');
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    return data.isComplete === true;
  } catch (e) {
    return false;
  }
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const user = readUser();
    if (user) {
      if (hasCompletedOnboarding()) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) return null; // Or a subtle loading spinner
  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const user = readUser();
    if (!user) {
      router.push('/login');
    } else if (!hasCompletedOnboarding()) {
      router.push('/onboarding');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) return null;
  return <>{children}</>;
}

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const user = readUser();
    if (!user) {
      router.push('/login');
    } else if (hasCompletedOnboarding()) {
      router.push('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) return null;
  return <>{children}</>;
}
