import { DrinkabilityStatus, Wine } from '../types/wine';

export interface DrinkabilityInfo {
  status: DrinkabilityStatus;
  shortLabel: string;
  description: string;
  urgencyScore: number;
}

export function getDrinkabilityInfo(
  wine: Pick<Wine, 'drinkWindowStart' | 'drinkWindowEnd' | 'bestDrinkBy' | 'status'>,
  currentYear = new Date().getFullYear(),
): DrinkabilityInfo {
  if (wine.status === 'consumed') {
    return {
      status: 'Past peak',
      shortLabel: 'Archived',
      description: 'This bottle is marked consumed. Keep it in the journal for reference.',
      urgencyScore: 0,
    };
  }

  const startsIn = wine.drinkWindowStart - currentYear;
  const yearsUntilEnd = wine.drinkWindowEnd - currentYear;
  const yearsUntilBest = wine.bestDrinkBy - currentYear;
  const windowLength = Math.max(1, wine.drinkWindowEnd - wine.drinkWindowStart);
  const peakStart = wine.drinkWindowStart + Math.floor(windowLength * 0.35);
  const peakEnd = Math.min(wine.bestDrinkBy, wine.drinkWindowStart + Math.ceil(windowLength * 0.75));

  if (currentYear > wine.drinkWindowEnd || currentYear > wine.bestDrinkBy + 2) {
    return {
      status: 'Past peak',
      shortLabel: 'Past peak',
      description: 'Likely beyond the planned drinking window. Open soon and note bottle condition.',
      urgencyScore: 95,
    };
  }

  if (yearsUntilBest <= 1 || yearsUntilEnd <= 1) {
    return {
      status: 'Nearing end of peak',
      shortLabel: 'Drink soon',
      description: 'This bottle is close to its best drink-by year or window end.',
      urgencyScore: 90,
    };
  }

  if (currentYear >= peakStart && currentYear <= peakEnd) {
    return {
      status: 'Peak window',
      shortLabel: 'Peak',
      description: 'In the heart of the planned window. Expect the most complete expression.',
      urgencyScore: 76,
    };
  }

  if (currentYear >= wine.drinkWindowStart) {
    return {
      status: 'Ready to drink',
      shortLabel: 'Ready',
      description: 'Inside the drinking window. Open now or continue to track its development.',
      urgencyScore: 65,
    };
  }

  if (startsIn <= 2) {
    return {
      status: 'Approaching window',
      shortLabel: 'Soon',
      description: `Approaching its drinking window. Consider opening from ${wine.drinkWindowStart}.`,
      urgencyScore: 35,
    };
  }

  return {
    status: 'Too young',
    shortLabel: 'Hold',
    description: `Outside the planned window. Best to hold until around ${wine.drinkWindowStart}.`,
    urgencyScore: 15,
  };
}

export function isDrinkableNow(wine: Wine, currentYear = new Date().getFullYear()): boolean {
  const status = getDrinkabilityInfo(wine, currentYear).status;
  return ['Ready to drink', 'Peak window', 'Nearing end of peak'].includes(status);
}

export function isInNextTwoYears(wine: Wine, currentYear = new Date().getFullYear()): boolean {
  return wine.drinkWindowStart > currentYear && wine.drinkWindowStart <= currentYear + 2;
}
