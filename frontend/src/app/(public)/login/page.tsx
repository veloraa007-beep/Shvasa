'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Leaf } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError(authError?.message ?? 'Login failed. Please try again.');
      setIsLoading(false);
      return;
    }

    // Check onboarding status to route correctly
    const { data: profile } = await supabase
      .from('user_profile')
      .select('onboarding_complete')
      .eq('id', data.user.id)
      .single();

    if (profile?.onboarding_complete) {
      router.push('/dashboard');
    } else {
      router.push('/onboarding');
    }
    router.refresh();
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first, then click Forgot password.');
      return;
    }
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setError(null);
      alert('Password reset link sent to your email.');
    }
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
          <h1 className="font-editorial text-3xl text-on-surface mb-1">Welcome back</h1>
          <p className="text-on-surface-variant font-body text-sm">Continue your focus journey.</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5 font-body">
              Email
            </label>
            <input
              id="login-email"
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
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-on-surface font-body">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-primary hover:underline font-body"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-surface border border-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface font-body placeholder:text-on-surface-variant/40 transition-all"
                placeholder="••••••••"
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

          <button
            type="submit"
            id="login-submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-primary text-on-primary rounded-full font-medium text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant font-body">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
