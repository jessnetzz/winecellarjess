import { Wine } from '../types/wine';
import { getDrinkabilityInfo, isDrinkableNow } from './drinkWindow';
import { formatCurrency, formatRating } from './formatters';

export interface CellarInsight {
  id: string;
  label: string;
  headline: string;
  supportingLine: string;
  tone: 'plum' | 'gold' | 'moss' | 'lavender';
  icon: 'glass' | 'collection' | 'cellar' | 'star' | 'analytics' | 'sparkle';
}

function totalBottles(wines: Wine[]) {
  return wines.reduce((sum, wine) => sum + wine.quantity, 0);
}

function countBy<T extends string>(wines: Wine[], getValue: (wine: Wine) => T | '') {
  return wines.reduce<Record<string, number>>((result, wine) => {
    const value = getValue(wine).trim();
    if (!value) return result;
    result[value] = (result[value] ?? 0) + wine.quantity;
    return result;
  }, {});
}

function topEntry(data: Record<string, number>) {
  return Object.entries(data).sort(([, a], [, b]) => b - a)[0];
}

function styleMoodInsight(wines: Wine[]): CellarInsight | null {
  const counts = countBy(wines, (wine) => wine.style);
  const redShare = (counts.red ?? 0) / Math.max(totalBottles(wines), 1);
  const brightShare = ((counts.white ?? 0) + (counts.rose ?? 0) + (counts.sparkling ?? 0)) / Math.max(totalBottles(wines), 1);

  if (!totalBottles(wines)) return null;

  if (brightShare >= 0.58) {
    return {
      id: 'cellar-mood',
      label: 'Cellar mood',
      headline: 'Fresh, bright, patio-coded.',
      supportingLine: 'Your collection leans white and rosé.',
      tone: 'lavender',
      icon: 'sparkle',
    };
  }

  if (redShare >= 0.58) {
    return {
      id: 'cellar-mood',
      label: 'Cellar mood',
      headline: 'Cozy, dinner-ready, full of depth.',
      supportingLine: 'Your cellar leans red in the loveliest way.',
      tone: 'plum',
      icon: 'cellar',
    };
  }

  return {
    id: 'cellar-mood',
    label: 'Cellar mood',
    headline: 'A little bit of everything, very nicely stocked.',
    supportingLine: 'Balanced, versatile, and ready for different moods.',
    tone: 'moss',
    icon: 'collection',
  };
}

function readyNowInsight(wines: Wine[], currentYear: number): CellarInsight | null {
  const readyCount = wines
    .filter((wine) => wine.status !== 'consumed' && (isDrinkableNow(wine) || getDrinkabilityInfo(wine).status === 'Peak window'))
    .reduce((sum, wine) => sum + wine.quantity, 0);

  if (!readyCount) return null;

  return {
    id: 'ready-now',
    label: 'Ready now',
    headline: readyCount === 1 ? '1 bottle is ready when you are.' : `${readyCount} bottles are asking nicely.`,
    supportingLine: currentYear ? 'Best drinking this season.' : 'A few bottles are in a lovely place now.',
    tone: 'gold',
    icon: 'glass',
  };
}

function regionFavoriteInsight(wines: Wine[]): CellarInsight | null {
  const [favorite, count] = topEntry(countBy(wines, (wine) => wine.region || wine.appellation || wine.country)) ?? [];
  if (!favorite || !count) return null;

  return {
    id: 'region-favorite',
    label: 'Region favorite',
    headline: `${favorite} has your heart.`,
    supportingLine: `${count} bottle${count === 1 ? '' : 's'} in the cellar.`,
    tone: 'moss',
    icon: 'collection',
  };
}

function crownJewelInsight(wines: Wine[]): CellarInsight | null {
  const candidate = [...wines]
    .filter((wine) => wine.status !== 'consumed')
    .sort((a, b) => (b.marketValue || b.purchasePrice || 0) - (a.marketValue || a.purchasePrice || 0))[0];

  if (!candidate) return null;

  const value = candidate.marketValue || candidate.purchasePrice;
  if (!value) return null;

  return {
    id: 'crown-jewel',
    label: 'Crown jewel',
    headline: 'Your top shelf star is waiting.',
    supportingLine: `${candidate.vintage} ${candidate.name} · ${formatCurrency(value)}`,
    tone: 'gold',
    icon: 'star',
  };
}

function hiddenGemInsight(wines: Wine[]): CellarInsight | null {
  const candidate = [...wines]
    .filter((wine) => typeof wine.personalRating === 'number' && wine.personalRating > 0 && (wine.purchasePrice > 0 || wine.marketValue > 0))
    .sort((a, b) => {
      const aPrice = a.purchasePrice || a.marketValue || 1;
      const bPrice = b.purchasePrice || b.marketValue || 1;
      return (b.personalRating ?? 0) / bPrice - (a.personalRating ?? 0) / aPrice;
    })[0];

  if (!candidate || typeof candidate.personalRating !== 'number') return null;

  const price = candidate.purchasePrice || candidate.marketValue;
  if (!price) return null;

  return {
    id: 'hidden-gem',
    label: 'Hidden gem',
    headline: 'A little overachiever is hiding here.',
    supportingLine: `${candidate.vintage} ${candidate.name} · ${formatRating(candidate.personalRating)} for ${formatCurrency(price)}`,
    tone: 'lavender',
    icon: 'sparkle',
  };
}

function drinkSoonInsight(wines: Wine[], currentYear: number): CellarInsight | null {
  const count = wines
    .filter((wine) => wine.status !== 'consumed')
    .filter((wine) => {
      const endYear = wine.drinkWindowEnd || wine.bestDrinkBy;
      return Boolean(endYear) && endYear >= currentYear && endYear <= currentYear + 1;
    })
    .reduce((sum, wine) => sum + wine.quantity, 0);

  if (!count) return null;

  return {
    id: 'drink-soon',
    label: 'Drink soon',
    headline: count === 1 ? 'One bottle wants attention.' : 'A few bottles want attention.',
    supportingLine: 'Best before next year.',
    tone: 'plum',
    icon: 'analytics',
  };
}

export function getCellarInsights(wines: Wine[], now = new Date()): CellarInsight[] {
  if (!wines.length) return [];

  const currentYear = now.getFullYear();
  const insights = [
    readyNowInsight(wines, currentYear),
    styleMoodInsight(wines),
    regionFavoriteInsight(wines),
    crownJewelInsight(wines),
    hiddenGemInsight(wines),
    drinkSoonInsight(wines, currentYear),
  ].filter((insight): insight is CellarInsight => Boolean(insight));

  return insights.slice(0, 6);
}
