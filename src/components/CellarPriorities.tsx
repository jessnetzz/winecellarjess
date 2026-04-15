import DrinkStatusBadge from './DrinkStatusBadge';
import { mapWineToProfile } from '../services/wineAttributeMapper';
import { getProfileContextSummary, getProfileSupportChips } from '../services/wineProfileSelectors';
import { Wine } from '../types/wine';
import { getDrinkabilityInfo } from '../utils/drinkWindow';
import { formatCurrency } from '../utils/formatters';

interface CellarPrioritiesProps {
  wines: Wine[];
  onSelectWine: (wine: Wine) => void;
}

function PriorityWine({ wine, onSelectWine }: { wine: Wine; onSelectWine: (wine: Wine) => void }) {
  const profile = mapWineToProfile(wine);
  const drinkStatus = getDrinkabilityInfo(wine).status;
  const summaryContext =
    drinkStatus === 'Peak window'
      ? 'peak'
      : drinkStatus === 'Ready to drink'
        ? 'ready_now'
        : drinkStatus === 'Nearing end of peak'
          ? 'drink_soon'
          : drinkStatus === 'Past peak'
            ? 'past_peak'
            : 'general';

  return (
    <button
      className="interactive-surface w-full rounded-lg border border-ink/10 bg-white p-4 text-left shadow-sm hover:-translate-y-0.5 hover:border-vine/30 hover:bg-porcelain/80 hover:shadow-lift"
      type="button"
      onClick={() => onSelectWine(wine)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-lg font-bold leading-tight text-ink">{wine.name}</p>
          <p className="mt-1 text-sm text-smoke">
            {wine.producer} - {wine.vintage}
          </p>
        </div>
        <DrinkStatusBadge wine={wine} compact />
      </div>
      <DrinkStatusBadge wine={wine} showTimeline />
      <p className="mt-3 text-sm leading-6 text-smoke">
        {getProfileContextSummary(profile, summaryContext)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {getProfileSupportChips(profile).map((chip) => (
          <span key={chip} className="rounded-md bg-paper px-2.5 py-1 text-[11px] font-semibold text-smoke shadow-sm">
            {chip}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-wide text-smoke">
        <span>{wine.quantity} bottle{wine.quantity === 1 ? '' : 's'}</span>
        <span>Best by {wine.bestDrinkBy}</span>
        <span>{formatCurrency(wine.marketValue)}</span>
      </div>
    </button>
  );
}

export default function CellarPriorities({ wines, onSelectWine }: CellarPrioritiesProps) {
  const sortedByUrgency = [...wines]
    .filter((wine) => wine.status !== 'consumed')
    .sort((a, b) => getDrinkabilityInfo(b).urgencyScore - getDrinkabilityInfo(a).urgencyScore);

  const readyNow = sortedByUrgency.filter((wine) =>
    ['Ready to drink', 'Peak window'].includes(getDrinkabilityInfo(wine).status),
  );
  const drinkSoon = sortedByUrgency.filter((wine) => getDrinkabilityInfo(wine).status === 'Nearing end of peak');
  const pastPeak = sortedByUrgency.filter((wine) => getDrinkabilityInfo(wine).status === 'Past peak');
  const topPeak = sortedByUrgency
    .filter((wine) => getDrinkabilityInfo(wine).status === 'Peak window' && (wine.personalRating ?? 0) >= 94)
    .sort((a, b) => (b.personalRating ?? 0) - (a.personalRating ?? 0));

  const priorityGroups = [
    { title: 'Ready now', wines: readyNow },
    { title: 'Drink soon', wines: drinkSoon },
    { title: 'Past peak', wines: pastPeak },
    { title: 'Top-rated peak bottles', wines: topPeak },
  ];

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Cellar priorities</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-ink">What deserves attention?</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-smoke">
          Prioritized by your drink-window years, best-drink target, status, rating, and bottle quantity.
        </p>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-4">
        {priorityGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-vine">{group.title}</h3>
            <div className="mt-3 space-y-3">
              {group.wines.length ? (
                group.wines.slice(0, 3).map((wine) => <PriorityWine key={wine.id} wine={wine} onSelectWine={onSelectWine} />)
              ) : (
                <div className="rounded-lg border border-dashed border-ink/20 p-4 text-sm leading-6 text-smoke">
                  Nothing urgent here. That is a fine cellar problem to have.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
