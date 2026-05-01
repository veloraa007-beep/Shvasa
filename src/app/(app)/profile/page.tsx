import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Sparkles, User, Settings as SettingsIcon, LogOut, Flame } from 'lucide-react';

export default async function ProfilePage() {
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

  if (!profile) {
    redirect('/login');
  }

  const displayName = profile.display_name || 'Friend';
  const avatarInitials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-surface">
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-24">
        
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-editorial text-primary tracking-tight mb-2">Profile</h1>
          <p className="text-on-surface-variant font-body">Manage your identity and preferences in the sanctuary.</p>
        </header>

        <div className="bg-white rounded-[24px] p-8 ambient-shadow border border-surface-variant/20 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover shadow-sm" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary font-editorial text-4xl shadow-sm">
                  {avatarInitials}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-2xl font-editorial text-primary mb-1">{displayName}</h2>
                <p className="text-on-surface-variant text-sm font-body">{profile.email}</p>
              </div>

              <div className="flex gap-4">
                <div className="bg-surface-container-lowest px-4 py-2 rounded-xl flex items-center gap-2 border border-surface-variant/30">
                  <Sparkles size={16} className="text-secondary" />
                  <span className="text-sm font-medium text-on-surface capitalize">{profile.plan} Plan</span>
                </div>
                <div className="bg-surface-container-lowest px-4 py-2 rounded-xl flex items-center gap-2 border border-surface-variant/30">
                  <Flame size={16} className="text-red-500" />
                  <span className="text-sm font-medium text-on-surface">Member</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identity & Languages */}
          <div className="bg-white rounded-[24px] p-8 ambient-shadow border border-surface-variant/20 space-y-6">
            <h3 className="text-xl font-editorial text-primary border-b border-surface-variant/20 pb-4">Personal Details</h3>
            
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">Primary Language</p>
              <p className="text-on-surface font-body">{profile.primary_language || 'Not set'}</p>
            </div>
            
            {profile.secondary_language && (
              <div>
                <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">Secondary Language</p>
                <p className="text-on-surface font-body">{profile.secondary_language}</p>
              </div>
            )}
            
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">Work Type</p>
              <p className="text-on-surface font-body">{profile.work_type || 'Not set'}</p>
            </div>
          </div>

          {/* Focus Profile */}
          <div className="bg-white rounded-[24px] p-8 ambient-shadow border border-surface-variant/20 space-y-6">
            <h3 className="text-xl font-editorial text-primary border-b border-surface-variant/20 pb-4">Focus Profile</h3>
            
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">Focus Goal</p>
              <p className="text-on-surface font-body">{profile.goals || 'Not set'}</p>
            </div>
            
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">Main Distractions</p>
              <p className="text-on-surface font-body">{profile.distractions || 'Not set'}</p>
            </div>
            
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">Best Focus Time</p>
              <p className="text-on-surface font-body">{profile.best_focus_time || 'Not set'}</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
