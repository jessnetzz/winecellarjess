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

interface PairingPrinciple {
  label: string;
  matchType: 'bridge' | 'contrast' | 'echo';
  needs: string[];
  principle: string;
  expected: string;
}

interface WineTraits {
  body: string;
  acidity: string;
  tannin: string;
  texture: string;
  fruitProfile: string;
  minerality: string;
  finish: string;
  strengths: string[];
}

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

function getPairingPrinciple(query = ''): PairingPrinciple | null {
  const normalized = query.toLowerCase();

  if (includesAny(normalized, ['goat cheese', 'chèvre', 'chevre'])) {
    return {
      label: 'goat cheese',
      matchType: 'contrast',
      needs: ['brightness', 'lift', 'clean finish'],
      principle: 'Goat cheese usually loves brightness, lift, and a clean finish; acidity keeps the tang lively instead of heavy.',
      expected: 'Expect a fresh, lightly textured match that cuts through the creaminess without bullying the cheese.',
    };
  }

  if (includesAny(normalized, ['salmon', 'fish', 'seafood'])) {
    return {
      label: includesAny(normalized, ['salmon']) ? 'salmon' : 'seafood',
      matchType: 'bridge',
      needs: ['freshness', 'enough body', 'soft texture'],
      principle: 'Salmon wants freshness and texture: enough acidity to keep the fish bright, with enough body to meet its richness.',
      expected: 'Expect a pairing that feels clean, polished, and food-friendly rather than sharp or thin.',
    };
  }

  if (includesAny(normalized, ['steak', 'ribeye', 'burger', 'beef'])) {
    return {
      label: includesAny(normalized, ['burger']) ? 'burgers' : 'steak',
      matchType: 'contrast',
      needs: ['structure', 'tannin', 'depth'],
      principle: 'Steak generally likes structure: tannin, darker fruit, and enough body to stand up to fat and char.',
      expected: 'Expect a deeper, more savory glass that can handle the richness instead of disappearing beside it.',
    };
  }

  if (includesAny(normalized, ['pasta', 'tomato', 'pizza'])) {
    return {
      label: includesAny(normalized, ['pizza']) ? 'pizza' : 'pasta',
      matchType: 'bridge',
      needs: ['freshness', 'moderate body', 'bright fruit'],
      principle: 'Tomato and pasta tend to reward freshness, moderate body, and fruit that does not fight the sauce.',
      expected: 'Expect something table-friendly and easy to keep reaching for between bites.',
    };
  }

  if (includesAny(normalized, ['mushroom', 'mushrooms', 'risotto'])) {
    return {
      label: includesAny(normalized, ['risotto']) ? 'mushroom risotto' : 'mushrooms',
      matchType: 'echo',
      needs: ['earthiness', 'savory depth', 'texture'],
      principle: 'Mushroom dishes usually like wines with earth, savory depth, or softly red-fruited lift — something that echoes their depth rather than fighting it.',
      expected: 'Expect a pairing that feels layered and quietly satisfying, with the wine picking up the savory side of the dish.',
    };
  }

  if (includesAny(normalized, ['fried', 'fried chicken', 'tempura'])) {
    return {
      label: includesAny(normalized, ['fried chicken']) ? 'fried chicken' : 'fried food',
      matchType: 'contrast',
      needs: ['acid or bubbles', 'freshness', 'palate reset'],
      principle: 'Fried food usually wants acid, bubbles, or both — something to reset the palate and keep each bite lively instead of heavy.',
      expected: 'Expect the wine to clean things up between bites rather than adding more weight.',
    };
  }

  if (includesAny(normalized, ['cheese'])) {
    return {
      label: 'cheese',
      matchType: 'contrast',
      needs: ['cleansing acidity', 'texture', 'fruit softness'],
      principle: 'Cheese usually works best when the wine has either cleansing acidity, generous texture, or enough fruit to soften salt and cream.',
      expected: 'Expect the wine to refresh the palate while keeping the pairing relaxed.',
    };
  }

  return null;
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

function getWineTraits(wine: Wine): WineTraits {
  const source = [wine.varietal, wine.style, wine.tastingNotes, wine.aiAdvice, wine.foodPairingNotes].join(' ').toLowerCase();
  const strengths: string[] = [];

  const acidity = includesAny(source, ['sauvignon', 'riesling', 'chenin', 'chablis', 'citrus', 'bright', 'fresh', 'crisp', 'lifted'])
    ? 'bright acidity'
    : includesAny(source, ['chardonnay', 'pinot gris', 'stone fruit', 'orchard'])
      ? 'moderate freshness'
      : 'steady freshness';
  if (acidity) strengths.push(acidity);

  const body = includesAny(source, ['cabernet', 'syrah', 'shiraz', 'malbec', 'full', 'rich', 'bold'])
    ? 'fuller body'
    : includesAny(source, ['pinot', 'gamay', 'rose', 'rosé', 'light', 'delicate'])
      ? 'lighter body'
      : 'medium body';
  strengths.push(body);

  const tannin = includesAny(source, ['cabernet', 'nebbiolo', 'syrah', 'malbec', 'tannin', 'structured'])
    ? 'firm tannin'
    : includesAny(source, ['pinot', 'gamay', 'soft', 'silky'])
      ? 'gentle tannin'
      : 'soft structure';

  const texture = includesAny(source, ['cream', 'round', 'texture', 'butter', 'polished'])
    ? 'round texture'
    : includesAny(source, ['sparkling', 'taut', 'lean', 'precise'])
      ? 'taut texture'
      : 'supple texture';
  strengths.push(texture);

  const fruitProfile = includesAny(source, ['cherry', 'berry', 'red fruit', 'pinot', 'grenache', 'gamay'])
    ? 'red-fruited'
    : includesAny(source, ['blackberry', 'plum', 'dark fruit', 'cabernet', 'syrah', 'malbec'])
      ? 'darker-fruited'
      : includesAny(source, ['citrus', 'lemon', 'lime', 'green apple'])
        ? 'citrusy'
        : includesAny(source, ['pear', 'apple', 'stone fruit', 'peach'])
          ? 'orchard-fruited'
          : 'fruit-led';

  const minerality = includesAny(source, ['mineral', 'chalk', 'saline', 'shell', 'chablis']) ? 'mineral lift' : 'soft mineral edge';
  const finish = includesAny(source, ['long finish', 'persistent', 'saline', 'clean finish']) ? 'clean finish' : 'polished finish';

  return {
    body,
    acidity,
    tannin,
    texture,
    fruitProfile,
    minerality,
    finish,
    strengths: Array.from(new Set(strengths)).slice(0, 3),
  };
}

function wineStructurePhrase(wine: Wine) {
  const source = [wine.varietal, wine.style, wine.tastingNotes, wine.aiAdvice].join(' ').toLowerCase();
  const descriptors: string[] = [];

  if (includesAny(source, ['sauvignon', 'albariño', 'albarino', 'riesling', 'chenin', 'chablis', 'citrus', 'mineral', 'bright', 'fresh'])) {
    descriptors.push('brightness');
  }

  if (includesAny(source, ['chardonnay', 'viognier', 'marsanne', 'roussanne', 'butter', 'cream', 'round', 'texture', 'honey'])) {
    descriptors.push('texture');
  }

  if (includesAny(source, ['cabernet', 'syrah', 'shiraz', 'malbec', 'nebbiolo', 'tannin', 'structured', 'bold'])) {
    descriptors.push('structure');
  }

  if (includesAny(source, ['pinot', 'grenache', 'gamay', 'rose', 'rosé', 'red fruit', 'cherry', 'silky'])) {
    descriptors.push('fresh fruit');
  }

  if (includesAny(source, ['sparkling', 'champagne', 'crémant', 'cremant', 'cava', 'prosecco'])) {
    descriptors.push('bubbles and lift');
  }

  if (includesAny(source, ['earth', 'savory', 'leather', 'mushroom', 'herb'])) {
    descriptors.push('savory depth');
  }

  const unique = Array.from(new Set(descriptors)).slice(0, 2);
  return unique.length ? unique.join(' and ') : 'balance';
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

export function getBestMatchNote(wine: Wine, match?: NaturalLanguageSearchMatch, query = '') {
  const intent = getQueryIntent(query);
  const pairingPrinciple = getPairingPrinciple(query);
  const style = stylePhrase(wine);
  const readiness = readinessPhrase(wine);
  const tasting = tastingPhrase(wine);
  const pairing = pairingPhrase(wine);
  const region = wine.region || wine.country;
  const quality = match?.qualityBoost ? 'and the rating signal gives it a little extra pull' : '';
  const wink = playfulCloser(intent, wine, query);
  const lead = contextualLead(intent, style, query);
  const structure = wineStructurePhrase(wine);
  const traits = getWineTraits(wine);

  if (pairingPrinciple) {
    const matchTypePhrase = pairingPrinciple.matchType === 'contrast'
      ? 'That is mostly a contrast pairing'
      : pairingPrinciple.matchType === 'echo'
        ? 'That is mostly an echo pairing'
        : 'That works more as a bridge pairing';
    return {
      heading: `Why it works with ${pairingPrinciple.label}`,
      body: `${pairingPrinciple.principle} ${matchTypePhrase}: this ${style} brings ${traits.acidity}, ${traits.texture}, and ${traits.finish}, while sitting ${readiness}${tasting ? `, with notes that suggest ${tasting.toLowerCase()}` : ''}. ${pairingPrinciple.expected}`,
    };
  }

  if (intent === 'pairing' && pairing) {
    return {
      heading: 'Why it works at the table',
      body: `Good pairings are about weight, freshness, and texture. This ${style} looks strong here because it brings ${traits.acidity}, ${traits.texture}, and enough ${traits.body} to stay present without crowding the plate, and it is ${readiness}.`,
    };
  }

  if (intent === 'patio') {
    return {
      heading: 'Why it works outside',
      body: `${lead} Patio wines need freshness, ease, and a clean enough finish to stay lively as the glass warms. This ${style} brings ${traits.acidity}, ${traits.finish}, and ${traits.fruitProfile} charm, and it is ${readiness}${wink ? ` — ${wink.toLowerCase()}` : '.'}`,
    };
  }

  if (intent === 'casual') {
    return {
      heading: 'Why it works casually',
      body: `${lead} A good casual bottle should have enough shape to feel intentional without demanding ceremony. This ${style} brings ${traits.fruitProfile} fruit, ${traits.texture}, and is ${readiness}${wink ? ` — ${wink.toLowerCase()}` : '.'}`,
    };
  }

  if (intent === 'special') {
    return {
      heading: 'Why it feels special',
      body: `Special bottles need presence: structure, detail, and a finish that feels worth slowing down for. This ${style} brings ${region ? `${region} character, ` : ''}${traits.body}, ${traits.tannin}, and a ${traits.finish}, and it is ${readiness}.`,
    };
  }

  if (intent === 'occasion') {
    return {
      heading: 'Why it works for company',
      body: `Dinner-party wines need range: enough flavor to be interesting, enough freshness to stay table-friendly, and enough polish not to hijack the meal. This ${style} brings ${traits.acidity}, ${traits.texture}, and ${traits.fruitProfile} appeal, and it is ${readiness}${quality ? `, ${quality}` : ''}.${wink ? ` ${wink}` : ''}`,
    };
  }

  if (intent === 'mood') {
    return {
      heading: 'Why it fits the mood',
      body: `Mood matters: cozy searches usually want texture, darker fruit, or a little savory depth, while warmer moods want lift and freshness. This ${style} brings ${region ? `${region} character, ` : ''}${traits.texture}, ${traits.fruitProfile} fruit, and it is ${readiness}.${wink ? ` ${wink}` : ''}`,
    };
  }

  if (intent === 'drink-now') {
    return {
      heading: 'Why it is ready',
      body: `The strongest signal here is timing. This bottle is ${readiness}, so the ${traits.fruitProfile} fruit, ${traits.tannin}, and ${traits.finish} are more likely to feel integrated now rather than awkwardly young or tired.${wink ? ` ${wink}` : ''}`,
    };
  }

  if (intent === 'tasting' && tasting) {
    return {
      heading: 'Why the flavor profile fits',
      body: `${sentenceCase(style)} makes sense here because the notes suggest ${tasting.toLowerCase()}. The useful bit is not just flavor matching; it is the way ${traits.acidity}, ${traits.texture}, and ${traits.finish} can carry those notes while the bottle is ${readiness}.`,
    };
  }

  if (pairing) {
    return {
      heading: 'Why it works',
      body: `This ${style} is a strong pick because it is ${readiness} and has enough ${traits.body}, ${traits.acidity}, and ${traits.texture} to make sense with food. The pairing notes give it a clear lane at the table without overcomplicating the bottle.`,
    };
  }

  if (tasting) {
    return {
      heading: 'Why it works',
      body: `This ${style} feels like the best fit because it is ${readiness}, with notes that suggest ${tasting.toLowerCase()}. Expect ${traits.acidity}, ${traits.texture}, and ${traits.finish} to be the thread that keeps the wine feeling balanced.`,
    };
  }

  if (match?.reason && !match.reason.toLowerCase().includes('matched cellar details')) {
    return {
      heading: 'Why it works',
      body: `${match.reason} The practical reason to consider it is timing: it is ${readiness}, so the bottle has a better chance of feeling complete in the glass, with ${traits.body} and ${traits.finish} showing a little more harmony.`,
    };
  }

  return {
    heading: 'Why it works',
    body: `This ${style} feels like the right lead because it is ${readiness}, with enough ${traits.body}, ${traits.acidity}, and ${traits.texture} to make the recommendation feel grounded even without a long tasting history.`,
  };
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
  return getBestMatchNote(wine, match, query).body;
}
