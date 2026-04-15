import { User } from '@supabase/supabase-js';

function toTitleCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getRawName(user: User) {
  const metadata = user.user_metadata ?? {};
  const candidates = [
    metadata.first_name,
    metadata.full_name,
    metadata.name,
    typeof user.email === 'string' ? user.email.split('@')[0] : '',
  ];

  return candidates.find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0)?.trim() ?? '';
}

export function getUserFirstName(user: User) {
  const rawName = getRawName(user);
  if (!rawName) return '';
  const firstToken = rawName.split(/\s+/)[0] ?? rawName;
  return toTitleCase(firstToken.replace(/[._-]+/g, ' ')).trim().split(/\s+/)[0] ?? '';
}

export function getUserCellarLabel(user: User) {
  const firstName = getUserFirstName(user);
  if (!firstName) return 'Private Cellar';
  const possessive = firstName.endsWith('s') ? `${firstName}'` : `${firstName}'s`;
  return `${possessive} Private Cellar`;
}

