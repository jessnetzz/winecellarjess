import DrinkStatusBadge from './DrinkStatusBadge';
import Icon, { IconName } from './Icon';
import { Wine } from '../types/wine';
import { formatCurrency, formatRating } from '../utils/formatters';
import { getDrinkabilityInfo, isDrinkableNow, isInNextTwoYears } from '../utils/drinkWindow';

interface DashboardProps {
  wines: Wine[];
  onSelectWine?: (wine: Wine) => void;
  onCreateWine?: () => void;
}

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon: IconName;
  tone?: 'vine' | 'moss' | 'gold' | 'clay';
}

function groupCount(wines: Wine[], getValue: (wine: Wine) => string) {
  return wines.reduce<Record<string, number>>((result, wine) => {
    const value = getValue(wine) || 'Unknown';
    result[value] = (result[value] ?? 0) + wine.quantity;
    return result;
  }, {});
}

function decadeLabel(year: number) {
  return `${Math.floor(year / 10) * 10}s`;
}

function topEntries(data: Record<string, number>, limit = 6) {
  return Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);
}

function MetricCard({ label, value, helper, icon, tone = 'vine' }: MetricCardProps) {
  const toneClasses = {
    vine: 'bg-plum/10 text-plum',
    moss: 'bg-moss/10 text-moss',
    gold: 'bg-gold/15 text-[#7B5A22]',
    clay: 'bg-clay/10 text-clay',
  }[tone];

  return (
    <article className="metric-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="field-label">{label}</p>
          <p className="mt-3 text-3xl font-extrabold leading-none text-ink">{value}</p>
          <p className="mt-3 text-sm leading-6 text-smoke">{helper}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClasses}`}>
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function BarList({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = topEntries(data);
  const max = Math.max(...entries.map(([, value]) => value), 1);

  return (
    <div className="soft-card">
      <h3 className="font-serif text-xl font-bold text-ink">{title}</h3>
      <div className="mt-5 space-y-4">
        {entries.map(([label, value]) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-ink">{label}</span>
              <span className="font-bold text-smoke">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-gradient-to-r from-plum via-lavender to-gold" style={{ width: `${Math.max(8, (value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriorityStrip({ title, wines, onSelectWine }: { title: string; wines: Wine[]; onSelectWine?: (wine: Wine) => void }) {
  return (
    <div className="priority-card">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-xl font-bold text-ink">{title}</h3>
        <span className="rounded-md bg-plum/10 px-2.5 py-1 text-xs font-bold text-plum">{wines.length}</span>
      </div>
      <div className="mt-4 space-y-2">
        {wines.length ? (
          wines.slice(0, 4).map((wine) => (
            <button
              key={wine.id}
              className="interactive-surface group flex w-full items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2 text-left hover:-translate-y-px hover:border-plum/20 hover:bg-paper hover:shadow-sm"
              type="button"
              onClick={() => onSelectWine?.(wine)}
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-ink group-hover:text-plum">{wine.vintage} {wine.name}</span>
                <span className="block truncate text-sm text-smoke">{wine.producer} · {wine.region}</span>
              </span>
              <DrinkStatusBadge wine={wine} compact />
            </button>
          ))
        ) : (
          <p className="rounded-md border border-dashed border-ink/15 p-3 text-sm leading-6 text-smoke">
            Nothing urgent here right now.
          </p>
        )}
      </div>
    </div>
  );
}

function MobileBottleList({ title, wines, emptyText, onSelectWine }: { title: string; wines: Wine[]; emptyText: string; onSelectWine?: (wine: Wine) => void }) {
  return (
    <section className="mobile-dashboard-card lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-xl font-bold text-ink">{title}</h3>
        <span className="rounded-md bg-plum/10 px-2.5 py-1 text-xs font-bold text-plum">{wines.length}</span>
      </div>
      <div className="mt-4 space-y-2">
        {wines.length ? (
          wines.slice(0, 3).map((wine) => (
            <button
              key={wine.id}
              className="mobile-bottle-row"
              type="button"
              onClick={() => onSelectWine?.(wine)}
            >
              <span className="min-w-0">
                <span className="block truncate font-bold text-ink">{wine.vintage} {wine.name}</span>
                <span className="block truncate text-sm text-smoke">{wine.producer} · {wine.region || wine.country}</span>
              </span>
              <DrinkStatusBadge wine={wine} compact />
            </button>
          ))
        ) : (
          <p className="rounded-md border border-dashed border-ink/15 p-3 text-sm leading-6 text-smoke">{emptyText}</p>
        )}
      </div>
    </section>
  );
}

export default function Dashboard({ wines, onSelectWine, onCreateWine }: DashboardProps) {
  const totalBottles = wines.reduce((sum, wine) => sum + wine.quantity, 0);
  const collectionValue = wines.reduce((sum, wine) => sum + wine.marketValue * wine.quantity, 0);
  const ratedWines = wines.filter((wine) => wine.personalRating);
  const averageRating = ratedWines.length
    ? ratedWines.reduce((sum, wine) => sum + (wine.personalRating ?? 0), 0) / ratedWines.length
    : undefined;
  const readyNow = wines.filter(isDrinkableNow);
  const pastPeak = wines.filter((wine) => getDrinkabilityInfo(wine).status === 'Past peak');
  const nextTwoYears = wines.filter(isInNextTwoYears);
  const atPeak = wines.filter((wine) => getDrinkabilityInfo(wine).status === 'Peak window');
  const drinkSoon = wines.filter((wine) => ['Nearing end of peak', 'Past peak'].includes(getDrinkabilityInfo(wine).status));

  const byRegion = groupCount(wines, (wine) => wine.region);
  const byStyle = groupCount(wines, (wine) => wine.style);
  const byDecade = groupCount(wines, (wine) => decadeLabel(wine.vintage));
  const byDrinkWindow = groupCount(wines, (wine) => String(wine.bestDrinkBy));
  const recentlyAdded = [...wines]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  const peakByRating = [...atPeak].sort((a, b) => (b.personalRating ?? 0) - (a.personalRating ?? 0));

  return (
    <div className="space-y-6">
      <section className="panel p-4 lg:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Today</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-ink">Your cellar, at a glance</h2>
            <p className="mt-2 text-sm leading-6 text-smoke">
              {readyNow.length} ready now · {atPeak.length} at peak · {totalBottles} bottles total
            </p>
          </div>
          {onCreateWine ? (
            <button className="premium-button shrink-0 px-3" type="button" onClick={onCreateWine}>
              Add
            </button>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total bottles" value={String(totalBottles)} helper={`${wines.length} unique wines`} icon="bottle" />
        <MetricCard label="Collection value" value={formatCurrency(collectionValue)} helper="Estimated market value" icon="analytics" tone="gold" />
        <MetricCard label="Average rating" value={formatRating(averageRating)} helper={`${ratedWines.length} bottles rated`} icon="star" tone="moss" />
        <MetricCard label="Ready now" value={String(readyNow.length)} helper={`${pastPeak.length} past peak · ${nextTwoYears.length} upcoming`} icon="glass" tone={pastPeak.length ? 'clay' : 'vine'} />
      </div>

      <div className="grid gap-4 lg:hidden">
        <MobileBottleList title="Drink now" wines={readyNow} emptyText="Nothing is calling urgently right now." onSelectWine={onSelectWine} />
        <MobileBottleList title="Recently added" wines={recentlyAdded} emptyText="New bottles will land here after you add them." onSelectWine={onSelectWine} />
        <MobileBottleList title="At peak" wines={peakByRating} emptyText="No peak-window bottles yet." onSelectWine={onSelectWine} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel overflow-hidden">
          <div className="drink-soon-header border-b border-ink/10 px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-white/70">Today’s cellar read</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Drink Soon</h2>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <PriorityStrip title="High priority" wines={drinkSoon} onSelectWine={onSelectWine} />
            <PriorityStrip title="At peak" wines={peakByRating} onSelectWine={onSelectWine} />
          </div>
        </section>

        <section id="analytics" className="panel hidden scroll-mt-32 p-5 lg:block">
          <div>
            <p className="section-kicker">Analytics</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-ink">Collection shape</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <BarList title="By region" data={byRegion} />
            <BarList title="By style" data={byStyle} />
            <BarList title="By decade" data={byDecade} />
            <BarList title="Drink-by years" data={byDrinkWindow} />
          </div>
        </section>
      </div>
    </div>
  );
}
