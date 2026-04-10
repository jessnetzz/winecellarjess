import { FormEvent, useState } from 'react';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';

type AuthMode = 'sign-in' | 'sign-up';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      if (mode === 'sign-up') {
        await authService.signUp(email, password);
        setMessage('Account created. Check your email if your Supabase project requires confirmation, then sign in.');
      } else {
        await authService.signIn(email, password);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
        <section className="panel max-w-2xl p-8">
          <p className="field-label text-vine">Setup needed</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-ink">Connect Supabase</h1>
          <p className="mt-4 text-sm leading-6 text-smoke">
            Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your local `.env` file, then restart the Vite dev server.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-ink/10 bg-white shadow-cellar lg:grid-cols-[1fr_440px]">
        <div className="bg-paper p-8 sm:p-12">
          <p className="field-label text-vine">Private cellar</p>
          <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-ink">Wine Cellar</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-smoke">
            Sign in to keep your collection, tasting notes, storage map, and drinking windows synced across your own devices.
          </p>
          <div className="mt-8 rounded-lg border border-vine/15 bg-white/80 p-5">
            <p className="font-serif text-2xl font-bold text-ink">Cloud-backed, still personal.</p>
            <p className="mt-3 text-sm leading-6 text-smoke">
              Each wine belongs to your Supabase user account, with database policies designed so your rows stay private.
            </p>
          </div>
        </div>

        <form className="p-8 sm:p-10" onSubmit={submit}>
          <p className="field-label">{mode === 'sign-in' ? 'Welcome back' : 'Create account'}</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-ink">
            {mode === 'sign-in' ? 'Sign in' : 'Start your cellar'}
          </h2>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="field-label">Email</span>
              <input
                className="field mt-2"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="field-label">Password</span>
              <input
                className="field mt-2"
                type="password"
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          </div>

          {error ? <div className="mt-5 rounded-lg border border-clay/30 bg-clay/10 p-3 text-sm text-clay">{error}</div> : null}
          {message ? <div className="mt-5 rounded-lg border border-moss/30 bg-moss/10 p-3 text-sm text-moss">{message}</div> : null}

          <button className="premium-button mt-6 w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Working...' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </button>

          <button
            className="ghost-button mt-4 w-full"
            type="button"
            onClick={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
              setError(null);
              setMessage(null);
            }}
          >
            {mode === 'sign-in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </form>
      </section>
    </div>
  );
}
