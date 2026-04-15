import { Wine } from '../types/wine';
import { getDrinkabilityInfo } from '../utils/drinkWindow';

export type WineStyleFamily =
  | 'bold_red'
  | 'medium_red'
  | 'light_red'
  | 'crisp_white'
  | 'rich_white'
  | 'rose'
  | 'sparkling'
  | 'dessert'
  | 'fortified'
  | 'orange'
  | 'other';

export type WineColorFamily = 'red' | 'white' | 'rose' | 'sparkling' | 'amber' | 'dessert' | 'fortified' | 'other';
export type WineStructureLevel = 'low' | 'medium_minus' | 'medium' | 'medium_plus' | 'high';
export type WineSweetnessLevel = 'bone_dry' | 'dry' | 'off_dry' | 'medium_sweet' | 'sweet' | 'unknown';
export type AlcoholImpression = 'low' | 'moderate' | 'elevated' | 'high' | 'unknown';
export type WineFlavorFamily =
  | 'citrus'
  | 'orchard_fruit'
  | 'stone_fruit'
  | 'tropical_fruit'
  | 'red_fruit'
  | 'dark_fruit'
  | 'floral'
  | 'herbal'
  | 'earthy'
  | 'mineral'
  | 'savory'
  | 'spice'
  | 'oak'
  | 'creamy_buttery';
export type WineTextureTrait =
  | 'crisp'
  | 'round'
  | 'creamy'
  | 'silky'
  | 'structured'
  | 'refreshing'
  | 'plush'
  | 'weighty';
export type WinePairingTendency =
  | 'seafood_friendly'
  | 'cheese_friendly'
  | 'creamy_dish_friendly'
  | 'grilled_food_friendly'
  | 'steak_friendly'
  | 'patio_friendly'
  | 'cozy_weather_friendly'
  | 'celebration_friendly'
  | 'dinner_party_friendly'
  | 'goat_cheese_friendly'
  | 'salmon_friendly'
  | 'mushroom_friendly'
  | 'rainy_night_friendly'
  | 'crowd_pleaser'
  | 'porch_pounder_candidate';
export type WineReadinessTag = 'too_young' | 'approaching_window' | 'ready_now' | 'peak_window' | 'nearing_end' | 'past_peak';

export interface WineProfile {
  styleFamily: WineStyleFamily;
  styleLabel: string;
  colorFamily: WineColorFamily;
  bodyLevel: WineStructureLevel;
  acidityLevel: WineStructureLevel;
  tanninLevel: WineStructureLevel;
  sweetnessLevel: WineSweetnessLevel;
  alcoholImpression: AlcoholImpression;
  flavorFamilies: WineFlavorFamily[];
  textureTraits: WineTextureTrait[];
  pairingTendencies: WinePairingTendency[];
  readinessTag: WineReadinessTag;
  confidence: number;
  inferredFrom: string[];
  evidence: Partial<Record<'style' | 'varietal' | 'notes' | 'region' | 'pairing' | 'window', string[]>>;
  profileSummary: string;
  body: string;
  acidity: string;
  tannin: string;
  texture: string;
  fruitProfile: string;
  minerality: string;
  finish: string;
  readiness: string;
  earthiness: string;
  freshness: string;
  richness: string;
  keyTraits: string[];
}

type TraitDefaults = {
  styleFamily?: WineStyleFamily;
  body?: number;
  acidity?: number;
  tannin?: number;
  sweetness?: WineSweetnessLevel;
  alcohol?: AlcoholImpression;
  flavors?: WineFlavorFamily[];
  textures?: WineTextureTrait[];
  pairings?: WinePairingTendency[];
};

