import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('user_profile')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single();

    if (profile && profile.onboarding_complete) {
      redirect('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {children}
    </div>
  );
}
