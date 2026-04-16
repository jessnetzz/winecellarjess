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

interface PriorityGroup {
  title: string;
  subtitle: string;
  wines: Wine[];
  emptyMessage: string;
}

function getReachForScore(wine: Wine) {
  const drinkability = getDrinkabilityInfo(wine);
  const profile = mapWineToProfile(wine);
  let score = drinkability.urgencyScore * 2.5;

  if (drinkability.status === 'Past peak') score += 20;
  if (drinkability.status === 'Nearing end of peak') score += 16;
  if (drinkability.status === 'Peak window') score += 10;

  if (wine.quantity > 1) score += 6;
  if ((wine.personalRating ?? 0) >= 4) score += 8;
  if (['light_red', 'medium_red', 'rich_white', 'crisp_white', 'rose'].includes(profile.styleFamily)) score += 4;
  if (profile.readinessTag === 'ready_now' || profile.readinessTag === 'peak_window') score += 4;

  return score;
}

function getTopRightNowScore(wine: Wine) {
  const drinkability = getDrinkabilityInfo(wine);
  const rating = wine.personalRating ?? 0;
  const valueSignal = Math.max(wine.marketValue || 0, wine.purchasePrice || 0);
  let score = 0;

  if (drinkability.status === 'Peak window') score += 28;
  else if (drinkability.status === 'Ready to drink') score += 18;
  else return -100;

  score += rating * 10;
  score += Math.min(valueSignal / 25, 10);
  if (wine.quantity > 1) score += 2;

  return score;
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
  const firstReachFor = [...sortedByUrgency]
    .filter((wine) => ['Nearing end of peak', 'Past peak', 'Peak window'].includes(getDrinkabilityInfo(wine).status))
    .sort((a, b) => getReachForScore(b) - getReachForScore(a));
  const topRightNow = [...sortedByUrgency]
    .filter((wine) => ['Peak window', 'Ready to drink'].includes(getDrinkabilityInfo(wine).status))
    .sort((a, b) => getTopRightNowScore(b) - getTopRightNowScore(a));

  const priorityGroups: PriorityGroup[] = [
    {
      title: 'Ready now',
      subtitle: 'Bottles already in a lovely place.',
      wines: readyNow,
      emptyMessage: 'Nothing especially ready at this moment, which simply means the cellar still has a little patience.',
    },
    {
      title: 'Drink soon',
      subtitle: 'Worth opening before the window starts to narrow.',
      wines: drinkSoon,
      emptyMessage: 'Nothing is really nudging you right now. The cellar can rest for a bit.',
    },
    {
      title: 'The First Ones I’d Reach For',
      subtitle: 'Bottles worth opening before the moment passes.',
      wines: firstReachFor,
      emptyMessage: 'Nothing is really stepping forward just now. That is a very calm cellar problem to have.',
    },
    {
      title: 'Top Bottles Right Now',
      subtitle: 'The standouts currently drinking beautifully.',
      wines: topRightNow,
      emptyMessage: 'No obvious star tonight. A few bottles are lovely, but none are especially stealing the spotlight.',
    },
  ];

  return (
    <section className="panel overflow-hidden">
      <div className="drink-soon-header border-b border-ink/10 px-5 py-4 text-white">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/70">Cellar priorities</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">What deserves attention?</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-white/78">
            Prioritized by your drink-window years, best-drink target, status, rating, and bottle quantity.
          </p>
        </div>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-4">
        {priorityGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-vine">{group.title}</h3>
            <p className="mt-1 text-xs leading-5 text-smoke">{group.subtitle}</p>
            <div className="mt-3 space-y-3">
              {group.wines.length ? (
                group.wines.slice(0, 3).map((wine) => <PriorityWine key={wine.id} wine={wine} onSelectWine={onSelectWine} />)
              ) : (
                <div className="rounded-lg border border-dashed border-ink/20 p-4 text-sm leading-6 text-smoke">
                  {group.emptyMessage}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
