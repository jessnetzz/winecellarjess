import { NaturalLanguageSearchResult } from '../types/wine';

export async function searchWinesNaturally(
  query: string,
  accessToken: string,
  limit = 40,
): Promise<NaturalLanguageSearchResult> {
  const response = await fetch('/api/search-wines', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, limit }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Natural-language search is unavailable right now.');
  }

  return payload as NaturalLanguageSearchResult;
}