const VARIETAL_DEFAULTS: Array<{ terms: string[]; traits: TraitDefaults }> = [
  {
    terms: ['cabernet sauvignon', 'cabernet', 'bordeaux blend'],
    traits: {
      styleFamily: 'bold_red',
      body: 4,
      acidity: 2,
      tannin: 4,
      alcohol: 'elevated',
      flavors: ['dark_fruit', 'oak', 'spice'],
      textures: ['structured', 'weighty'],
      pairings: ['steak_friendly', 'grilled_food_friendly', 'cozy_weather_friendly'],
    },
  },
  {
    terms: ['syrah', 'shiraz', 'mourvedre', 'mourvèdre', 'monastrell', 'malbec', 'petite sirah', 'zinfandel'],
    traits: {
      styleFamily: 'bold_red',
      body: 4,
      acidity: 2,
      tannin: 3,
      alcohol: 'elevated',
      flavors: ['dark_fruit', 'spice', 'savory'],
      textures: ['structured', 'plush'],
      pairings: ['grilled_food_friendly', 'steak_friendly', 'cozy_weather_friendly', 'rainy_night_friendly'],
    },
  },
  {
    terms: ['merlot', 'tempranillo', 'rioja', 'grenache', 'garnacha', 'sangiovese', 'barbera', 'nebbiolo'],
    traits: {
      styleFamily: 'medium_red',
      body: 3,
      acidity: 2,
      tannin: 2,
      flavors: ['red_fruit', 'spice', 'earthy'],
      textures: ['silky', 'structured'],
      pairings: ['dinner_party_friendly', 'mushroom_friendly', 'grilled_food_friendly'],
    },
  },
  {
    terms: ['pinot noir', 'gamay', 'beaujolais', 'zweigelt'],
    traits: {
      styleFamily: 'light_red',
      body: 1,
      acidity: 3,
      tannin: 1,
      flavors: ['red_fruit', 'earthy', 'floral'],
      textures: ['silky', 'refreshing'],
      pairings: ['salmon_friendly', 'mushroom_friendly', 'dinner_party_friendly', 'patio_friendly'],
    },
  },
  {
    terms: ['sauvignon blanc', 'riesling', 'pinot grigio', 'pinot gris', 'albarino', 'albariño', 'gruner', 'grüner', 'vermentino', 'muscadet'],
    traits: {
      styleFamily: 'crisp_white',
      body: 1,
      acidity: 4,
      tannin: 0,
      sweetness: 'dry',
      flavors: ['citrus', 'herbal', 'mineral'],
      textures: ['crisp', 'refreshing'],
      pairings: ['seafood_friendly', 'goat_cheese_friendly', 'patio_friendly', 'porch_pounder_candidate'],
    },
  },
  {
    terms: ['chardonnay', 'chenin blanc', 'viognier', 'marsanne', 'roussanne', 'white burgundy'],
    traits: {
      styleFamily: 'rich_white',
      body: 3,
      acidity: 2,
      tannin: 0,
      sweetness: 'dry',
      flavors: ['orchard_fruit', 'stone_fruit'],
      textures: ['round'],
      pairings: ['salmon_friendly', 'creamy_dish_friendly', 'dinner_party_friendly'],
    },
  },
  {
    terms: ['rose', 'rosé'],
    traits: {
      styleFamily: 'rose',
      body: 1,
      acidity: 3,
      tannin: 0,
      sweetness: 'dry',
      flavors: ['red_fruit', 'citrus', 'floral'],
      textures: ['refreshing', 'crisp'],
      pairings: ['patio_friendly', 'seafood_friendly', 'goat_cheese_friendly', 'crowd_pleaser'],
    },
  },
  {
    terms: ['champagne', 'crémant', 'cremant', 'cava', 'prosecco', 'sparkling'],
    traits: {
      styleFamily: 'sparkling',
      body: 1,
      acidity: 4,
      tannin: 0,
      flavors: ['citrus', 'orchard_fruit', 'mineral'],
      textures: ['crisp', 'refreshing'],
      pairings: ['celebration_friendly', 'seafood_friendly', 'cheese_friendly', 'patio_friendly', 'crowd_pleaser'],
    },
  },
];

const REGION_HINTS: Array<{ terms: string[]; traits: TraitDefaults }> = [
  { terms: ['chablis', 'muscadet', 'sancerre'], traits: { styleFamily: 'crisp_white', acidity: 4, flavors: ['mineral', 'citrus'], textures: ['crisp'] } },
  { terms: ['napa', 'paso robles', 'sonoma', 'russian river', 'monterey'], traits: { body: 3, textures: ['round'], flavors: ['oak'] } },
  { terms: ['burgundy', 'bourgogne'], traits: { acidity: 3, flavors: ['earthy'], textures: ['silky'] } },
  { terms: ['oregon'], traits: { acidity: 3, flavors: ['red_fruit', 'earthy'], textures: ['silky'] } },
];

