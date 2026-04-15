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

export function getDailyWineFact(date = new Date()): DailyWineFact {
  const dateKey = getLocalDateKey(date);
  const category = DAILY_WINE_FACT_CATEGORY_ORDER[dateKey % DAILY_WINE_FACT_CATEGORY_ORDER.length];
  const categoryFacts = DAILY_WINE_FACTS.filter((fact) => fact.category === category);

  if (!categoryFacts.length) {
    return DAILY_WINE_FACTS[dateKey % DAILY_WINE_FACTS.length];
  }

  const rotationIndex = Math.floor(dateKey / DAILY_WINE_FACT_CATEGORY_ORDER.length) % categoryFacts.length;
  return categoryFacts[rotationIndex];
}
