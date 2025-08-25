"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Bot, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (
        session &&
        session.user &&
        (!session.expires_at || session.expires_at * 1000 > Date.now())
      ) {
        // Try fetching the user's profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data && !error) {
          router.push('/dashboard');
        } else {
          // Session is invalid for data fetches, force logout
          await supabase.auth.signOut();
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(';').forEach((c) => {
            if (c.includes('sb-')) {
              document.cookie = c
                .replace(/^ +/, '')
                .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
            }
          });
          setCheckingSession(false);
        }
      } else {
        setCheckingSession(false);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data || !data.user) {
        setError('No user returned from Supabase');
        setLoading(false);
        return;
      }

      // Fetch profile after login
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile && !profileError) {
        window.location.href = redirectTo;
      } else {
        setError('Profile not found');
        setLoading(false);
      }
    } catch (err) {
      setError('Unexpected error');
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#f8f7f4', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Image src="/scalewize_cover_logo.png" alt="ScaleWize AI Cover Logo" width={360} height={80} className="h-24 w-auto" />
          </div>
          <h2 className="mt-6 text-3xl font-bold" style={{ color: '#595F39' }}>
            Sign in
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#000' }}>
            Communicate and work with your team of AI agents, implemented across your company
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#000' }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ color: '#000', '--tw-ring-color': '#595F39' } as React.CSSProperties}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#000' }}>
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 pr-10"
                  style={{ color: '#000', '--tw-ring-color': '#595F39' } as React.CSSProperties}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: '#595F39' }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: '#595F39' }} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#595F39', '--tw-ring-color': '#595F39' } as React.CSSProperties}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm" style={{ color: '#000' }}>
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium" style={{ color: '#595F39' }}>
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPageInner() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#f8f7f4', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 mx-auto" style={{ borderColor: '#595F39' }} />
          <h2 className="text-xl font-semibold text-gray-900 mt-4">Loading...</h2>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 