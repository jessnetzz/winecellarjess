import { User } from '@supabase/supabase-js';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

interface AccountSettingsProps {
  user: User;
}

function getInitialFullName(user: User) {
  const metadata = user.user_metadata ?? {};
  const candidates = [metadata.full_name, metadata.name, metadata.first_name]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  return candidates[0]?.trim() ?? '';
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [fullName, setFullName] = useState(getInitialFullName(user));
  const [email, setEmail] = useState(user.email ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [detailsMessage, setDetailsMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const initialFullName = useMemo(() => getInitialFullName(user), [user]);
  const initialEmail = user.email ?? '';

  useEffect(() => {
    let active = true;

    setFullName(initialFullName);
    setEmail(initialEmail);

    void authService.getProfile(user.id)
      .then((profile) => {
        if (!active || !profile) return;
        if (profile.full_name?.trim()) setFullName(profile.full_name.trim());
        if (profile.email?.trim()) setEmail(profile.email.trim());
      })
      .catch(() => {
        // Keep auth metadata fallback if profile lookup fails.
      });

    return () => {
      active = false;
    };
  }, [initialEmail, initialFullName, user.id]);

  const detailsChanged = fullName.trim() !== initialFullName || email.trim() !== initialEmail;

  const saveDetails = async (event: FormEvent) => {
    event.preventDefault();
    setDetailsMessage(null);
    setDetailsError(null);

    if (!email.trim()) {
      setDetailsError('Email is required.');
      return;
    }

    setIsSavingDetails(true);
    try {
      await authService.updateProfile(user, { fullName, email });
      setDetailsMessage(
        email.trim() !== initialEmail
          ? 'Profile updated. If you changed your email, Supabase may ask you to confirm it before the new address becomes active.'
          : 'Profile updated.',
      );
    } catch (caught) {
      setDetailsError(caught instanceof Error ? caught.message : 'We could not update your profile just yet.');
    } finally {
      setIsSavingDetails(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (!newPassword.trim()) {
      setPasswordError('Enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Use at least 8 characters so your account stays well protected.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Those passwords do not match yet.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await authService.updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated.');
    } catch (caught) {
      setPasswordError(caught instanceof Error ? caught.message : 'We could not update your password just yet.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <section id="account" className="panel overflow-hidden scroll-mt-32">
      <div className="drink-soon-header border-b border-ink/10 px-5 py-5 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-liam text-[2.2rem] font-normal leading-none text-white sm:text-[2.45rem]">
            Your profile
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Keep your name, email, and password current so your cellar stays personal and secure.
          </p>
        </div>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <form className="soft-card space-y-4" onSubmit={(event) => void saveDetails(event)}>
          <div>
            <p className="section-kicker">Personal details</p>
            <h3 className="mt-2 font-serif text-2xl font-bold text-ink">How your cellar knows you</h3>
            <p className="mt-2 text-sm leading-6 text-smoke">
              Update the name that appears around the app, plus the email tied to your account.
            </p>
          </div>
          <label className="block">
            <span className="field-label">Full name</span>
            <input className="field mt-2" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label className="block">
            <span className="field-label">Email</span>
            <input className="field mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          {detailsError ? (
            <div className="rounded-lg border border-clay/30 bg-clay/10 p-3 text-sm leading-6 text-clay">{detailsError}</div>
          ) : null}
          {detailsMessage ? (
            <div className="rounded-lg border border-moss/25 bg-moss/10 p-3 text-sm leading-6 text-moss">{detailsMessage}</div>
          ) : null}
          <div className="flex justify-end">
            <button className="premium-button" type="submit" disabled={isSavingDetails || !detailsChanged}>
              {isSavingDetails ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>

        <form className="soft-card space-y-4" onSubmit={(event) => void savePassword(event)}>
          <div>
            <p className="section-kicker">Security</p>
            <h3 className="mt-2 font-serif text-2xl font-bold text-ink">Refresh your password</h3>
            <p className="mt-2 text-sm leading-6 text-smoke">
              Choose something new whenever you want a cleaner lock on the cellar.
            </p>
          </div>
          <label className="block">
            <span className="field-label">New password</span>
            <input
              className="field mt-2"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="field-label">Confirm password</span>
            <input
              className="field mt-2"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
          {passwordError ? (
            <div className="rounded-lg border border-clay/30 bg-clay/10 p-3 text-sm leading-6 text-clay">{passwordError}</div>
          ) : null}
          {passwordMessage ? (
            <div className="rounded-lg border border-moss/25 bg-moss/10 p-3 text-sm leading-6 text-moss">{passwordMessage}</div>
          ) : null}
          <div className="flex justify-end">
            <button className="premium-button" type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
