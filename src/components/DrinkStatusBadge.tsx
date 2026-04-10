import { DrinkabilityStatus, Wine } from '../types/wine';
import { getDrinkabilityInfo } from '../utils/drinkWindow';

interface DrinkStatusBadgeProps {
  wine: Wine;
  compact?: boolean;
  showTimeline?: boolean;
}

const statusStyles: Record<DrinkabilityStatus, { badge: string; dot: string; bar: string }> = {
  'Too young': {
    badge: 'border-sky-200 bg-sky-50 text-sky-800',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
  },
  'Approaching window': {
    badge: 'border-sage/30 bg-sage/10 text-moss',
    dot: 'bg-sage',
    bar: 'bg-sage',
  },
  'Ready to drink': {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
  'Peak window': {
    badge: 'border-gold/40 bg-gold/15 text-[#7B5A22]',
    dot: 'bg-gold',
    bar: 'bg-gold',
  },
  'Nearing end of peak': {
    badge: 'border-amber-300 bg-amber-50 text-amber-800',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  'Past peak': {
    badge: 'border-clay/30 bg-clay/10 text-clay',
    dot: 'bg-clay',
    bar: 'bg-clay',
  },
};

function timelineProgress(wine: Wine) {
  const currentYear = new Date().getFullYear();
  const start = wine.drinkWindowStart - 2;
  const end = Math.max(start + 1, wine.drinkWindowEnd);
  return Math.min(100, Math.max(6, ((currentYear - start) / (end - start)) * 100));
}

export default function DrinkStatusBadge({ wine, compact = false, showTimeline = false }: DrinkStatusBadgeProps) {
  const info = getDrinkabilityInfo(wine);
  const styles = statusStyles[info.status];

  return (
    <span className={showTimeline ? 'block' : 'inline-block'} title={info.description}>
      <span
        className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-extrabold ${styles.badge} ${
          compact ? 'whitespace-nowrap' : ''
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
        {compact ? info.shortLabel : info.status}
      </span>
      {showTimeline ? (
        <span className="mt-3 block">
          <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-smoke">
            <span>{wine.drinkWindowStart}</span>
            <span>{wine.bestDrinkBy}</span>
            <span>{wine.drinkWindowEnd}</span>
          </span>
          <span className="mt-1 block h-2 overflow-hidden rounded-full bg-ink/10">
            <span className={`block h-full rounded-full ${styles.bar}`} style={{ width: `${timelineProgress(wine)}%` }} />
          </span>
        </span>
      ) : null}
    </span>
  );
}
