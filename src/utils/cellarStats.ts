import { Wine } from '../types/wine';
import { getDrinkabilityInfo, isDrinkableNow } from './drinkWindow';

export interface CellarStat {
  id: string;
  icon: string;
  text: string;
  tone: 'plum' | 'gold' | 'moss' | 'lavender';
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function mostCommon(wines: Wine[], getValue: (wine: Wine) => string) {
  const counts = wines.reduce<Record<string, number>>((result, wine) => {
    const value = getValue(wine).trim();
    if (!value) return result;
    result[value] = (result[value] ?? 0) + wine.quantity;
    return result;
  }, {});

  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0];
}

export function getCellarStats(wines: Wine[]): CellarStat[] {
  if (!wines.length) return [];

  const totalBottles = wines.reduce((sum, wine) => sum + wine.quantity, 0);
  const readyNow = wines.filter(isDrinkableNow).reduce((sum, wine) => sum + wine.quantity, 0);
  const atPeak = wines
    .filter((wine) => getDrinkabilityInfo(wine).status === 'Peak window')
    .reduce((sum, wine) => sum + wine.quantity, 0);
  const drinkSoon = wines
    .filter((wine) => ['Nearing end of peak', 'Past peak'].includes(getDrinkabilityInfo(wine).status))
    .reduce((sum, wine) => sum + wine.quantity, 0);
  const tastingEntries = wines.reduce((sum, wine) => sum + wine.tastingLog.length, 0);
  const favoriteOrigin = mostCommon(wines, (wine) => wine.region || wine.varietal);
  const recentAdditions = wines.filter((wine) => {
    const createdAt = new Date(wine.createdAt).getTime();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return Number.isFinite(createdAt) && createdAt >= thirtyDaysAgo;
  }).length;

  return [
    {
      id: 'bottles',
      icon: '🍷',
      text: `${pluralize(totalBottles, 'bottle')} tucked away`,
      tone: 'plum',
    },
    readyNow
      ? {
          id: 'ready-now',
          icon: '🌙',
          text: `${pluralize(readyNow, 'bottle')} ready for tonight`,
          tone: 'lavender',
        }
      : null,
    atPeak
      ? {
          id: 'at-peak',
          icon: '⏳',
          text: `${pluralize(atPeak, 'bottle')} at their peak`,
          tone: 'gold',
        }
      : null,
    drinkSoon
      ? {
          id: 'drink-soon',
          icon: '✨',
          text: `${pluralize(drinkSoon, 'bottle')} worth checking soon`,
          tone: 'gold',
        }
      : null,
    favoriteOrigin
      ? {
          id: 'favorite-origin',
          icon: '🍇',
          text: `You’ve been loving ${favoriteOrigin} lately`,
          tone: 'moss',
        }
      : null,
    recentAdditions
      ? {
          id: 'recent',
          icon: '📚',
          text: `${pluralize(recentAdditions, 'new bottle')} added recently`,
          tone: 'plum',
        }
      : null,
    tastingEntries
      ? {
          id: 'journal',
          icon: '✍️',
          text: `${pluralize(tastingEntries, 'tasting note')} saved`,
          tone: 'lavender',
        }
      : null,
  ]
    .filter((stat): stat is CellarStat => Boolean(stat))
    .slice(0, 5);
}
