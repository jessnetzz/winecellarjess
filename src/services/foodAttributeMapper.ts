export type FoodCategory =
  | 'cheese'
  | 'seafood'
  | 'fish'
  | 'shellfish'
  | 'poultry'
  | 'red_meat'
  | 'pork'
  | 'vegetable'
  | 'pasta'
  | 'salad'
  | 'fried_food'
  | 'dessert'
  | 'spicy_food'
  | 'snack'
  | 'general';

export type FoodWeight = 'light' | 'medium' | 'rich' | 'heavy';
export type FoodNeedLevel = 'low' | 'medium' | 'high';
export type FoodRichnessLevel = 'low' | 'medium' | 'high';
export type FoodTextureTrait =
  | 'creamy'
  | 'silky'
  | 'crisp'
  | 'crunchy'
  | 'fatty'
  | 'delicate'
  | 'grilled'
  | 'roasted'
  | 'fried'
  | 'saucy';
export type FoodFlavorFamily =
  | 'tangy'
  | 'savory'
  | 'earthy'
  | 'herbal'
  | 'smoky'
  | 'spicy'
  | 'salty'
  | 'sweet'
  | 'citrusy'
  | 'umami'
  | 'briny'
  | 'fresh_green';
export type FoodPairingNeed =
  | 'wants_acidity'
  | 'wants_freshness'
  | 'can_handle_tannin'
  | 'dislikes_heavy_tannin'
  | 'wants_texture_echo'
  | 'wants_contrast'
  | 'wants_richness_match'
  | 'wants_bubbles'
  | 'wants_fruit_support';
export type FoodOccasionCue =
  | 'cozy'
  | 'celebratory'
  | 'casual'
  | 'patio'
  | 'dinner_party'
  | 'elegant'
  | 'weeknight'
  | 'comfort_food';

export interface FoodProfile {
  queryText: string;
  categories: FoodCategory[];
  weight: FoodWeight;
  acidityNeed: FoodNeedLevel;
  richnessLevel: FoodRichnessLevel;
  textureTraits: FoodTextureTrait[];
  flavorFamilies: FoodFlavorFamily[];
  pairingNeeds: FoodPairingNeed[];
  occasionCues: FoodOccasionCue[];
  matchedArchetype?: string;
  confidence: number;
  inferredFrom: string[];
  matchedTerms: string[];
  debugSummary: string;
}

type FoodArchetype = {
  name: string;
  terms: string[];
  categories: FoodCategory[];
  weight: FoodWeight;
  acidityNeed: FoodNeedLevel;
  richnessLevel: FoodRichnessLevel;
  textures: FoodTextureTrait[];
  flavors: FoodFlavorFamily[];
  pairingNeeds: FoodPairingNeed[];
  occasionCues?: FoodOccasionCue[];
};

