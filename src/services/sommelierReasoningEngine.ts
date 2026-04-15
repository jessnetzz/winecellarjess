import { WineProfile, mapWineToProfile } from './wineAttributeMapper';
import { WeatherRecommendationContext } from '../utils/tonightsBottleWeatherMatrix';
import { NaturalLanguageSearchMatch, Wine } from '../types/wine';

export type SommelierQueryType =
  | 'casual'
  | 'drink-now'
  | 'mood'
  | 'occasion'
  | 'pairing'
  | 'patio'
  | 'special'
  | 'tasting'
  | 'general';

export type PairingMode = 'bridge' | 'contrast' | 'echo' | 'timing';
export type SommelierToneMode = 'refined' | 'warm' | 'playful';
export type SommelierContext = 'search' | 'tonight' | 'generic';

export interface DishProfile {
  label: string;
  category: 'food' | 'mood' | 'occasion' | 'weather' | 'drink-now' | 'general';
  weight: 'light' | 'medium' | 'rich';
  texture: string;
  dominantFlavors: string[];
  needs: string[];
  principle: string;
  expected: string;
}

export interface SommelierReasoning {
  queryType: SommelierQueryType;
  queryLabel: string;
  context: SommelierContext;
  dishProfile: DishProfile | null;
  wineProfile: WineProfile;
  pairingMode: PairingMode;
  matchSignals: string[];
  confidence: number;
  keyTraits: string[];
  supportChips: string[];
  toneMode: SommelierToneMode;
}

export interface SommelierRecommendation {
  heading: string;
  body: string;
  reasoning: SommelierReasoning;
}

interface SommelierRecommendationInput {
  wine: Wine;
  query?: string;
  match?: NaturalLanguageSearchMatch;
  weatherContext?: WeatherRecommendationContext | null;
  context?: SommelierContext;
}

type PairingPrinciple = {
  label: string;
  matchType: PairingMode;
  category: DishProfile['category'];
  weight: DishProfile['weight'];
  texture: string;
  dominantFlavors: string[];
  needs: string[];
  principle: string;
  expected: string;
};

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