const NOTE_KEYWORDS: Array<{
  terms: string[];
  flavors?: WineFlavorFamily[];
  textures?: WineTextureTrait[];
  pairings?: WinePairingTendency[];
  styleFamily?: WineStyleFamily;
  bodyDelta?: number;
  acidityDelta?: number;
}> = [
  { terms: ['citrus', 'lemon', 'lime', 'grapefruit', 'meyer lemon', 'zest'], flavors: ['citrus'], textures: ['refreshing'], acidityDelta: 1 },
  { terms: ['green apple', 'pear', 'apple', 'quince'], flavors: ['orchard_fruit'], textures: ['crisp'] },
  { terms: ['peach', 'apricot', 'nectarine'], flavors: ['stone_fruit'] },
  { terms: ['pineapple', 'mango', 'guava', 'passionfruit'], flavors: ['tropical_fruit'], styleFamily: 'crisp_white' },
  { terms: ['cherry', 'cranberry', 'strawberry', 'raspberry', 'red fruit'], flavors: ['red_fruit'] },
  { terms: ['plum', 'blackberry', 'black cherry', 'cassis', 'dark fruit'], flavors: ['dark_fruit'], bodyDelta: 1 },
  { terms: ['violet', 'rose petal', 'floral', 'blossom'], flavors: ['floral'] },
  { terms: ['herbal', 'thyme', 'sage', 'grass', 'grassy', 'fennel'], flavors: ['herbal'] },
  { terms: ['earth', 'earthy', 'forest floor', 'mushroom', 'truffle', 'leather'], flavors: ['earthy', 'savory'], pairings: ['mushroom_friendly', 'rainy_night_friendly'] },
  { terms: ['mineral', 'chalk', 'saline', 'stone', 'shell'], flavors: ['mineral'], pairings: ['seafood_friendly'], acidityDelta: 1 },
  { terms: ['pepper', 'smoke', 'smoky', 'clove', 'anise', 'spice'], flavors: ['spice', 'savory'], pairings: ['grilled_food_friendly', 'cozy_weather_friendly'] },
  { terms: ['oak', 'vanilla', 'toast', 'toasty'], flavors: ['oak'], textures: ['round'], bodyDelta: 1, styleFamily: 'rich_white' },
  { terms: ['butter', 'buttery', 'cream', 'creamy', 'custard'], flavors: ['creamy_buttery'], textures: ['creamy', 'round'], bodyDelta: 1, styleFamily: 'rich_white', pairings: ['creamy_dish_friendly'] },
  { terms: ['silky', 'supple'], textures: ['silky'] },
  { terms: ['bright', 'fresh', 'crisp', 'lifted', 'zippy'], textures: ['refreshing', 'crisp'], acidityDelta: 1, pairings: ['patio_friendly', 'goat_cheese_friendly'] },
  { terms: ['rich', 'bold', 'full-bodied', 'full bodied', 'opulent'], textures: ['weighty', 'plush'], bodyDelta: 1 },
];

const PAIRING_KEYWORDS: Array<{ terms: string[]; pairings: WinePairingTendency[] }> = [
  { terms: ['seafood', 'oyster', 'shellfish'], pairings: ['seafood_friendly'] },
  { terms: ['salmon'], pairings: ['salmon_friendly', 'seafood_friendly'] },
  { terms: ['goat cheese', 'chèvre', 'chevre'], pairings: ['goat_cheese_friendly', 'cheese_friendly'] },
  { terms: ['cheese'], pairings: ['cheese_friendly'] },
  { terms: ['cream', 'risotto', 'alfredo'], pairings: ['creamy_dish_friendly'] },
  { terms: ['steak', 'lamb', 'burger', 'grilled'], pairings: ['steak_friendly', 'grilled_food_friendly'] },
  { terms: ['mushroom'], pairings: ['mushroom_friendly'] },
  { terms: ['patio', 'picnic', 'summer'], pairings: ['patio_friendly', 'porch_pounder_candidate'] },
];

function includesAny(source: string, terms: string[]) {
  return terms.some((term) => source.includes(term));
}

function pushEvidence(evidence: WineProfile['evidence'], key: keyof WineProfile['evidence'], value: string) {
  if (!value) return;
  evidence[key] = Array.from(new Set([...(evidence[key] ?? []), value]));
}

function addUnique<T>(current: T[], next: T[] = []) {
  for (const item of next) {
    if (!current.includes(item)) current.push(item);
  }
}

function clampLevel(value: number) {
  return Math.max(0, Math.min(4, Math.round(value)));
}

