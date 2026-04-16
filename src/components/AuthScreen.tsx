import { FormEvent, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';

export type AuthMode = 'sign-in' | 'sign-up';

interface AuthScreenProps {
  initialMode?: AuthMode;
  onBackToLanding?: () => void;
  onModeChange?: (mode: AuthMode) => void;
}

export default function AuthScreen({ initialMode = 'sign-in', onBackToLanding, onModeChange }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode | 'reset-password'>(initialMode);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setMessage(null);
  }, [initialMode]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      if (mode === 'sign-up') {
        await authService.signUp(email, password, { firstName, lastName });
        setMessage('Account created. Check your inbox to confirm your email if needed, then step into your cellar.');
      } else if (mode === 'reset-password') {
        await authService.sendPasswordReset(email);
        setMessage('Password reset sent. Check your inbox for the link, then choose a new password.');
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
          {onBackToLanding ? (
            <button className="ghost-button -ml-3 mb-6" type="button" onClick={onBackToLanding}>
              Back to the welcome page
            </button>
          ) : null}
          <p className="field-label text-vine">Okay, Just a Bottle</p>
          <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-ink">Your cellar is waiting</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-smoke">
            Sign in to keep your collection, tasting notes, storage map, and drinking windows synced across your devices.
          </p>
          <div className="mt-8 rounded-lg border border-vine/15 bg-white/80 p-5">
            <p className="font-serif text-2xl font-bold text-ink">Cloud-backed, still personal.</p>
            <p className="mt-3 text-sm leading-6 text-smoke">
              Each wine belongs to your Supabase user account, with database policies designed so your rows stay private.
            </p>
          </div>
        </div>

        <form className="p-8 sm:p-10" onSubmit={submit}>
          <p className="field-label">
            {mode === 'sign-in' ? 'Welcome back' : mode === 'sign-up' ? 'Create account' : 'Reset password'}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-ink">
            {mode === 'sign-in' ? 'Sign in' : mode === 'sign-up' ? 'Start your cellar' : 'Get back in'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-smoke">
            {mode === 'sign-in'
              ? 'Log in with the account tied to your cellar.'
              : mode === 'sign-up'
                ? 'A few details, then the good bottles are yours to track.'
                : 'We will send a reset link to your email so you can choose a new password.'}
          </p>

          <div className="mt-6 space-y-4">
            {mode === 'sign-up' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="field-label">First name</span>
                  <input
                    className="field mt-2"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="field-label">Last name</span>
                  <input
                    className="field mt-2"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </label>
              </div>
            ) : null}
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
            {mode !== 'reset-password' ? (
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
            ) : null}
          </div>

          {error ? <div className="mt-5 rounded-lg border border-clay/30 bg-clay/10 p-3 text-sm text-clay">{error}</div> : null}
          {message ? <div className="mt-5 rounded-lg border border-moss/30 bg-moss/10 p-3 text-sm text-moss">{message}</div> : null}

          <button className="premium-button mt-6 w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Working...' : mode === 'sign-in' ? 'Sign in' : mode === 'sign-up' ? 'Sign up' : 'Send reset link'}
          </button>

          <div className="mt-4 space-y-2">
            {mode === 'sign-in' ? (
              <>
                <button
                  className="ghost-button w-full"
                  type="button"
                  onClick={() => {
                    setMode('sign-up');
                    setError(null);
                    setMessage(null);
                    onModeChange?.('sign-up');
                  }}
                >
                  Need an account? Sign up
                </button>
                <button
                  className="ghost-button w-full text-sm"
                  type="button"
                  onClick={() => {
                    setMode('reset-password');
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Forgot your password?
                </button>
              </>
            ) : null}

            {mode === 'sign-up' ? (
              <button
                className="ghost-button w-full"
                type="button"
                onClick={() => {
                  setMode('sign-in');
                  setError(null);
                  setMessage(null);
                  onModeChange?.('sign-in');
                }}
              >
                Already have an account? Sign in
              </button>
            ) : null}

            {mode === 'reset-password' ? (
              <button
                className="ghost-button w-full"
                type="button"
                onClick={() => {
                  setMode('sign-in');
                  setError(null);
                  setMessage(null);
                  onModeChange?.('sign-in');
                }}
              >
                Back to sign in
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
