import { AIAdviceResult, Wine } from '../types/wine';

export interface AIAdviceService {
  getAdvice(wine: Wine): Promise<AIAdviceResult>;
}

function priceTier(price: number): string {
  if (price >= 200) return 'investment-grade / special occasion';
  if (price >= 75) return 'premium cellar bottle';
  if (price >= 35) return 'serious everyday cellar bottle';
  return 'casual bottle';
}

export async function getMockAIAdvice(wine: Wine): Promise<AIAdviceResult> {
  const currentYear = new Date().getFullYear();
  const isReady = currentYear >= wine.drinkWindowStart;
  const yearsToStart = Math.max(0, wine.drinkWindowStart - currentYear);
  const price = priceTier(wine.purchasePrice || wine.marketValue);

  await new Promise((resolve) => window.setTimeout(resolve, 550));

  if (currentYear > wine.drinkWindowEnd) {
    return {
      suggestedDrinkWindowStart: wine.drinkWindowStart,
      suggestedDrinkWindowEnd: wine.drinkWindowEnd,
      recommendedBestDrinkYear: wine.bestDrinkBy,
      agingPotential: 'Limited upside from more aging based on the stored drinking window.',
      tastingExpectations: 'Look for tertiary notes first: dried fruit, leather, nuts, forest floor, spice, and softer structure.',
      foodPairingIdeas: wine.foodPairingNotes || 'Choose a simple dish that will not hide delicate mature aromas.',
      cellarNotesSummary: 'Past peak for most bottles unless exceptionally stored. Open soon and have a backup bottle ready.',
      conciseGuidance: 'Past peak for most bottles unless exceptionally stored.',
    };
  }

  if (isReady) {
    return {
      suggestedDrinkWindowStart: wine.drinkWindowStart,
      suggestedDrinkWindowEnd: wine.drinkWindowEnd,
      recommendedBestDrinkYear: wine.bestDrinkBy,
      agingPotential: `This reads like a ${price}; keep tracking condition, but it should be rewarding inside the current window.`,
      tastingExpectations: `Expect the core profile of ${wine.varietal || wine.style} from ${wine.region}, with more savory complexity as it approaches ${wine.bestDrinkBy}.`,
      foodPairingIdeas: wine.foodPairingNotes || 'Match intensity: roasted poultry, mushrooms, aged cheese, grilled seafood, or a simple celebratory meal.',
      cellarNotesSummary: `Can drink now. For a more mature profile, revisit annually and target ${wine.bestDrinkBy}.`,
      conciseGuidance: `Can drink now, but may gain nuance before ${wine.bestDrinkBy}.`,
    };
  }

  return {
    suggestedDrinkWindowStart: wine.drinkWindowStart,
    suggestedDrinkWindowEnd: wine.drinkWindowEnd,
    recommendedBestDrinkYear: wine.bestDrinkBy,
    agingPotential: `Hold for roughly ${yearsToStart} more ${yearsToStart === 1 ? 'year' : 'years'} before your first planned check-in.`,
    tastingExpectations: `Youthful bottles may emphasize fruit, florals, acid, tannin, oak, or lees texture before the full ${wine.appellation || wine.region} character integrates.`,
    foodPairingIdeas: wine.foodPairingNotes || 'When young, pair with richer food. With age, choose simpler dishes so aromatics remain in focus.',
    cellarNotesSummary: `Likely best between ${wine.drinkWindowStart} and ${wine.drinkWindowEnd}; your best-drink target is ${wine.bestDrinkBy}.`,
    conciseGuidance: `Likely best between ${wine.drinkWindowStart} and ${wine.drinkWindowEnd}.`,
  };
}

export const aiAdviceService: AIAdviceService = {
  getAdvice: getMockAIAdvice,
};
