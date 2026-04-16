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
  tone: 'moss' | 'gold' | 'plum' | 'lavender';
}

const priorityToneClasses = {
  moss: {
    heading: 'text-moss',
    subtitle: 'text-moss/75',
    card: 'border-moss/20 bg-gradient-to-br from-white to-[#F3F7F0] hover:border-moss/35',
    chip: 'bg-[#EEF5EA] text-moss',
    empty: 'border-moss/20 bg-[#F8FBF6] text-smoke',
  },
  gold: {
    heading: 'text-[#8A6727]',
    subtitle: 'text-[#8A6727]/75',
    card: 'border-gold/22 bg-gradient-to-br from-white to-[#FCF7EC] hover:border-gold/38',
    chip: 'bg-[#FAF1DE] text-[#8A6727]',
    empty: 'border-gold/20 bg-[#FFF9EF] text-smoke',
  },
  plum: {
    heading: 'text-vine',
    subtitle: 'text-vine/75',
    card: 'border-plum/20 bg-gradient-to-br from-white to-[#F8F1F7] hover:border-plum/36',
    chip: 'bg-[#F3EAF6] text-plum',
    empty: 'border-plum/20 bg-[#FCF7FD] text-smoke',
  },
  lavender: {
    heading: 'text-[#B55F7F]',
    subtitle: 'text-[#B55F7F]/75',
    card: 'border-[#E7C4D1] bg-gradient-to-br from-white to-[#FDF1F5] hover:border-[#D991AC]',
    chip: 'bg-[#FBE8EF] text-[#A85272]',
    empty: 'border-[#E7C4D1] bg-[#FFF6F9] text-smoke',
  },
} as const;

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

function PriorityWine({
  wine,
  onSelectWine,
  tone,
}: {
  wine: Wine;
  onSelectWine: (wine: Wine) => void;
  tone: PriorityGroup['tone'];
}) {
  const profile = mapWineToProfile(wine);
  const drinkStatus = getDrinkabilityInfo(wine).status;
  const toneClasses = priorityToneClasses[tone];
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
  const compactChips = getProfileSupportChips(profile, 2);
  const shortSummary = getProfileContextSummary(profile, summaryContext)
    .replace(/\s+/g, ' ')
    .split('. ')
    .filter(Boolean)[0]
    ?.trim()
    .replace(/\.$/, '');

  return (
    <button
      className={`interactive-surface w-full rounded-lg border p-3 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-lift ${toneClasses.card}`}
      type="button"
      onClick={() => onSelectWine(wine)}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="line-clamp-2 font-serif text-base font-bold leading-tight text-ink">{wine.name}</p>
          <p className="mt-1 truncate text-xs text-smoke">
            {[wine.producer, wine.vintage].filter(Boolean).join(' · ') || wine.region || 'Cellar pick'}
          </p>
        </div>
        <DrinkStatusBadge wine={wine} compact />
      </div>
      <p className="mt-2 text-xs leading-5 text-smoke">
        {shortSummary ? `${shortSummary}.` : 'Worth a closer look right now.'}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {compactChips.map((chip) => (
          <span key={chip} className={`rounded-md px-2 py-1 text-[10px] font-semibold shadow-sm ${toneClasses.chip}`}>
            {chip}
          </span>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-smoke/85">
        <span>{wine.quantity} bottle{wine.quantity === 1 ? '' : 's'}</span>
        {wine.bestDrinkBy ? <span>Best by {wine.bestDrinkBy}</span> : null}
        {wine.marketValue ? <span>{formatCurrency(wine.marketValue)}</span> : null}
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
      tone: 'moss',
    },
    {
      title: 'Drink soon',
      subtitle: 'Worth opening before the window starts to narrow.',
      wines: drinkSoon,
      emptyMessage: 'Nothing is really nudging you right now. The cellar can rest for a bit.',
      tone: 'gold',
    },
    {
      title: 'The First Ones I’d Reach For',
      subtitle: 'Bottles worth opening before the moment passes.',
      wines: firstReachFor,
      emptyMessage: 'Nothing is really stepping forward just now. That is a very calm cellar problem to have.',
      tone: 'plum',
    },
    {
      title: 'Top Bottles Right Now',
      subtitle: 'The standouts currently drinking beautifully.',
      wines: topRightNow,
      emptyMessage: 'No obvious star tonight. A few bottles are lovely, but none are especially stealing the spotlight.',
      tone: 'lavender',
    },
  ];

  return (
    <section className="panel overflow-hidden">
      <div className="drink-soon-header border-b border-ink/10 px-5 py-4 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-liam text-[2.35rem] font-normal leading-none text-white sm:text-[2.55rem]">
            What deserves attention?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/78">
            Prioritized by your drink-window years, best-drink target, status, rating, and bottle quantity.
          </p>
        </div>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-4">
        {priorityGroups.map((group) => (
          <div key={group.title}>
            <h3 className={`text-sm font-extrabold uppercase tracking-wide ${priorityToneClasses[group.tone].heading}`}>{group.title}</h3>
            <p className={`mt-1 text-xs leading-5 ${priorityToneClasses[group.tone].subtitle}`}>{group.subtitle}</p>
            <div className="mt-3 space-y-3">
              {group.wines.length ? (
                group.wines.slice(0, 2).map((wine) => (
                  <PriorityWine key={wine.id} wine={wine} tone={group.tone} onSelectWine={onSelectWine} />
                ))
              ) : (
                <div className={`rounded-lg border border-dashed p-4 text-sm leading-6 ${priorityToneClasses[group.tone].empty}`}>
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
