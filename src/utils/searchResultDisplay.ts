import { NaturalLanguageSearchMatch, Wine } from '../types/wine';
import { getDrinkabilityInfo } from './drinkWindow';

type QueryIntent =
  | 'casual'
  | 'drink-now'
  | 'mood'
  | 'occasion'
  | 'pairing'
  | 'patio'
  | 'special'
  | 'tasting'
  | 'general';

function includesAny(source: string, terms: string[]) {
  const normalized = source.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function compactText(value = '', maxLength = 120) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).replace(/\s+\S*$/, '')}...`;
}

function stableIndex(seed: string, length: number) {
  if (!length) return 0;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return hash % length;
}

function pickPhrase(options: string[], seed: string) {
  return options[stableIndex(seed, options.length)];
}

function getQueryIntent(query = ''): QueryIntent {
  const normalized = query.toLowerCase();

  if (includesAny(normalized, ['anniversary', 'birthday', 'special', 'splurge', 'fancy', 'rare', 'celebrate', 'celebration'])) {
    return 'special';
  }

  if (includesAny(normalized, ['patio', 'porch', 'summer', 'pool', 'picnic', 'outside', 'outdoor', 'sunny', 'hot day'])) {
    return 'patio';
  }

  if (includesAny(normalized, ['easy', 'casual', 'weeknight', 'low key', 'low-key', 'no fuss', 'simple'])) {
    return 'casual';
  }

  if (includesAny(normalized, ['pair', 'food', 'seafood', 'salmon', 'steak', 'pasta', 'cheese'])) {
    return 'pairing';
  }

  if (includesAny(normalized, ['friends', 'party', 'company', 'host', 'group', 'dinner'])) {
    return 'occasion';
  }

  if (includesAny(normalized, ['rain', 'snow', 'cozy', 'cold', 'warm', 'night', 'mood', 'quiet', 'comfort'])) {
    return 'mood';
  }

  if (includesAny(normalized, ['ready', 'drink now', 'tonight', 'open', 'peak'])) {
    return 'drink-now';
  }

  if (includesAny(normalized, ['buttery', 'citrus', 'earthy', 'rich', 'bold', 'bright', 'fresh', 'silky', 'tannin'])) {
    return 'tasting';
  }

  return 'general';
}

function isPrestigeBottle(wine: Wine) {
  return (wine.marketValue ?? 0) >= 150 || (wine.purchasePrice ?? 0) >= 125 || (wine.personalRating ?? 0) >= 96;
}

function shouldUsePlayfulTone(intent: QueryIntent, wine: Wine, query: string) {
  if (isPrestigeBottle(wine) || intent === 'special') return false;

  const playfulIntents: QueryIntent[] = ['casual', 'occasion', 'patio', 'mood', 'drink-now'];
  if (!playfulIntents.includes(intent)) return false;

  const normalized = query.toLowerCase();
  if (includesAny(normalized, ['easy', 'patio', 'porch', 'weeknight', 'friends', 'party', 'cozy', 'tonight'])) {
    return true;
  }

  return stableIndex(`${wine.id}-${query}-${wine.name}`, 4) === 0;
}

function readinessPhrase(wine: Wine) {
  const status = getDrinkabilityInfo(wine).status;

  if (status === 'Peak window') return 'right in its peak window';
  if (status === 'Ready to drink') return 'ready to open now';
  if (status === 'Nearing end of peak') return 'well worth opening soon';
  if (status === 'Approaching window') return 'just beginning to look interesting';
  if (status === 'Too young') return 'still a little youthful, but compelling if you want freshness';
  return 'a bottle to open with a little curiosity';
}

function stylePhrase(wine: Wine) {
  if (wine.varietal) return wine.varietal;
  return wine.style.replace('-', ' ');
}

function tastingPhrase(wine: Wine) {
  if (wine.tastingNotes) return compactText(wine.tastingNotes, 96);
  if (wine.aiAdvice) return compactText(wine.aiAdvice, 96);
  return '';
}

function pairingPhrase(wine: Wine) {
  return wine.foodPairingNotes ? compactText(wine.foodPairingNotes, 96) : '';
}

function playfulCloser(intent: QueryIntent, wine: Wine, query: string) {
  if (!shouldUsePlayfulTone(intent, wine, query)) return '';

  const seed = `${wine.id}-${query}-${intent}`;
  const options: Partial<Record<QueryIntent, string[]>> = {
    casual: [
      'A no-fuss winner, basically.',
      'Call it low-stakes luxury.',
      'A weeknight hero with good manners.',
    ],
    'drink-now': [
      'No need to make this one sit politely in the corner.',
      'Beautifully timed and ready whenever you are.',
      'An easy yes from the cellar.',
    ],
    mood: [
      'The kind of bottle that belongs near a blanket.',
      'Quietly charming, which is exactly the assignment.',
      'A happy little bottle for the mood.',
    ],
    occasion: [
      'A crowd-pleaser with good manners.',
      'This bottle knows how to behave at a dinner table.',
      'A dinner-party ringer without the drama.',
    ],
    patio: [
      'A proper porch pounder, in the tasteful sense.',
      'Bright, relaxed, and dangerously easy to drink.',
      'An outdoor-glass easy yes.',
    ],
  };

  return pickPhrase(options[intent] ?? [], seed);
}

function contextualLead(intent: QueryIntent, style: string, query: string) {
  if (intent === 'patio') return `For "${query}", this ${style} leans bright and relaxed.`;
  if (intent === 'special') return `For "${query}", this ${style} keeps things polished and quietly memorable.`;
  if (intent === 'casual') return `For "${query}", this ${style} keeps the mood easy without feeling ordinary.`;
  return '';
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

export function getBestMatchSummary(wine: Wine, match?: NaturalLanguageSearchMatch, query = '') {
  const intent = getQueryIntent(query);
  const style = stylePhrase(wine);
  const readiness = readinessPhrase(wine);
  const tasting = tastingPhrase(wine);
  const pairing = pairingPhrase(wine);
  const region = wine.region || wine.country;
  const quality = match?.qualityBoost ? 'and the rating signal gives it a little extra pull' : '';
  const wink = playfulCloser(intent, wine, query);
  const lead = contextualLead(intent, style, query);

  if (intent === 'pairing' && pairing) {
    return `This ${style} stands out for "${query}" because its pairing notes already point in that direction. It is ${readiness}, so it feels like an easy bottle to trust at the table.`;
  }

  if (intent === 'patio') {
    return `${lead} It is ${readiness}, with enough freshness to feel effortless${wink ? ` — ${wink.toLowerCase()}` : '.'}`;
  }

  if (intent === 'casual') {
    return `${lead} It is ${readiness}, with just enough character to make the glass feel considered${wink ? ` — ${wink.toLowerCase()}` : '.'}`;
  }

  if (intent === 'special') {
    return `This ${style} feels right for "${query}": ${region ? `${region} detail, ` : ''}${readiness}, and enough presence to make the bottle feel intentional.`;
  }

  if (intent === 'occasion') {
    return `This feels like the kind of bottle that works well with company: expressive, table-friendly, and not too fussy. It is ${readiness}${quality ? `, ${quality}` : ''}.${wink ? ` ${wink}` : ''}`;
  }

  if (intent === 'mood') {
    return `This ${style} feels right for "${query}": ${region ? `${region} character, ` : ''}${readiness}, and enough personality to suit the moment.${wink ? ` ${wink}` : ''}`;
  }

  if (intent === 'drink-now') {
    return `This bottle rises to the top because it is ${readiness}. It has the strongest cellar timing for what you asked, without needing much overthinking.${wink ? ` ${wink}` : ''}`;
  }

  if (intent === 'tasting' && tasting) {
    return `${sentenceCase(style)} makes sense here because the notes suggest the kind of profile you are after: ${tasting}. It is ${readiness}, which makes the match feel practical as well as tempting.`;
  }

  if (pairing) {
    return `This ${style} is a strong pick because it is ${readiness} and its pairing notes give it a clear place at the table.`;
  }

  if (tasting) {
    return `This ${style} feels like the best fit because it is ${readiness}, with tasting notes that give the result a little more texture: ${tasting}`;
  }

  if (match?.reason && !match.reason.toLowerCase().includes('matched cellar details')) {
    return `${match.reason} It is ${readiness}, which makes it feel like a thoughtful bottle to consider now.`;
  }

  const parts = [
    style,
    region,
    wine.foodPairingNotes || wine.tastingNotes,
  ].filter(Boolean);

  return parts.length
    ? `This ${style} feels like the right lead because it is ${readiness}, with enough context from your cellar notes to make it worth opening.`
    : `This bottle feels like the best place to start: ${readiness}, easy to understand, and a calm fit for what you searched.`;
}