export function classifySommelierQuery(query = '', weatherContext?: WeatherRecommendationContext | null): SommelierQueryType {
  const normalized = query.toLowerCase();

  if (!normalized && weatherContext) {
    if (weatherContext.temperatureBand === 'warm' || weatherContext.temperatureBand === 'hot') return 'patio';
    if (weatherContext.condition === 'rainy' || weatherContext.condition === 'snow') return 'mood';
    return 'drink-now';
  }

  if (includesAny(normalized, ['anniversary', 'birthday', 'special', 'splurge', 'fancy', 'rare', 'celebrate', 'celebration'])) {
    return 'special';
  }

  if (includesAny(normalized, ['patio', 'porch', 'summer', 'pool', 'picnic', 'outside', 'outdoor', 'sunny', 'hot day'])) {
    return 'patio';
  }

  if (includesAny(normalized, ['easy', 'casual', 'weeknight', 'low key', 'low-key', 'no fuss', 'simple'])) {
    return 'casual';
  }

  if (includesAny(normalized, ['pair', 'food', 'seafood', 'salmon', 'steak', 'pasta', 'cheese', 'mushroom', 'fried'])) {
    return 'pairing';
  }

  if (includesAny(normalized, ['friends', 'party', 'company', 'host', 'group', 'dinner', 'date night'])) {
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

function getPairingPrinciple(query = '', weatherContext?: WeatherRecommendationContext | null): PairingPrinciple | null {
  const normalized = query.toLowerCase();

  if (includesAny(normalized, ['goat cheese', 'chèvre', 'chevre'])) {
    return {
      label: 'goat cheese',
      matchType: 'contrast',
      category: 'food',
      weight: 'light',
      texture: 'creamy and tangy',
      dominantFlavors: ['tangy', 'fresh', 'herbal'],
      needs: ['brightness', 'lift', 'clean finish'],
      principle: 'Goat cheese usually loves brightness, lift, and a clean finish; acidity keeps the tang lively instead of heavy.',
      expected: 'Expect a fresh, lightly textured match that cuts through the creaminess without bullying the cheese.',
    };
  }

  if (includesAny(normalized, ['salmon', 'fish', 'seafood'])) {
    return {
      label: includesAny(normalized, ['salmon']) ? 'salmon' : 'seafood',
      matchType: 'bridge',
      category: 'food',
      weight: 'medium',
      texture: 'silky and rich',
      dominantFlavors: ['briny', 'clean', 'savory'],
      needs: ['freshness', 'enough body', 'soft texture'],
      principle: 'Salmon wants freshness and texture: enough acidity to keep the fish bright, with enough body to meet its richness.',
      expected: 'Expect a pairing that feels clean, polished, and food-friendly rather than sharp or thin.',
    };
  }

  if (includesAny(normalized, ['steak', 'ribeye', 'burger', 'beef'])) {
    return {
      label: includesAny(normalized, ['burger']) ? 'burgers' : 'steak',
      matchType: 'contrast',
      category: 'food',
      weight: 'rich',
      texture: 'fatty and charred',
      dominantFlavors: ['savory', 'smoky', 'rich'],
      needs: ['structure', 'tannin', 'depth'],
      principle: 'Steak generally likes structure: tannin, darker fruit, and enough body to stand up to fat and char.',
      expected: 'Expect a deeper, more savory glass that can handle the richness instead of disappearing beside it.',
    };
  }

  if (includesAny(normalized, ['pasta', 'tomato', 'pizza'])) {
    return {
      label: includesAny(normalized, ['pizza']) ? 'pizza' : 'pasta',
      matchType: 'bridge',
      category: 'food',
      weight: 'medium',
      texture: 'saucy',
      dominantFlavors: ['bright', 'savory', 'herbal'],
      needs: ['freshness', 'moderate body', 'bright fruit'],
      principle: 'Tomato and pasta tend to reward freshness, moderate body, and fruit that does not fight the sauce.',
      expected: 'Expect something table-friendly and easy to keep reaching for between bites.',
    };
  }

  if (includesAny(normalized, ['mushroom', 'mushrooms', 'risotto'])) {
    return {
      label: includesAny(normalized, ['risotto']) ? 'mushroom risotto' : 'mushrooms',
      matchType: 'echo',
      category: 'food',
      weight: 'medium',
      texture: 'savory and earthy',
      dominantFlavors: ['earthy', 'umami', 'woodsy'],
      needs: ['earthiness', 'savory depth', 'texture'],
      principle: 'Mushroom dishes usually like wines with earth, savory depth, or softly red-fruited lift — something that echoes their depth rather than fighting it.',
      expected: 'Expect a pairing that feels layered and quietly satisfying, with the wine picking up the savory side of the dish.',
    };
  }

  if (includesAny(normalized, ['fried', 'fried chicken', 'tempura'])) {
    return {
      label: includesAny(normalized, ['fried chicken']) ? 'fried chicken' : 'fried food',
      matchType: 'contrast',
      category: 'food',
      weight: 'rich',
      texture: 'crisp and fatty',
      dominantFlavors: ['salty', 'rich', 'crispy'],
      needs: ['acid or bubbles', 'freshness', 'palate reset'],
      principle: 'Fried food usually wants acid, bubbles, or both — something to reset the palate and keep each bite lively instead of heavy.',
      expected: 'Expect the wine to clean things up between bites rather than adding more weight.',
    };
  }

  if (includesAny(normalized, ['cheese'])) {
    return {
      label: 'cheese',
      matchType: 'contrast',
      category: 'food',
      weight: 'medium',
      texture: 'salty and creamy',
      dominantFlavors: ['salty', 'creamy'],
      needs: ['cleansing acidity', 'texture', 'fruit softness'],
      principle: 'Cheese usually works best when the wine has either cleansing acidity, generous texture, or enough fruit to soften salt and cream.',
      expected: 'Expect the wine to refresh the palate while keeping the pairing relaxed.',
    };
  }

  if (weatherContext && !normalized) {
    const isWarm = weatherContext.temperatureBand === 'warm' || weatherContext.temperatureBand === 'hot';
    return {
      label: isWarm ? 'the evening' : 'tonight',
      matchType: 'bridge',
      category: weatherContext.condition === 'rainy' || weatherContext.condition === 'snow' ? 'weather' : 'drink-now',
      weight: isWarm ? 'light' : 'medium',
      texture: isWarm ? 'fresh and easy' : 'comforting and textured',
      dominantFlavors: [weatherContext.mood],
      needs: isWarm ? ['freshness', 'lift', 'easy drinkability'] : ['warmth', 'depth', 'readiness'],
      principle: isWarm
        ? 'Warmer evenings usually want freshness, ease, and enough lift to keep the bottle feeling relaxed.'
        : 'Evening picks usually work best when they feel ready, comforting, and easy to enjoy without much ceremony.',
      expected: isWarm
        ? 'Expect something refreshing and sociable rather than weighty.'
        : 'Expect a bottle that feels naturally suited to the moment.',
    };
  }

  return null;
}

function isPrestigeBottle(wine: Wine) {
  return (wine.marketValue ?? 0) >= 150 || (wine.purchasePrice ?? 0) >= 125 || (wine.personalRating ?? 0) >= 96;
}

function shouldUsePlayfulTone(intent: SommelierQueryType, wine: Wine, query: string) {
  if (isPrestigeBottle(wine) || intent === 'special') return false;
  const playfulIntents: SommelierQueryType[] = ['casual', 'occasion', 'patio', 'mood', 'drink-now'];
  if (!playfulIntents.includes(intent)) return false;
  const normalized = query.toLowerCase();
  if (includesAny(normalized, ['easy', 'patio', 'porch', 'weeknight', 'friends', 'party', 'cozy', 'tonight'])) return true;
  return stableIndex(`${wine.id}-${query}-${wine.name}`, 4) === 0;
}

function determineToneMode(intent: SommelierQueryType, wine: Wine, query: string): SommelierToneMode {
  return shouldUsePlayfulTone(intent, wine, query) ? 'playful' : intent === 'special' || isPrestigeBottle(wine) ? 'refined' : 'warm';
}

function tastingPhrase(wine: Wine) {
  if (wine.tastingNotes) return compactText(wine.tastingNotes, 96);
  if (wine.aiAdvice) return compactText(wine.aiAdvice, 96);
  return '';
}

function pairingPhrase(wine: Wine) {
  return wine.foodPairingNotes ? compactText(wine.foodPairingNotes, 96) : '';
}

function playfulCloser(intent: SommelierQueryType, wine: Wine, query: string) {
  if (!shouldUsePlayfulTone(intent, wine, query)) return '';
  const seed = `${wine.id}-${query}-${intent}`;
  const options: Partial<Record<SommelierQueryType, string[]>> = {
    casual: ['A no-fuss winner, basically.', 'Call it low-stakes luxury.', 'A weeknight hero with good manners.'],
    'drink-now': ['No need to make this one sit politely in the corner.', 'Beautifully timed and ready whenever you are.', 'An easy yes from the cellar.'],
    mood: ['The kind of bottle that belongs near a blanket.', 'Quietly charming, which is exactly the assignment.', 'A happy little bottle for the mood.'],
    occasion: ['A crowd-pleaser with good manners.', 'This bottle knows how to behave at a dinner table.', 'A dinner-party ringer without the drama.'],
    patio: ['A proper porch pounder, in the tasteful sense.', 'Bright, relaxed, and dangerously easy to drink.', 'An outdoor-glass easy yes.'],
  };
  return pickPhrase(options[intent] ?? [], seed);
}

function determinePairingMode(intent: SommelierQueryType, principle: PairingPrinciple | null): PairingMode {
  if (principle) return principle.matchType;
  if (intent === 'drink-now') return 'timing';
  if (intent === 'mood' || intent === 'occasion') return 'bridge';
  return 'contrast';
}

function getQueryLabel(query = '', weatherContext?: WeatherRecommendationContext | null, context: SommelierContext = 'search') {
  if (query.trim()) return query.trim();
  if (context === 'tonight') return 'tonight';
  if (weatherContext) return weatherContext.mood;
  return 'this bottle';
}

function contextualLead(intent: SommelierQueryType, style: string, query: string) {
  if (intent === 'patio') return `For "${query}", this ${style} leans bright and relaxed.`;
  if (intent === 'special') return `For "${query}", this ${style} keeps things polished and quietly memorable.`;
  if (intent === 'casual') return `For "${query}", this ${style} keeps the mood easy without feeling ordinary.`;
  return '';
}

function buildDishProfile(queryType: SommelierQueryType, query: string, weatherContext?: WeatherRecommendationContext | null): DishProfile | null {
  const principle = getPairingPrinciple(query, weatherContext);
  if (principle) {
    return {
      label: principle.label,
      category: principle.category,
      weight: principle.weight,
      texture: principle.texture,
      dominantFlavors: principle.dominantFlavors,
      needs: principle.needs,
      principle: principle.principle,
      expected: principle.expected,
    };
  }

  if (queryType === 'occasion') {
    return {
      label: 'company',
      category: 'occasion',
      weight: 'medium',
      texture: 'flexible and table-friendly',
      dominantFlavors: ['social', 'relaxed'],
      needs: ['range', 'freshness', 'polish'],
      principle: 'Dinner with friends usually wants a wine that is generous, flexible, and easy to keep pouring.',
      expected: 'Expect something that feels good with food and good with conversation.',
    };
  }

  if (queryType === 'mood' || (weatherContext && queryType !== 'pairing')) {
    return {
      label: getQueryLabel(query, weatherContext, 'tonight'),
      category: weatherContext ? 'weather' : 'mood',
      weight: weatherContext?.temperatureBand === 'cold' ? 'rich' : 'medium',
      texture: weatherContext?.temperatureBand === 'warm' ? 'fresh and light' : 'comforting and layered',
      dominantFlavors: [weatherContext?.mood ?? 'cozy'],
      needs: weatherContext?.temperatureBand === 'warm' ? ['lift', 'freshness'] : ['depth', 'comfort', 'readiness'],
      principle: weatherContext?.temperatureBand === 'warm'
        ? 'Warmer evenings usually want wines with freshness, lift, and easy drinkability.'
        : 'Cozier evenings usually want a bottle with warmth, texture, or a little savory depth.',
      expected: 'Expect the bottle to feel emotionally right for the moment as well as technically sound.',
    };
  }

  if (queryType === 'drink-now') {
    return {
      label: 'right now',
      category: 'drink-now',
      weight: 'medium',
      texture: 'open and integrated',
      dominantFlavors: ['ready', 'open'],
      needs: ['readiness', 'integration', 'drinkability'],
      principle: 'Drink-now picks are mostly about timing: the wine should feel open, balanced, and ready to give pleasure now.',
      expected: 'Expect a bottle that feels expressive rather than shut down or tired.',
    };
  }

  return null;
}

function buildSupportChips(
  queryType: SommelierQueryType,
  wineProfile: WineProfile,
  wine: Wine,
  match?: NaturalLanguageSearchMatch,
) {
  const chips = [wineProfile.acidity, wineProfile.texture, wineProfile.finish];
  if (queryType === 'drink-now' || match?.readinessBoost) chips.push('Ready now');
  if (wineProfile.tannin.includes('firm')) chips.push('Firm tannin');
  if (wineProfile.fruitProfile) chips.push(sentenceCase(wineProfile.fruitProfile));
  if (wine.foodPairingNotes) chips.push('Pairing notes');
  if (match?.qualityBoost) chips.push('Rating signal');
  return Array.from(new Set(chips)).slice(0, 3);
}

function computeConfidence(queryType: SommelierQueryType, wine: Wine, match?: NaturalLanguageSearchMatch) {
  let confidence = 0.62;
  if (queryType === 'pairing' && wine.foodPairingNotes) confidence += 0.12;
  if (wine.tastingNotes) confidence += 0.08;
  if (match?.semanticScore) confidence += Math.min(0.12, match.semanticScore * 0.12);
  if (match?.keywordScore) confidence += Math.min(0.08, match.keywordScore * 0.2);
  return Math.min(0.96, Number(confidence.toFixed(2)));
}

export function buildSommelierReasoning(input: SommelierRecommendationInput): SommelierReasoning {
  const context = input.context ?? 'search';
  const queryType = classifySommelierQuery(input.query ?? '', input.weatherContext);
  const queryLabel = getQueryLabel(input.query, input.weatherContext, context);
  const dishProfile = buildDishProfile(queryType, input.query ?? '', input.weatherContext);
  const wineProfile = mapWineToProfile(input.wine);
  const pairingMode = determinePairingMode(queryType, getPairingPrinciple(input.query ?? '', input.weatherContext));
  const toneMode = determineToneMode(queryType, input.wine, input.query ?? '');
  const matchSignals = [
    ...(dishProfile?.needs ?? []),
    ...wineProfile.keyTraits,
    input.match?.reason ? input.match.reason : '',
  ].filter(Boolean).slice(0, 6);

  return {
    queryType,
    queryLabel,
    context,
    dishProfile,
    wineProfile,
    pairingMode,
    matchSignals,
    confidence: computeConfidence(queryType, input.wine, input.match),
    keyTraits: wineProfile.keyTraits,
    supportChips: buildSupportChips(queryType, wineProfile, input.wine, input.match),
    toneMode,
  };
}

export function composeSommelierRecommendation(reasoning: SommelierReasoning, wine: Wine, match?: NaturalLanguageSearchMatch, query = ''): SommelierRecommendation {
  const { queryType: intent, dishProfile, wineProfile, toneMode, context } = reasoning;
  const style = wineProfile.styleLabel;
  const readiness = wineProfile.readiness;
  const tasting = tastingPhrase(wine);
  const pairing = pairingPhrase(wine);
  const region = wine.region || wine.country;
  const quality = match?.qualityBoost ? 'and the rating signal gives it a little extra pull' : '';
  const wink = toneMode === 'playful' ? playfulCloser(intent, wine, query) : '';
  const lead = contextualLead(intent, style, query);

  if (dishProfile && dishProfile.category === 'food') {
    const modeSentence =
      reasoning.pairingMode === 'contrast'
        ? 'That works mainly by contrast'
        : reasoning.pairingMode === 'echo'
          ? 'That works mainly by echo'
          : 'That works mainly by bridge';

    return {
      heading: `Why it works with ${dishProfile.label}`,
      body: `${dishProfile.principle} ${modeSentence}: this ${style} brings ${wineProfile.acidity}, ${wineProfile.texture}, and ${wineProfile.finish}, while sitting ${readiness}${tasting ? `, with notes that suggest ${tasting.toLowerCase()}` : ''}. ${dishProfile.expected}`,
      reasoning,
    };
  }

  if (intent === 'patio') {
    return {
      heading: 'Why it works outside',
      body: `${lead} Patio wines need freshness, ease, and a clean enough finish to stay lively as the glass warms. This ${style} brings ${wineProfile.acidity}, ${wineProfile.finish}, and ${wineProfile.fruitProfile} charm, and it is ${readiness}${wink ? ` — ${wink.toLowerCase()}` : '.'}`,
      reasoning,
    };
  }

  if (intent === 'casual') {
    return {
      heading: 'Why it works casually',
      body: `${lead} A good casual bottle should have enough shape to feel intentional without demanding ceremony. This ${style} brings ${wineProfile.fruitProfile} fruit, ${wineProfile.texture}, and is ${readiness}${wink ? ` — ${wink.toLowerCase()}` : '.'}`,
      reasoning,
    };
  }

  if (intent === 'special') {
    return {
      heading: 'Why it feels special',
      body: `Special bottles need presence: structure, detail, and a finish that feels worth slowing down for. This ${style} brings ${region ? `${region} character, ` : ''}${wineProfile.body}, ${wineProfile.tannin}, and a ${wineProfile.finish}, and it is ${readiness}.`,
      reasoning,
    };
  }

  if (intent === 'occasion') {
    return {
      heading: 'Why it works for company',
      body: `Dinner-party wines need range: enough flavor to be interesting, enough freshness to stay table-friendly, and enough polish not to hijack the meal. This ${style} brings ${wineProfile.acidity}, ${wineProfile.texture}, and ${wineProfile.fruitProfile} appeal, and it is ${readiness}${quality ? `, ${quality}` : ''}.${wink ? ` ${wink}` : ''}`,
      reasoning,
    };
  }

  if (intent === 'mood') {
    return {
      heading: context === 'tonight' ? 'Why tonight' : 'Why it fits the mood',
      body: `Mood matters: cozy searches usually want texture, darker fruit, or a little savory depth, while warmer moods want lift and freshness. This ${style} brings ${region ? `${region} character, ` : ''}${wineProfile.texture}, ${wineProfile.fruitProfile} fruit, and it is ${readiness}.${wink ? ` ${wink}` : ''}`,
      reasoning,
    };
  }

  if (intent === 'drink-now') {
    return {
      heading: context === 'tonight' ? 'Why tonight' : 'Why it is ready',
      body: `The strongest signal here is timing. This bottle is ${readiness}, so the ${wineProfile.fruitProfile} fruit, ${wineProfile.tannin}, and ${wineProfile.finish} are more likely to feel integrated now rather than awkwardly young or tired.${wink ? ` ${wink}` : ''}`,
      reasoning,
    };
  }

  if (intent === 'tasting' && tasting) {
    return {
      heading: 'Why the flavor profile fits',
      body: `${sentenceCase(style)} makes sense here because the notes suggest ${tasting.toLowerCase()}. The useful bit is not just flavor matching; it is the way ${wineProfile.acidity}, ${wineProfile.texture}, and ${wineProfile.finish} can carry those notes while the bottle is ${readiness}.`,
      reasoning,
    };
  }

  if (pairing) {
    return {
      heading: 'Why it works',
      body: `This ${style} is a strong pick because it is ${readiness} and has enough ${wineProfile.body}, ${wineProfile.acidity}, and ${wineProfile.texture} to make sense with food. The pairing notes give it a clear lane at the table without overcomplicating the bottle.`,
      reasoning,
    };
  }

  if (match?.reason && !match.reason.toLowerCase().includes('matched cellar details')) {
    return {
      heading: 'Why it works',
      body: `${match.reason} The practical reason to consider it is timing: it is ${readiness}, so the bottle has a better chance of feeling complete in the glass, with ${wineProfile.body} and ${wineProfile.finish} showing a little more harmony.`,
      reasoning,
    };
  }

  return {
    heading: context === 'tonight' ? 'Why tonight' : 'Why it works',
    body: `This ${style} feels like the right lead because it is ${readiness}, with enough ${wineProfile.body}, ${wineProfile.acidity}, and ${wineProfile.texture} to make the recommendation feel grounded even without a long tasting history.`,
    reasoning,
  };
}

export function buildSommelierRecommendation(input: SommelierRecommendationInput): SommelierRecommendation {
  const reasoning = buildSommelierReasoning(input);
  return composeSommelierRecommendation(reasoning, input.wine, input.match, input.query ?? '');
}