function structureLabel(level: WineStructureLevel, kind: 'body' | 'acidity' | 'tannin') {
  const labels = {
    body: {
      low: 'lighter body',
      medium_minus: 'lighter-to-medium body',
      medium: 'medium body',
      medium_plus: 'medium-plus body',
      high: 'fuller body',
    },
    acidity: {
      low: 'gentle acidity',
      medium_minus: 'steady freshness',
      medium: 'moderate freshness',
      medium_plus: 'bright acidity',
      high: 'vivid acidity',
    },
    tannin: {
      low: 'barely-there tannin',
      medium_minus: 'gentle tannin',
      medium: 'soft structure',
      medium_plus: 'firm tannin',
      high: 'assertive tannin',
    },
  } as const;

  return labels[kind][level];
}

function levelFromScore(score: number): WineStructureLevel {
  if (score <= 0) return 'low';
  if (score === 1) return 'medium_minus';
  if (score === 2) return 'medium';
  if (score === 3) return 'medium_plus';
  return 'high';
}

function inferStyleFamily(wine: Wine, source: string, flavorFamilies: WineFlavorFamily[], textureTraits: WineTextureTrait[], current?: WineStyleFamily): WineStyleFamily {
  if (current && current !== 'other') {
    if (current === 'rich_white' && (flavorFamilies.includes('citrus') || flavorFamilies.includes('mineral')) && !flavorFamilies.includes('oak') && !textureTraits.includes('creamy')) {
      return 'crisp_white';
    }
    if (current === 'crisp_white' && (flavorFamilies.includes('oak') || flavorFamilies.includes('creamy_buttery') || textureTraits.includes('creamy') || textureTraits.includes('round'))) {
      return 'rich_white';
    }
    return current;
  }

  if (wine.style === 'sparkling') return 'sparkling';
  if (wine.style === 'rose') return 'rose';
  if (wine.style === 'dessert') return 'dessert';
  if (wine.style === 'fortified') return 'fortified';
  if (wine.style === 'orange') return 'orange';
  if (wine.style === 'red') {
    if (includesAny(source, ['pinot noir', 'gamay', 'beaujolais'])) return 'light_red';
    if (includesAny(source, ['cabernet', 'syrah', 'shiraz', 'malbec', 'zinfandel', 'mourvedre', 'mourvèdre'])) return 'bold_red';
    return 'medium_red';
  }
  if (wine.style === 'white') {
    if (flavorFamilies.includes('oak') || flavorFamilies.includes('creamy_buttery') || textureTraits.includes('creamy') || textureTraits.includes('round')) {
      return 'rich_white';
    }
    return 'crisp_white';
  }

  return 'other';
}

function inferColorFamily(styleFamily: WineStyleFamily): WineColorFamily {
  if (['bold_red', 'medium_red', 'light_red'].includes(styleFamily)) return 'red';
  if (['crisp_white', 'rich_white'].includes(styleFamily)) return 'white';
  if (styleFamily === 'rose') return 'rose';
  if (styleFamily === 'sparkling') return 'sparkling';
  if (styleFamily === 'orange') return 'amber';
  if (styleFamily === 'dessert') return 'dessert';
  if (styleFamily === 'fortified') return 'fortified';
  return 'other';
}

function styleLabelForWine(wine: Wine, styleFamily: WineStyleFamily) {
  if (wine.varietal.trim()) return wine.varietal;

  const labels: Record<WineStyleFamily, string> = {
    bold_red: 'bold red',
    medium_red: 'medium-bodied red',
    light_red: 'lighter red',
    crisp_white: 'crisp white',
    rich_white: 'fuller white',
    rose: 'rosé',
    sparkling: 'sparkling wine',
    dessert: 'dessert wine',
    fortified: 'fortified wine',
    orange: 'orange wine',
    other: wine.style.replace('-', ' '),
  };

  return labels[styleFamily];
}

function readinessTagForWine(wine: Wine): WineReadinessTag {
  const status = getDrinkabilityInfo(wine).status;
  if (status === 'Peak window') return 'peak_window';
  if (status === 'Ready to drink') return 'ready_now';
  if (status === 'Nearing end of peak') return 'nearing_end';
  if (status === 'Approaching window') return 'approaching_window';
  if (status === 'Too young') return 'too_young';
  return 'past_peak';
}