const FOOD_ARCHETYPES: FoodArchetype[] = [
  {
    name: 'goat cheese',
    terms: ['goat cheese', 'chèvre', 'chevre'],
    categories: ['cheese'],
    weight: 'light',
    acidityNeed: 'high',
    richnessLevel: 'medium',
    textures: ['creamy', 'delicate'],
    flavors: ['tangy', 'fresh_green', 'herbal'],
    pairingNeeds: ['wants_acidity', 'wants_freshness', 'dislikes_heavy_tannin', 'wants_contrast'],
  },
  {
    name: 'salmon',
    terms: ['salmon'],
    categories: ['fish', 'seafood'],
    weight: 'medium',
    acidityNeed: 'high',
    richnessLevel: 'medium',
    textures: ['silky'],
    flavors: ['savory', 'fresh_green'],
    pairingNeeds: ['wants_freshness', 'wants_texture_echo', 'dislikes_heavy_tannin'],
  },
  {
    name: 'steak',
    terms: ['steak', 'ribeye', 'beef', 'filet', 'sirloin'],
    categories: ['red_meat'],
    weight: 'rich',
    acidityNeed: 'medium',
    richnessLevel: 'high',
    textures: ['fatty', 'grilled'],
    flavors: ['savory', 'smoky', 'umami'],
    pairingNeeds: ['can_handle_tannin', 'wants_richness_match'],
    occasionCues: ['dinner_party', 'elegant'],
  },
  {
    name: 'mushroom risotto',
    terms: ['mushroom risotto'],
    categories: ['vegetable', 'pasta'],
    weight: 'medium',
    acidityNeed: 'medium',
    richnessLevel: 'medium',
    textures: ['creamy', 'saucy'],
    flavors: ['earthy', 'umami', 'savory'],
    pairingNeeds: ['wants_texture_echo', 'wants_fruit_support', 'dislikes_heavy_tannin'],
    occasionCues: ['cozy', 'elegant'],
  },
  {
    name: 'mushrooms',
    terms: ['mushroom', 'mushrooms'],
    categories: ['vegetable'],
    weight: 'medium',
    acidityNeed: 'medium',
    richnessLevel: 'medium',
    textures: ['silky'],
    flavors: ['earthy', 'umami', 'savory'],
    pairingNeeds: ['wants_texture_echo', 'wants_fruit_support', 'dislikes_heavy_tannin'],
    occasionCues: ['cozy'],
  },
  {
    name: 'fried food',
    terms: ['fried', 'fried chicken', 'tempura'],
    categories: ['fried_food', 'snack'],
    weight: 'rich',
    acidityNeed: 'high',
    richnessLevel: 'high',
    textures: ['fried', 'crisp', 'fatty'],
    flavors: ['savory', 'salty'],
    pairingNeeds: ['wants_acidity', 'wants_bubbles', 'wants_contrast'],
    occasionCues: ['casual'],
  },
  {
    name: 'creamy pasta',
    terms: ['creamy pasta', 'alfredo', 'cream sauce', 'carbonara'],
    categories: ['pasta'],
    weight: 'rich',
    acidityNeed: 'medium',
    richnessLevel: 'high',
    textures: ['creamy', 'saucy'],
    flavors: ['savory'],
    pairingNeeds: ['wants_acidity', 'wants_texture_echo', 'wants_richness_match'],
    occasionCues: ['comfort_food'],
  },
  {
    name: 'tomato pasta',
    terms: ['tomato pasta', 'tomato sauce', 'pasta', 'pizza', 'marinara'],
    categories: ['pasta'],
    weight: 'medium',
    acidityNeed: 'high',
    richnessLevel: 'medium',
    textures: ['saucy'],
    flavors: ['citrusy', 'savory', 'herbal'],
    pairingNeeds: ['wants_acidity', 'wants_freshness', 'wants_fruit_support'],
    occasionCues: ['weeknight', 'casual'],
  },
  {
    name: 'oysters',
    terms: ['oyster', 'oysters'],
    categories: ['shellfish', 'seafood'],
    weight: 'light',
    acidityNeed: 'high',
    richnessLevel: 'low',
    textures: ['delicate'],
    flavors: ['briny', 'fresh_green'],
    pairingNeeds: ['wants_freshness', 'wants_acidity', 'wants_bubbles', 'dislikes_heavy_tannin'],
    occasionCues: ['elegant', 'celebratory'],
  },
  {
    name: 'shellfish',
    terms: ['shellfish', 'shrimp', 'scallop', 'lobster', 'crab'],
    categories: ['shellfish', 'seafood'],
    weight: 'light',
    acidityNeed: 'high',
    richnessLevel: 'medium',
    textures: ['delicate'],
    flavors: ['briny', 'savory'],
    pairingNeeds: ['wants_freshness', 'wants_acidity', 'dislikes_heavy_tannin'],
  },
  {
    name: 'roasted chicken',
    terms: ['roast chicken', 'roasted chicken', 'chicken'],
    categories: ['poultry'],
    weight: 'medium',
    acidityNeed: 'medium',
    richnessLevel: 'medium',
    textures: ['roasted'],
    flavors: ['savory', 'herbal'],
    pairingNeeds: ['wants_freshness', 'wants_texture_echo'],
    occasionCues: ['dinner_party', 'weeknight'],
  },
  {
    name: 'burger',
    terms: ['burger', 'burgers'],
    categories: ['red_meat', 'snack'],
    weight: 'rich',
    acidityNeed: 'medium',
    richnessLevel: 'high',
    textures: ['fatty', 'grilled'],
    flavors: ['savory', 'smoky', 'salty'],
    pairingNeeds: ['can_handle_tannin', 'wants_contrast'],
    occasionCues: ['casual'],
  },
  {
    name: 'pizza',
    terms: ['pizza'],
    categories: ['pasta', 'snack'],
    weight: 'medium',
    acidityNeed: 'high',
    richnessLevel: 'medium',
    textures: ['saucy'],
    flavors: ['savory', 'herbal', 'salty'],
    pairingNeeds: ['wants_acidity', 'wants_fruit_support'],
    occasionCues: ['casual', 'dinner_party'],
  },
  {
    name: 'spicy dish',
    terms: ['spicy', 'heat', 'chili', 'curry', 'noodles'],
    categories: ['spicy_food'],
    weight: 'medium',
    acidityNeed: 'medium',
    richnessLevel: 'medium',
    textures: ['saucy'],
    flavors: ['spicy', 'savory'],
    pairingNeeds: ['wants_fruit_support', 'wants_freshness', 'dislikes_heavy_tannin'],
    occasionCues: ['casual'],
  },
  {
    name: 'charcuterie',
    terms: ['charcuterie', 'cured meat', 'prosciutto', 'salumi'],
    categories: ['pork', 'snack'],
    weight: 'medium',
    acidityNeed: 'medium',
    richnessLevel: 'medium',
    textures: ['fatty'],
    flavors: ['salty', 'savory'],
    pairingNeeds: ['wants_freshness', 'wants_fruit_support'],
    occasionCues: ['dinner_party', 'celebratory'],
  },
  {
    name: 'salad with vinaigrette',
    terms: ['salad', 'vinaigrette'],
    categories: ['salad', 'vegetable'],
    weight: 'light',
    acidityNeed: 'high',
    richnessLevel: 'low',
    textures: ['crisp', 'delicate'],
    flavors: ['fresh_green', 'herbal', 'tangy'],
    pairingNeeds: ['wants_acidity', 'wants_freshness', 'dislikes_heavy_tannin'],
  },
];

