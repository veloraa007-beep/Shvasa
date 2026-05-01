import { AppProviders } from '@/components/shvasa/AppProviders';
import { Sidebar } from '@/components/shell/Sidebar';
import { ClientAiCoach } from '@/components/shvasa/ai-coach-client';
import { MobileBottomNav } from '@/components/shell/MobileBottomNav';
import { Topbar } from '@/components/shell/Topbar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the full profile to pass to child components like Sidebar
  const { data: profile } = await supabase
    .from('user_profile')
    .select('*')
    .eq('id', user.id)
    .single();

  // If we require onboarding data and it's missing, redirect
  if (!profile || !profile.onboarding_complete) {
    redirect('/onboarding');
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile Topbar */}
      <Topbar />

      {/* Left Sidebar - Fixed on desktop, hidden on mobile */}
      <div className="hidden md:block fixed left-0 top-0 h-screen z-50">
        <Sidebar profile={profile} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full md:ml-[240px] lg:ml-[240px] md:mr-[360px] min-h-screen pt-16 pb-20 md:pt-0 md:pb-0">
        {children}
      </main>

      {/* Right AI Companion Panel - Fixed on desktop, hidden on mobile */}
      <div className="hidden md:block fixed right-0 top-0 h-screen w-[360px] border-l border-surface-variant/20 bg-surface-container-low overflow-y-auto">
        <ClientAiCoach />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
