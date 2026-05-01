import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/shvasa/Dashboard';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('user_profile')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.onboarding_complete) {
    redirect('/onboarding');
  }

  // Map the Supabase user to our internal ShvasaUser format for the local-store fallback
  // or we can pass them both down
  const shvasaUser = {
    id: user.id,
    email: user.email || '',
    accessToken: '', // We don't need this if we use Supabase client
  };

  return <DashboardClient user={shvasaUser} profile={profile} />;
}