const PREPARATION_TRAITS: Array<{ terms: string[]; textures?: FoodTextureTrait[]; richnessDelta?: number; weight?: FoodWeight; matchedAs: string }> = [
  { terms: ['fried', 'crispy', 'crisp'], textures: ['fried', 'crisp', 'crunchy'], richnessDelta: 1, weight: 'rich', matchedAs: 'fried' },
  { terms: ['grilled', 'charred'], textures: ['grilled'], matchedAs: 'grilled' },
  { terms: ['roasted', 'roast'], textures: ['roasted'], matchedAs: 'roasted' },
  { terms: ['creamy', 'cream', 'buttery'], textures: ['creamy', 'silky', 'saucy'], richnessDelta: 1, weight: 'rich', matchedAs: 'creamy' },
  { terms: ['smoked'], textures: ['roasted'], matchedAs: 'smoked' },
  { terms: ['raw', 'chilled'], textures: ['delicate'], weight: 'light', matchedAs: 'delicate' },
  { terms: ['braised'], textures: ['saucy'], richnessDelta: 1, weight: 'rich', matchedAs: 'braised' },
];

const MODIFIER_TRAITS: Array<{
  terms: string[];
  flavors?: FoodFlavorFamily[];
  pairingNeeds?: FoodPairingNeed[];
  occasionCues?: FoodOccasionCue[];
  acidityNeed?: FoodNeedLevel;
  richnessDelta?: number;
  matchedAs: string;
}> = [
  { terms: ['tangy', 'goat cheese', 'vinaigrette'], flavors: ['tangy'], pairingNeeds: ['wants_acidity'], acidityNeed: 'high', matchedAs: 'tangy' },
  { terms: ['bright', 'fresh', 'lemon', 'lemony', 'citrus'], flavors: ['citrusy', 'fresh_green'], pairingNeeds: ['wants_freshness', 'wants_acidity'], acidityNeed: 'high', matchedAs: 'fresh' },
  { terms: ['herb', 'herby', 'herbal'], flavors: ['herbal', 'fresh_green'], matchedAs: 'herbal' },
  { terms: ['earthy', 'mushroom'], flavors: ['earthy', 'umami'], pairingNeeds: ['wants_texture_echo'], matchedAs: 'earthy' },
  { terms: ['smoky', 'smoke'], flavors: ['smoky', 'savory'], pairingNeeds: ['wants_richness_match'], matchedAs: 'smoky' },
  { terms: ['spicy', 'spice', 'chili', 'hot'], flavors: ['spicy'], pairingNeeds: ['wants_fruit_support', 'dislikes_heavy_tannin'], matchedAs: 'spicy' },
  { terms: ['salty', 'briny', 'oyster'], flavors: ['salty', 'briny'], pairingNeeds: ['wants_freshness', 'wants_bubbles'], matchedAs: 'salty' },
  { terms: ['sweet', 'dessert'], flavors: ['sweet'], matchedAs: 'sweet' },
  { terms: ['savory', 'umami'], flavors: ['savory', 'umami'], matchedAs: 'savory' },
];