function readinessPhraseForTag(tag: WineReadinessTag) {
  if (tag === 'peak_window') return 'right in its peak window';
  if (tag === 'ready_now') return 'ready to open now';
  if (tag === 'nearing_end') return 'well worth opening soon';
  if (tag === 'approaching_window') return 'just beginning to look interesting';
  if (tag === 'too_young') return 'still a little youthful';
  return 'past its ideal peak, but still worth checking if you are curious';
}

function fruitProfileLabel(flavors: WineFlavorFamily[]) {
  if (flavors.includes('red_fruit')) return 'red-fruited';
  if (flavors.includes('dark_fruit')) return 'darker-fruited';
  if (flavors.includes('citrus')) return 'citrusy';
  if (flavors.includes('orchard_fruit')) return 'orchard-fruited';
  if (flavors.includes('stone_fruit')) return 'stone-fruited';
  if (flavors.includes('tropical_fruit')) return 'tropical-fruited';
  return 'fruit-led';
}

function textureLabel(textureTraits: WineTextureTrait[]) {
  if (textureTraits.includes('creamy')) return 'creamy texture';
  if (textureTraits.includes('round')) return 'round texture';
  if (textureTraits.includes('crisp')) return 'taut texture';
  if (textureTraits.includes('silky')) return 'silky texture';
  if (textureTraits.includes('structured')) return 'structured texture';
  return 'supple texture';
}

function mapDirectPairingTendencies(
  styleFamily: WineStyleFamily,
  acidityLevel: WineStructureLevel,
  bodyLevel: WineStructureLevel,
  tanninLevel: WineStructureLevel,
  flavorFamilies: WineFlavorFamily[],
  textureTraits: WineTextureTrait[],
  rating?: number,
) {
  const tendencies: WinePairingTendency[] = [];

  if (['crisp_white', 'sparkling', 'rose'].includes(styleFamily) || flavorFamilies.includes('mineral')) {
    addUnique(tendencies, ['seafood_friendly']);
  }
  if (styleFamily === 'rich_white' || textureTraits.includes('creamy') || textureTraits.includes('round')) {
    addUnique(tendencies, ['creamy_dish_friendly', 'salmon_friendly']);
  }
  if (styleFamily === 'bold_red' || tanninLevel === 'high' || tanninLevel === 'medium_plus') {
    addUnique(tendencies, ['steak_friendly', 'grilled_food_friendly', 'cozy_weather_friendly']);
  }
  if ((styleFamily === 'light_red' || styleFamily === 'medium_red') && flavorFamilies.includes('earthy')) {
    addUnique(tendencies, ['mushroom_friendly', 'dinner_party_friendly']);
  }
  if (['rose', 'sparkling', 'crisp_white', 'light_red'].includes(styleFamily) && (acidityLevel === 'medium_plus' || acidityLevel === 'high')) {
    addUnique(tendencies, ['patio_friendly', 'porch_pounder_candidate']);
  }
  if (acidityLevel === 'medium_plus' || acidityLevel === 'high' || styleFamily === 'sparkling') {
    addUnique(tendencies, ['cheese_friendly']);
  }
  if (styleFamily === 'sparkling' || (rating ?? 0) >= 94) {
    addUnique(tendencies, ['celebration_friendly']);
  }
  if (['medium_red', 'light_red', 'rich_white', 'rose'].includes(styleFamily)) {
    addUnique(tendencies, ['dinner_party_friendly', 'crowd_pleaser']);
  }
  if ((styleFamily === 'crisp_white' || styleFamily === 'rose') && (acidityLevel === 'high' || acidityLevel === 'medium_plus')) {
    addUnique(tendencies, ['goat_cheese_friendly']);
  }
  if (styleFamily === 'light_red' || styleFamily === 'rich_white' || styleFamily === 'sparkling') {
    addUnique(tendencies, ['salmon_friendly']);
  }
  if ((styleFamily === 'medium_red' || styleFamily === 'bold_red' || styleFamily === 'rich_white') && (textureTraits.includes('plush') || flavorFamilies.includes('spice') || flavorFamilies.includes('earthy'))) {
    addUnique(tendencies, ['rainy_night_friendly', 'cozy_weather_friendly']);
  }
  if (bodyLevel === 'medium' || bodyLevel === 'medium_plus') {
    addUnique(tendencies, ['dinner_party_friendly']);
  }

  return tendencies;
}

