'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Leaf } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    // Create initial profile row so onboarding can update it
    if (data.user) {
      await supabase.from('user_profile').upsert(
        {
          id: data.user.id,
          email,
          display_name: '',
          primary_language: 'English',
          secondary_language: null,
          focus_problem: '',
          distractions: '',
          work_type: '',
          best_focus_time: '',
          plan: 'free',
          avatar: null,
          goals: '',
          onboarding_complete: false,
        },
        { onConflict: 'id' }
      );
    }

    // New users always go to onboarding first
    router.push('/onboarding');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      {/* Brand mark */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Leaf size={18} className="text-primary" />
        </div>
        <span className="font-editorial text-2xl text-primary tracking-tight">Shvasa</span>
      </div>

      <div className="w-full max-w-md bg-surface-container rounded-[28px] p-8 md:p-10 border border-surface-variant/30 shadow-sm">
        <div className="mb-8">
          <h1 className="font-editorial text-3xl text-on-surface mb-1">Create account</h1>
          <p className="text-on-surface-variant font-body text-sm">Start your journey to better focus.</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5 font-body">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface font-body placeholder:text-on-surface-variant/40 transition-all"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5 font-body">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-surface border border-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface font-body placeholder:text-on-surface-variant/40 transition-all"
                placeholder="Min 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5 font-body">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-surface border border-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface font-body placeholder:text-on-surface-variant/40 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            id="signup-submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-primary text-on-primary rounded-full font-medium text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant font-body">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
