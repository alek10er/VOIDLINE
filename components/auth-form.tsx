'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type Mode = 'login' | 'register';

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'register') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, username: username || email.split('@')[0] });
      }

      router.push('/dashboard');
      router.refresh();
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-md rounded-md border border-white/20 bg-void-panel p-6">
      <h1 className="text-2xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
      <p className="mt-2 text-sm text-void-muted">{mode === 'login' ? 'Login to your private line.' : 'Register your private identity.'}</p>
      <div className="mt-6 space-y-3">
        {mode === 'register' && (
          <input
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
        )}
        <input
          className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
      </div>
      {error && <p className="mt-3 text-sm text-void-danger">{error}</p>}
      <button disabled={loading} className="mt-6 w-full rounded-md border border-white/30 bg-white py-2 text-sm font-medium text-black disabled:opacity-60">
        {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
      </button>
      <p className="mt-4 text-sm text-void-muted">
        {mode === 'login' ? 'No account?' : 'Already registered?'}{' '}
        <Link className="text-white underline" href={mode === 'login' ? '/register' : '/login'}>
          {mode === 'login' ? 'Register' : 'Login'}
        </Link>
      </p>
    </form>
  );
}