export function mapWineToProfile(wine: Wine): WineProfile {
  const combinedSource = [
    wine.name,
    wine.producer,
    wine.varietal,
    wine.style,
    wine.appellation,
    wine.region,
    wine.country,
    wine.tastingNotes,
    wine.aiAdvice,
    wine.foodPairingNotes,
    wine.tastingLog.map((entry) => `${entry.notes} ${entry.pairings ?? ''} ${entry.occasion ?? ''}`).join(' '),
  ]
    .join(' ')
    .toLowerCase();

  const evidence: WineProfile['evidence'] = {};
  const inferredFrom = new Set<string>();
  const flavorFamilies: WineFlavorFamily[] = [];
  const textureTraits: WineTextureTrait[] = [];
  const pairingTendencies: WinePairingTendency[] = [];

  let styleFamily: WineStyleFamily | undefined;
  let bodyScore = wine.style === 'red' ? 2 : wine.style === 'white' ? 1 : 0;
  let acidityScore = wine.style === 'white' || wine.style === 'sparkling' ? 2 : 1;
  let tanninScore = wine.style === 'red' ? 2 : 0;
  let sweetnessLevel: WineSweetnessLevel = wine.style === 'dessert' ? 'sweet' : wine.style === 'fortified' ? 'off_dry' : 'dry';
  let alcoholImpression: AlcoholImpression = wine.alcoholPercent
    ? wine.alcoholPercent >= 15
      ? 'high'
      : wine.alcoholPercent >= 13.5
        ? 'elevated'
        : wine.alcoholPercent >= 11.5
          ? 'moderate'
          : 'low'
    : 'unknown';

  for (const mapping of VARIETAL_DEFAULTS) {
    if (!includesAny(combinedSource, mapping.terms)) continue;
    inferredFrom.add('varietal');
    pushEvidence(evidence, 'varietal', mapping.terms[0]);
    if (mapping.traits.styleFamily) styleFamily = mapping.traits.styleFamily;
    if (typeof mapping.traits.body === 'number') bodyScore = mapping.traits.body;
    if (typeof mapping.traits.acidity === 'number') acidityScore = mapping.traits.acidity;
    if (typeof mapping.traits.tannin === 'number') tanninScore = mapping.traits.tannin;
    if (mapping.traits.sweetness) sweetnessLevel = mapping.traits.sweetness;
    if (mapping.traits.alcohol) alcoholImpression = mapping.traits.alcohol;
    addUnique(flavorFamilies, mapping.traits.flavors);
    addUnique(textureTraits, mapping.traits.textures);
    addUnique(pairingTendencies, mapping.traits.pairings);
    break;
  }

  for (const hint of REGION_HINTS) {
    if (!includesAny(combinedSource, hint.terms)) continue;
    inferredFrom.add('region');
    pushEvidence(evidence, 'region', hint.terms[0]);
    if (hint.traits.styleFamily) styleFamily = hint.traits.styleFamily;
    if (typeof hint.traits.body === 'number') bodyScore = Math.max(bodyScore, hint.traits.body);
    if (typeof hint.traits.acidity === 'number') acidityScore = Math.max(acidityScore, hint.traits.acidity);
    addUnique(flavorFamilies, hint.traits.flavors);
    addUnique(textureTraits, hint.traits.textures);
  }

  for (const keyword of NOTE_KEYWORDS) {
    if (!includesAny(combinedSource, keyword.terms)) continue;
    inferredFrom.add('notes');
    pushEvidence(evidence, 'notes', keyword.terms[0]);
    addUnique(flavorFamilies, keyword.flavors);
    addUnique(textureTraits, keyword.textures);
    addUnique(pairingTendencies, keyword.pairings);
    if (keyword.styleFamily) styleFamily = keyword.styleFamily;
    if (typeof keyword.bodyDelta === 'number') bodyScore += keyword.bodyDelta;
    if (typeof keyword.acidityDelta === 'number') acidityScore += keyword.acidityDelta;
  }

  for (const keyword of PAIRING_KEYWORDS) {
    if (!includesAny(combinedSource, keyword.terms)) continue;
    inferredFrom.add('pairing');
    pushEvidence(evidence, 'pairing', keyword.terms[0]);
    addUnique(pairingTendencies, keyword.pairings);
  }

  styleFamily = inferStyleFamily(wine, combinedSource, flavorFamilies, textureTraits, styleFamily);
  const colorFamily = inferColorFamily(styleFamily);

  if (styleFamily === 'bold_red') {
    bodyScore = Math.max(bodyScore, 4);
    tanninScore = Math.max(tanninScore, 3);
    addUnique(textureTraits, ['structured']);
  } else if (styleFamily === 'medium_red') {
    bodyScore = Math.max(bodyScore, 2);
    tanninScore = Math.max(tanninScore, 2);
  } else if (styleFamily === 'light_red') {
    bodyScore = Math.min(bodyScore, 2);
    acidityScore = Math.max(acidityScore, 2);
    tanninScore = Math.min(tanninScore, 1);
    addUnique(textureTraits, ['silky']);
  } else if (styleFamily === 'rich_white') {
    bodyScore = Math.max(bodyScore, 3);
    addUnique(textureTraits, ['round']);
  } else if (styleFamily === 'crisp_white' || styleFamily === 'sparkling' || styleFamily === 'rose') {
    acidityScore = Math.max(acidityScore, 3);
    bodyScore = Math.min(bodyScore, 2);
    addUnique(textureTraits, ['refreshing']);
  }

  const readinessTag = readinessTagForWine(wine);
  pushEvidence(evidence, 'window', readinessTag);
  inferredFrom.add('window');

  if (readinessTag === 'ready_now' || readinessTag === 'peak_window') {
    addUnique(pairingTendencies, ['dinner_party_friendly']);
  }

  addUnique(
    pairingTendencies,
    mapDirectPairingTendencies(
      styleFamily,
      levelFromScore(clampLevel(acidityScore)),
      levelFromScore(clampLevel(bodyScore)),
      levelFromScore(clampLevel(tanninScore)),
      flavorFamilies,
      textureTraits,
      wine.personalRating,
    ),
  );

  const bodyLevel = levelFromScore(clampLevel(bodyScore));
  const acidityLevel = levelFromScore(clampLevel(acidityScore));
  const tanninLevel = levelFromScore(clampLevel(tanninScore));
  const body = structureLabel(bodyLevel, 'body');
  const acidity = structureLabel(acidityLevel, 'acidity');
  const tannin = structureLabel(tanninLevel, 'tannin');
  const texture = textureLabel(textureTraits);
  const fruitProfile = fruitProfileLabel(flavorFamilies);
  const minerality = flavorFamilies.includes('mineral') ? 'mineral lift' : 'soft mineral edge';
  const finish = textureTraits.includes('refreshing') || acidityLevel === 'high' ? 'clean finish' : 'polished finish';
  const readiness = readinessPhraseForTag(readinessTag);
  const earthiness = flavorFamilies.includes('earthy') || flavorFamilies.includes('savory') ? 'earthy' : 'clean-lined';
  const freshness = acidityLevel === 'high' || acidityLevel === 'medium_plus' ? 'lifted' : 'calm';
  const richness = bodyLevel === 'high' || bodyLevel === 'medium_plus' || textureTraits.includes('creamy') ? 'generous' : 'measured';
  const keyTraits = Array.from(new Set([acidity, body, texture, fruitProfile, finish])).slice(0, 4);
  const confidence = Number(
    Math.min(
      0.97,
      0.48 +
        (wine.varietal ? 0.16 : 0) +
        (wine.tastingNotes ? 0.12 : 0) +
        (wine.aiAdvice ? 0.08 : 0) +
        (wine.foodPairingNotes ? 0.06 : 0) +
        (wine.region || wine.country ? 0.05 : 0),
    ).toFixed(2),
  );

  const profileSummary = [
    styleFamily.replace(/_/g, ' '),
    bodyLevel.replace('_', '-'),
    acidityLevel.replace('_', '-'),
    textureTraits.slice(0, 2).join('/'),
    fruitProfile,
    readinessTag.replace(/_/g, ' '),
  ]
    .filter(Boolean)
    .join(' • ');

  return {
    styleFamily,
    styleLabel: styleLabelForWine(wine, styleFamily),
    colorFamily,
    bodyLevel,
    acidityLevel,
    tanninLevel,
    sweetnessLevel,
    alcoholImpression,
    flavorFamilies,
    textureTraits,
    pairingTendencies: Array.from(new Set(pairingTendencies)),
    readinessTag,
    confidence,
    inferredFrom: Array.from(inferredFrom),
    evidence,
    profileSummary,
    body,
    acidity,
    tannin,
    texture,
    fruitProfile,
    minerality,
    finish,
    readiness,
    earthiness,
    freshness,
    richness,
    keyTraits,
  };
}