const OCCASION_CUES: Array<{ terms: string[]; cues: FoodOccasionCue[]; matchedAs: string }> = [
  { terms: ['cozy', 'snow day', 'rainy night', 'comfort'], cues: ['cozy', 'comfort_food'], matchedAs: 'cozy' },
  { terms: ['patio', 'picnic', 'outside', 'summer'], cues: ['patio', 'casual'], matchedAs: 'patio' },
  { terms: ['friends', 'dinner party', 'company'], cues: ['dinner_party'], matchedAs: 'dinner_party' },
  { terms: ['weeknight', 'easy'], cues: ['weeknight', 'casual'], matchedAs: 'weeknight' },
  { terms: ['celebration', 'birthday', 'anniversary'], cues: ['celebratory', 'elegant'], matchedAs: 'celebratory' },
  { terms: ['date night', 'special'], cues: ['elegant'], matchedAs: 'elegant' },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addUnique<T>(target: T[], values: T[] = []) {
  for (const value of values) {
    if (!target.includes(value)) target.push(value);
  }
}

function weightScore(weight: FoodWeight) {
  if (weight === 'light') return 0;
  if (weight === 'medium') return 1;
  if (weight === 'rich') return 2;
  return 3;
}

function weightFromScore(score: number): FoodWeight {
  if (score <= 0) return 'light';
  if (score === 1) return 'medium';
  if (score === 2) return 'rich';
  return 'heavy';
}

function levelScore(level: FoodNeedLevel | FoodRichnessLevel) {
  if (level === 'low') return 0;
  if (level === 'medium') return 1;
  return 2;
}

function levelFromScore(score: number): FoodNeedLevel {
  if (score <= 0) return 'low';
  if (score === 1) return 'medium';
  return 'high';
}

function labelize(value: string) {
  return value.replace(/_/g, ' ');
}

export function mapQueryToFoodProfile(query: string): FoodProfile {
  const normalized = normalize(query);
  const categories: FoodCategory[] = [];
  const textureTraits: FoodTextureTrait[] = [];
  const flavorFamilies: FoodFlavorFamily[] = [];
  const pairingNeeds: FoodPairingNeed[] = [];
  const occasionCues: FoodOccasionCue[] = [];
  const inferredFrom = new Set<string>();
  const matchedTerms = new Set<string>();

  let matchedArchetype: string | undefined;
  let weightScoreValue = 1;
  let acidityNeedScore = 1;
  let richnessScore = 1;

  for (const archetype of FOOD_ARCHETYPES) {
    if (!archetype.terms.some((term) => normalized.includes(normalize(term)))) continue;

    matchedArchetype = archetype.name;
    addUnique(categories, archetype.categories);
    addUnique(textureTraits, archetype.textures);
    addUnique(flavorFamilies, archetype.flavors);
    addUnique(pairingNeeds, archetype.pairingNeeds);
    addUnique(occasionCues, archetype.occasionCues);
    weightScoreValue = Math.max(weightScoreValue, weightScore(archetype.weight));
    acidityNeedScore = Math.max(acidityNeedScore, levelScore(archetype.acidityNeed));
    richnessScore = Math.max(richnessScore, levelScore(archetype.richnessLevel));
    inferredFrom.add('archetype');
    matchedTerms.add(archetype.name);
    break;
  }

  for (const preparation of PREPARATION_TRAITS) {
    if (!preparation.terms.some((term) => normalized.includes(normalize(term)))) continue;
    addUnique(textureTraits, preparation.textures);
    if (typeof preparation.richnessDelta === 'number') richnessScore += preparation.richnessDelta;
    if (preparation.weight) weightScoreValue = Math.max(weightScoreValue, weightScore(preparation.weight));
    inferredFrom.add('preparation');
    matchedTerms.add(preparation.matchedAs);
  }

  for (const modifier of MODIFIER_TRAITS) {
    if (!modifier.terms.some((term) => normalized.includes(normalize(term)))) continue;
    addUnique(flavorFamilies, modifier.flavors);
    addUnique(pairingNeeds, modifier.pairingNeeds);
    addUnique(occasionCues, modifier.occasionCues);
    if (modifier.acidityNeed) acidityNeedScore = Math.max(acidityNeedScore, levelScore(modifier.acidityNeed));
    if (typeof modifier.richnessDelta === 'number') richnessScore += modifier.richnessDelta;
    inferredFrom.add('modifier');
    matchedTerms.add(modifier.matchedAs);
  }

  for (const cue of OCCASION_CUES) {
    if (!cue.terms.some((term) => normalized.includes(normalize(term)))) continue;
    addUnique(occasionCues, cue.cues);
    inferredFrom.add('occasion');
    matchedTerms.add(cue.matchedAs);
  }

  if (!categories.length && normalized.includes('seafood')) addUnique(categories, ['seafood']);
  if (!categories.length && normalized.includes('fish')) addUnique(categories, ['fish', 'seafood']);
  if (!categories.length && normalized.includes('cheese')) addUnique(categories, ['cheese']);
  if (!categories.length && normalized.includes('pasta')) addUnique(categories, ['pasta']);
  if (!categories.length && normalized.includes('salad')) addUnique(categories, ['salad', 'vegetable']);
  if (!categories.length && normalized.includes('dessert')) addUnique(categories, ['dessert']);
  if (!categories.length && normalized.includes('spicy')) addUnique(categories, ['spicy_food']);
  if (!categories.length && normalized.includes('snack')) addUnique(categories, ['snack']);
  if (!categories.length && !occasionCues.length) addUnique(categories, ['general']);

  if (categories.includes('red_meat')) addUnique(pairingNeeds, ['can_handle_tannin', 'wants_richness_match']);
  if (categories.includes('shellfish') || categories.includes('seafood') || categories.includes('fish')) {
    addUnique(pairingNeeds, ['wants_freshness', 'wants_acidity', 'dislikes_heavy_tannin']);
  }
  if (categories.includes('fried_food')) addUnique(pairingNeeds, ['wants_bubbles', 'wants_contrast']);
  if (categories.includes('cheese')) addUnique(pairingNeeds, ['wants_freshness']);
  if (categories.includes('salad')) addUnique(pairingNeeds, ['wants_acidity', 'wants_freshness', 'dislikes_heavy_tannin']);
  if (occasionCues.includes('comfort_food') || occasionCues.includes('cozy')) {
    addUnique(pairingNeeds, ['wants_richness_match']);
  }

  const weight = weightFromScore(weightScoreValue);
  const acidityNeed = levelFromScore(acidityNeedScore);
  const richnessLevel = levelFromScore(richnessScore);
  const confidence = Number(
    Math.min(
      0.95,
      0.25 +
        (matchedArchetype ? 0.35 : 0) +
        (matchedTerms.size ? Math.min(0.22, matchedTerms.size * 0.06) : 0) +
        (occasionCues.length ? 0.05 : 0),
    ).toFixed(2),
  );

  const debugSummary = [
    matchedArchetype ? `archetype: ${matchedArchetype}` : '',
    categories.length ? `categories: ${categories.map(labelize).join(', ')}` : '',
    `weight: ${weight}`,
    `acid need: ${acidityNeed}`,
    `richness: ${richnessLevel}`,
    textureTraits.length ? `textures: ${textureTraits.map(labelize).join(', ')}` : '',
    flavorFamilies.length ? `flavors: ${flavorFamilies.map(labelize).join(', ')}` : '',
    pairingNeeds.length ? `pairing: ${pairingNeeds.map(labelize).join(', ')}` : '',
    occasionCues.length ? `occasion: ${occasionCues.map(labelize).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' • ');

  return {
    queryText: query,
    categories,
    weight,
    acidityNeed,
    richnessLevel,
    textureTraits,
    flavorFamilies,
    pairingNeeds,
    occasionCues,
    matchedArchetype,
    confidence,
    inferredFrom: Array.from(inferredFrom),
    matchedTerms: Array.from(matchedTerms),
    debugSummary,
  };
}

export const mapDishTextToFoodProfile = mapQueryToFoodProfile;

export function dishWantsAcidity(profile: FoodProfile) {
  return profile.pairingNeeds.includes('wants_acidity') || profile.acidityNeed === 'high';
}

export function dishCanHandleTannin(profile: FoodProfile) {
  return profile.pairingNeeds.includes('can_handle_tannin');
}

export function dishIsComfortFood(profile: FoodProfile) {
  return profile.occasionCues.includes('comfort_food') || profile.occasionCues.includes('cozy');
}

export function dishIsPatioFriendly(profile: FoodProfile) {
  return profile.occasionCues.includes('patio') || profile.categories.includes('salad') || profile.categories.includes('shellfish');
}

export function dishWantsBubbles(profile: FoodProfile) {
  return profile.pairingNeeds.includes('wants_bubbles');
}
