import { Wine } from '../types/wine';

export type DailyWineFactTone = 'gold' | 'lavender' | 'sage' | 'rose';
export type DailyWineFactCategory =
  | 'grape'
  | 'region'
  | 'winemaking'
  | 'service'
  | 'pairing'
  | 'aging'
  | 'structure'
  | 'sparkling'
  | 'cellar';
export type DailyWineFactLevel = 'foundational' | 'intermediate' | 'collector';
export type DailyWineFactStyle = 'hard_fact' | 'rule_of_thumb';

export interface DailyWineFact {
  tone: DailyWineFactTone;
  category: DailyWineFactCategory;
  level: DailyWineFactLevel;
  style: DailyWineFactStyle;
  title: string;
  body: string;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening';
type Season = 'winter' | 'spring' | 'summer' | 'autumn';

const DAILY_WINE_FACT_CATEGORY_ORDER: DailyWineFactCategory[] = [
  'structure',
  'grape',
  'service',
  'pairing',
  'region',
  'winemaking',
  'sparkling',
  'aging',
  'cellar',
];

const SEASONAL_CATEGORY_WEIGHTS: Record<Season, Partial<Record<DailyWineFactCategory, number>>> = {
  winter: { pairing: 2.2, cellar: 2, aging: 1.8, structure: 1.6, service: 1.2 },
  spring: { grape: 1.5, region: 1.5, service: 1.2, sparkling: 1.1, pairing: 0.8 },
  summer: { service: 2.2, sparkling: 2, pairing: 1.4, grape: 1, region: 0.9 },
  autumn: { aging: 2, pairing: 1.8, structure: 1.6, winemaking: 1.2, cellar: 1 },
};

const TIME_OF_DAY_WEIGHTS: Record<TimeOfDay, Partial<Record<DailyWineFactCategory, number>>> = {
  morning: { grape: 1.5, region: 1.3, structure: 1.1 },
  afternoon: { service: 1.5, winemaking: 1.2, sparkling: 0.8 },
  evening: { pairing: 1.8, cellar: 1.5, aging: 1.3, service: 0.9 },
};

export const DAILY_WINE_FACTS: DailyWineFact[] = [
  {
    tone: 'rose',
    category: 'grape',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Rosé is a style, not a grape',
    body: 'Rosé gets its color from brief contact with red grape skins during winemaking.',
  },
  {
    tone: 'gold',
    category: 'sparkling',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Champagne is a wine region',
    body: 'In many markets, only sparkling wine made in Champagne can legally use the name Champagne.',
  },
  {
    tone: 'lavender',
    category: 'grape',
    level: 'intermediate',
    style: 'hard_fact',
    title: 'Pinot Noir has thin skins',
    body: 'Thin-skinned grapes usually produce lighter color and lower tannin than thicker-skinned red varieties.',
  },
  {
    tone: 'sage',
    category: 'cellar',
    level: 'intermediate',
    style: 'rule_of_thumb',
    title: 'Old vines usually yield less fruit',
    body: 'Lower yields from older vines can produce grapes with more concentration, though quality still depends on farming and site.',
  },
  {
    tone: 'gold',
    category: 'structure',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Acidity keeps wine lively',
    body: 'Acidity is what makes wine taste fresh at the table and helps it pair well with richer food.',
  },
  {
    tone: 'sage',
    category: 'winemaking',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Oak adds flavor and texture',
    body: 'Oak aging can add notes like toast, vanilla, and spice, and it can also make a wine feel rounder.',
  },
  {
    tone: 'lavender',
    category: 'region',
    level: 'intermediate',
    style: 'hard_fact',
    title: 'Cool nights help preserve acidity',
    body: 'Large day-to-night temperature swings slow grape respiration and help fruit keep more natural freshness.',
  },
  {
    tone: 'gold',
    category: 'sparkling',
    level: 'foundational',
    style: 'rule_of_thumb',
    title: 'Sparkling wine handles salty food well',
    body: 'High acidity and bubbles make sparkling wine especially strong with salty, fried, and snacky foods.',
  },
  {
    tone: 'sage',
    category: 'grape',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Chardonnay can taste very different by style',
    body: 'Climate, oak, and winemaking can push Chardonnay toward either crisp citrus and mineral notes or rounder orchard fruit and creamier texture.',
  },
  {
    tone: 'rose',
    category: 'aging',
    level: 'collector',
    style: 'hard_fact',
    title: 'Sediment is common in older reds',
    body: 'Sediment forms as color pigments and tannins bind together over time and fall out of solution.',
  },
  {
    tone: 'rose',
    category: 'structure',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Tannin comes from skins, seeds, and stems',
    body: 'Tannin is what creates the drying grip you notice most clearly in many young red wines.',
  },
  {
    tone: 'lavender',
    category: 'service',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Serving temperature changes aroma and structure',
    body: 'Serving red wine too warm can make alcohol stand out more, while serving white wine too cold can mute aroma and texture.',
  },
  {
    tone: 'sage',
    category: 'grape',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Sauvignon Blanc is usually high in acidity',
    body: 'That high-acid profile is why Sauvignon Blanc often works so well with tangy cheese, herbs, and citrus-driven dishes.',
  },
  {
    tone: 'gold',
    category: 'region',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Terroir includes climate as much as soil',
    body: 'Terroir refers to the full growing environment, including soil, elevation, exposure, and weather.',
  },
  {
    tone: 'lavender',
    category: 'aging',
    level: 'intermediate',
    style: 'hard_fact',
    title: 'Bottle age changes texture as well as flavor',
    body: 'As wine matures, tannins and acids can feel softer, which is why older bottles often seem silkier on the palate.',
  },
  {
    tone: 'rose',
    category: 'structure',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Fruitiness does not mean sweetness',
    body: 'A wine can smell or taste like ripe fruit and still be completely dry.',
  },
  {
    tone: 'sage',
    category: 'region',
    level: 'intermediate',
    style: 'hard_fact',
    title: 'Altitude usually slows ripening',
    body: 'Higher vineyards tend to have cooler temperatures, which often helps grapes retain acid and aromatic lift.',
  },
  {
    tone: 'lavender',
    category: 'service',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Decanting exposes wine to oxygen',
    body: 'That extra oxygen can soften reduction, open aroma, and make a tightly wound wine show more quickly.',
  },
  {
    tone: 'rose',
    category: 'pairing',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Fat softens tannin',
    body: 'That is why structured reds often taste more balanced with steak, lamb, or other fatty meats than they do on their own.',
  },
  {
    tone: 'gold',
    category: 'pairing',
    level: 'foundational',
    style: 'rule_of_thumb',
    title: 'Good pairings usually follow acidity and weight',
    body: 'The most reliable pairing cues are how rich the dish is and whether it needs freshness, not whether the meal sounds fancy.',
  },
  {
    tone: 'gold',
    category: 'service',
    level: 'foundational',
    style: 'rule_of_thumb',
    title: 'Sparkling wine is usually served colder than still wine',
    body: 'Lower serving temperatures help sparkling wine feel tighter, brighter, and more precise in the glass.',
  },
  {
    tone: 'sage',
    category: 'winemaking',
    level: 'intermediate',
    style: 'hard_fact',
    title: 'Malolactic fermentation lowers sharp acidity',
    body: 'This conversion changes stronger malic acid into softer lactic acid and can give wine a creamier feel.',
  },
  {
    tone: 'rose',
    category: 'pairing',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Tomato sauces need acid in the wine',
    body: 'Low-acid wines can taste flat next to tomato-based dishes, while bright wines keep pace more cleanly.',
  },
  {
    tone: 'lavender',
    category: 'cellar',
    level: 'collector',
    style: 'hard_fact',
    title: 'Heat ages wine faster',
    body: 'Consistent high storage temperatures speed up chemical reactions and can shorten a bottle’s life.',
  },
  {
    tone: 'gold',
    category: 'pairing',
    level: 'foundational',
    style: 'hard_fact',
    title: 'Goat cheese usually likes high-acid wines',
    body: 'Bright whites work well because their freshness can match the tang without making the pairing feel heavy.',
  },
  {
    tone: 'sage',
    category: 'pairing',
    level: 'intermediate',
    style: 'hard_fact',
    title: 'Salmon needs freshness and enough weight',
    body: 'Its richness can handle fuller whites or softer reds, but aggressive tannin usually overwhelms it.',
  },
  {
    tone: 'rose',
    category: 'pairing',
    level: 'intermediate',
    style: 'hard_fact',
    title: 'Mushrooms pair well with earthy wines',
    body: 'Pinot Noir and similar wines often work because their savory or forest-floor notes can echo the dish.',
  },
];

function getLocalDateKey(date = new Date()) {
  return date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate();
}

function getSeason(date: Date): Season {
  const month = date.getMonth();
  if (month === 11 || month <= 1) return 'winter';
  if (month <= 4) return 'spring';
  if (month <= 7) return 'summer';
  return 'autumn';
}

function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function getCellarCategoryWeights(wines: Wine[]): Partial<Record<DailyWineFactCategory, number>> {
  if (!wines.length) return {};

  const styleCounts = wines.reduce<Record<string, number>>((counts, wine) => {
    counts[wine.style] = (counts[wine.style] ?? 0) + Math.max(wine.quantity, 1);
    return counts;
  }, {});

  const redShare = (styleCounts.red ?? 0) / wines.length;
  const whiteLikeShare = ((styleCounts.white ?? 0) + (styleCounts.rose ?? 0) + (styleCounts.sparkling ?? 0)) / wines.length;
  const sparklingShare = (styleCounts.sparkling ?? 0) / wines.length;

  const ratedCount = wines.filter((wine) => typeof wine.personalRating === 'number').length;
  const cellarHasDepth = wines.length >= 18 || ratedCount >= 8;

  return {
    structure: redShare >= 0.45 ? 1.4 : 0,
    aging: redShare >= 0.45 ? 1.1 : 0,
    pairing: redShare >= 0.35 ? 0.9 : 0.7,
    service: whiteLikeShare >= 0.4 ? 1.2 : 0,
    sparkling: sparklingShare >= 0.12 ? 1.4 : 0.3,
    grape: whiteLikeShare >= 0.4 ? 0.8 : 0.4,
    cellar: cellarHasDepth ? 1.2 : 0.2,
    region: wines.length >= 10 ? 0.6 : 0,
  };
}

function getCategoryBaseScore(category: DailyWineFactCategory, dateKey: number) {
  const targetIndex = dateKey % DAILY_WINE_FACT_CATEGORY_ORDER.length;
  const currentIndex = DAILY_WINE_FACT_CATEGORY_ORDER.indexOf(category);
  const directDistance = Math.abs(currentIndex - targetIndex);
  const wrappedDistance = DAILY_WINE_FACT_CATEGORY_ORDER.length - directDistance;
  const distance = Math.min(directDistance, wrappedDistance);
  return DAILY_WINE_FACT_CATEGORY_ORDER.length - distance;
}

function getCategoryScore(
  category: DailyWineFactCategory,
  date: Date,
  dateKey: number,
  cellarWeights: Partial<Record<DailyWineFactCategory, number>>,
) {
  const season = getSeason(date);
  const timeOfDay = getTimeOfDay(date);
  const seasonalWeight = SEASONAL_CATEGORY_WEIGHTS[season][category] ?? 0;
  const timeWeight = TIME_OF_DAY_WEIGHTS[timeOfDay][category] ?? 0;
  const cellarWeight = cellarWeights[category] ?? 0;

  return getCategoryBaseScore(category, dateKey) + seasonalWeight + timeWeight + cellarWeight;
}

export function getDailyWineFact(date = new Date(), wines: Wine[] = []): DailyWineFact {
  const dateKey = getLocalDateKey(date);
  const cellarWeights = getCellarCategoryWeights(wines);
  const rankedCategories = [...DAILY_WINE_FACT_CATEGORY_ORDER].sort((a, b) => {
    const scoreDifference = getCategoryScore(b, date, dateKey, cellarWeights) - getCategoryScore(a, date, dateKey, cellarWeights);
    if (scoreDifference !== 0) return scoreDifference;
    return DAILY_WINE_FACT_CATEGORY_ORDER.indexOf(a) - DAILY_WINE_FACT_CATEGORY_ORDER.indexOf(b);
  });

  const category = rankedCategories[0];
  const categoryFacts = DAILY_WINE_FACTS.filter((fact) => fact.category === category);

  if (!categoryFacts.length) {
    return DAILY_WINE_FACTS[dateKey % DAILY_WINE_FACTS.length];
  }

  const rotationIndex = Math.floor(dateKey / DAILY_WINE_FACT_CATEGORY_ORDER.length) % categoryFacts.length;
  return categoryFacts[rotationIndex];
}
