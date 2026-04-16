import CellarInsights from './CellarInsights';
import Icon, { IconName } from './Icon';
import { Wine } from '../types/wine';
import { formatCurrency, formatRating } from '../utils/formatters';
import { getDrinkabilityInfo, isDrinkableNow, isInNextTwoYears } from '../utils/drinkWindow';

interface DashboardProps {
  wines: Wine[];
  onSelectWine?: (wine: Wine) => void;
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

export default function Dashboard({ wines, onSelectWine }: DashboardProps) {
  const totalBottles = wines.reduce((sum, wine) => sum + wine.quantity, 0);
  const collectionValue = wines.reduce((sum, wine) => sum + wine.marketValue * wine.quantity, 0);
  const ratedWines = wines.filter((wine) => wine.personalRating);
  const averageRating = ratedWines.length
    ? ratedWines.reduce((sum, wine) => sum + (wine.personalRating ?? 0), 0) / ratedWines.length
    : undefined;
  const readyNow = wines.filter(isDrinkableNow);
  const pastPeak = wines.filter((wine) => getDrinkabilityInfo(wine).status === 'Past peak');
  const nextTwoYears = wines.filter(isInNextTwoYears);

  const byRegion = groupCount(wines, (wine) => wine.region);
  const byStyle = groupCount(wines, (wine) => wine.style);
  const byDecade = groupCount(wines, (wine) => decadeLabel(wine.vintage));
  const byDrinkWindow = groupCount(wines, (wine) => String(wine.bestDrinkBy));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total bottles" value={String(totalBottles)} helper={`${wines.length} unique wines`} icon="bottle" />
        <MetricCard label="Collection value" value={formatCurrency(collectionValue)} helper="Estimated market value" icon="analytics" tone="gold" />
        <MetricCard label="Average rating" value={formatRating(averageRating)} helper={`${ratedWines.length} bottles rated`} icon="star" tone="moss" />
        <CellarInsights wines={wines} variant="compact" />
      </div>

      <section id="analytics" className="panel scroll-mt-32 overflow-hidden">
        <div className="drink-soon-header border-b border-ink/10 px-5 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">Analytics</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">Collection shape</h2>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <BarList title="By region" data={byRegion} />
          <BarList title="By style" data={byStyle} />
          <BarList title="By decade" data={byDecade} />
          <BarList title="Drink-by years" data={byDrinkWindow} />
        </div>
      </section>
    </div>
  );
}
