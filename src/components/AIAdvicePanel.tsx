import { useState } from 'react';
import Icon from './Icon';
import { aiAdviceService } from '../services/aiAdviceService';
import { AIAdviceResult, Wine } from '../types/wine';

interface AIAdvicePanelProps {
  wine: Wine;
  onApplyAdvice: (wine: Wine) => void;
}

export default function AIAdvicePanel({ wine, onApplyAdvice }: AIAdvicePanelProps) {
  const [advice, setAdvice] = useState<AIAdviceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAdvice = async () => {
    setIsLoading(true);
    try {
      const result = await aiAdviceService.getAdvice(wine);
      setAdvice(result);
      onApplyAdvice({
        ...wine,
        aiAdvice: result.cellarNotesSummary,
        drinkWindowStart: result.suggestedDrinkWindowStart,
        drinkWindowEnd: result.suggestedDrinkWindowEnd,
        bestDrinkBy: result.recommendedBestDrinkYear,
        foodPairingNotes: wine.foodPairingNotes || result.foodPairingIdeas,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-vine/15 bg-white shadow-subtle">
      <div className="border-b border-vine/10 bg-gradient-to-r from-vine to-pinot px-5 py-4 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15">
              <Icon name="sparkle" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/70">Mock AI advice</p>
              <h3 className="mt-1 font-serif text-2xl font-bold">Cellar guidance</h3>
            </div>
          </div>
          <button className="secondary-button border-white/30 bg-white/95" type="button" onClick={getAdvice} disabled={isLoading}>
            {isLoading ? 'Thinking...' : 'Get AI Advice'}
          </button>
        </div>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        ) : (
          <p className="text-sm leading-6 text-smoke">
            {wine.aiAdvice || 'Generate concise drinking-window, aging, tasting, cellar, and food-pairing guidance.'}
          </p>
        )}

        {advice ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="soft-card">
              <p className="field-label">Concise guidance</p>
              <p className="mt-2 font-semibold leading-6 text-ink">{advice.conciseGuidance}</p>
            </div>
            <div className="soft-card">
              <p className="field-label">Aging potential</p>
              <p className="mt-2 text-sm leading-6 text-smoke">{advice.agingPotential}</p>
            </div>
            <div className="soft-card">
              <p className="field-label">Tasting expectations</p>
              <p className="mt-2 text-sm leading-6 text-smoke">{advice.tastingExpectations}</p>
            </div>
            <div className="soft-card">
              <p className="field-label">Pairing ideas</p>
              <p className="mt-2 text-sm leading-6 text-smoke">{advice.foodPairingIdeas}</p>
            </div>
          </div>
        ) : null}

        <p className="mt-5 text-xs leading-5 text-smoke">
          Future integration point: this button calls `aiAdviceService.getAdvice(wine)`. Connect that service to your backend OpenAI route.
        </p>
      </div>
    </section>
  );
}
