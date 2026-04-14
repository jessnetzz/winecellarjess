import { NaturalLanguageSearchMatch, Wine } from '../types/wine';

function includesAny(source: string, terms: string[]) {
  const normalized = source.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

export function getSearchMatchLabel(match: NaturalLanguageSearchMatch) {
  if (match.keywordScore > 0.08 && match.semanticScore > 0.58) return 'Exact + AI match';
  if (match.keywordScore > 0.08) return 'Exact match';
  if (match.readinessBoost > 0) return 'Drink-window match';
  return 'AI meaning match';
}

export function getSearchMatchChips(match: NaturalLanguageSearchMatch, wine: Wine, query = '') {
  const chips: string[] = [];
  const normalizedQuery = query.toLowerCase();
  const pairingIntent = ['food', 'pair', 'dinner', 'seafood', 'salmon', 'steak', 'pasta', 'cheese'];
  const tastingIntent = ['note', 'taste', 'buttery', 'citrus', 'earthy', 'rich', 'bold', 'bright', 'cozy'];

  if ((includesAny(normalizedQuery, pairingIntent) || match.reason.toLowerCase().includes('pairing')) && wine.foodPairingNotes) {
    chips.push('Pairing notes');
  }

  if ((includesAny(normalizedQuery, tastingIntent) || match.reason.toLowerCase().includes('tasting')) && wine.tastingNotes) {
    chips.push('Tasting notes');
  }

  if (match.readinessBoost > 0) chips.push('Drink window: now');
  if (match.keywordScore > 0.08) chips.push('Exact cellar text');
  if (match.semanticScore > 0.58) chips.push('AI suggestion');
  if (wine.varietal) chips.push(`Style: ${wine.varietal}`);
  if (match.qualityBoost > 0) chips.push('Rating signal');

  return Array.from(new Set(chips.length ? chips : ['Cellar context'])).slice(0, 3);
}

export function getBestMatchSummary(wine: Wine, match?: NaturalLanguageSearchMatch) {
  if (match?.reason) return match.reason;

  const parts = [
    wine.varietal || wine.style,
    wine.region || wine.country,
    wine.foodPairingNotes || wine.tastingNotes,
  ].filter(Boolean);

  return parts.length
    ? parts.join(' · ')
    : 'A strong visible result from your current cellar search.';
}
