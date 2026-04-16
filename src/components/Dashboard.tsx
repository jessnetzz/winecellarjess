import CellarInsights from './CellarInsights';
import Icon, { IconName } from './Icon';
import { Wine, WineStyle } from '../types/wine';
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

const OLD_WORLD_COUNTRIES = new Set(['France', 'Italy', 'Spain', 'Portugal', 'Germany', 'Austria', 'Greece']);
const NEW_WORLD_COUNTRIES = new Set(['United States', 'Australia', 'New Zealand', 'Chile', 'Argentina', 'South Africa', 'Canada']);
const COMPOSITION_COLORS = ['bg-plum', 'bg-clay', 'bg-lavender', 'bg-moss', 'bg-[#D986A4]'];

function topEntries(data: Record<string, number>, limit = 6) {
  return Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);
}

function normalizeWineType(style: WineStyle) {
  const mapped = {
    red: 'Red',
    white: 'White',
    rose: 'Rosé',
    sparkling: 'Sparkling',
  } as const;

  return mapped[style as keyof typeof mapped] ?? null;
}

function getWineTypeData(wines: Wine[]) {
  const totals: Record<'Red' | 'White' | 'Rosé' | 'Sparkling', number> = {
    Red: 0,
    White: 0,
    Rosé: 0,
    Sparkling: 0,
  };

  wines.forEach((wine) => {
    const normalized = normalizeWineType(wine.style);
    if (!normalized) return;
    totals[normalized] += wine.quantity;
  });

  return totals;
}

function getTopRegionsData(wines: Wine[]) {
  const regionCounts = wines.reduce<Record<string, number>>((result, wine) => {
    const label = wine.region?.trim() || 'Unknown';
    result[label] = (result[label] ?? 0) + wine.quantity;
    return result;
  }, {});

  const unknownCount = regionCounts.Unknown ?? 0;
  delete regionCounts.Unknown;

  const sortedRegions = Object.entries(regionCounts).sort(([, a], [, b]) => b - a);
  const topFive = sortedRegions.slice(0, 5);
  const otherCount = sortedRegions.slice(5).reduce((sum, [, count]) => sum + count, 0);

  const result: Record<string, number> = Object.fromEntries(topFive);
  if (otherCount > 0) result.Other = otherCount;
  if (unknownCount > 0) result.Unknown = unknownCount;

  return result;
}

function getWorldSplitData(wines: Wine[]) {
  const totals = {
    'Old World': 0,
    'New World': 0,
    Unknown: 0,
  };

  wines.forEach((wine) => {
    const country = wine.country?.trim();
    if (!country) {
      totals.Unknown += wine.quantity;
      return;
    }

    if (OLD_WORLD_COUNTRIES.has(country)) {
      totals['Old World'] += wine.quantity;
      return;
    }

    if (NEW_WORLD_COUNTRIES.has(country)) {
      totals['New World'] += wine.quantity;
      return;
    }

    totals['New World'] += wine.quantity;
  });

  return totals;
}

function getVintageSpreadData(wines: Wine[]) {
  const totals = {
    '2020s': 0,
    '2010s': 0,
    '2000s': 0,
    Older: 0,
    Unknown: 0,
  };

  wines.forEach((wine) => {
    const vintage = wine.vintage;
    if (!Number.isFinite(vintage) || vintage <= 0) {
      totals.Unknown += wine.quantity;
    } else if (vintage >= 2020) {
      totals['2020s'] += wine.quantity;
    } else if (vintage >= 2010) {
      totals['2010s'] += wine.quantity;
    } else if (vintage >= 2000) {
      totals['2000s'] += wine.quantity;
    } else {
      totals.Older += wine.quantity;
    }
  });

  return Object.fromEntries(Object.entries(totals).filter(([, count]) => count > 0));
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

function TopRegionsCard({ data }: { data: Record<string, number> }) {
  const entries = topEntries(data);
  const max = Math.max(...entries.map(([, value]) => value), 1);

  return (
    <div className="soft-card">
      <h3 className="font-serif text-xl font-bold text-ink">Top Regions</h3>
      <div className="mt-5 space-y-4">
        {entries.map(([label, value], index) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-ink">{label}</span>
              <span className="font-bold text-smoke">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink/10">
              <div
                className={`h-full rounded-full ${COMPOSITION_COLORS[index % COMPOSITION_COLORS.length]}`}
                style={{ width: value > 0 ? `${Math.max(8, (value / max) * 100)}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WineTypesCard({ data }: { data: Record<'Red' | 'White' | 'Rosé' | 'Sparkling', number> }) {
  const entries = Object.entries(data).filter(([, value]) => value > 0) as Array<[keyof typeof data, number]>;
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const typeColors: Record<keyof typeof data, string> = {
    Red: 'bg-plum',
    White: 'bg-clay',
    Rosé: 'bg-[#D986A4]',
    Sparkling: 'bg-lavender',
  };

  return (
    <div className="soft-card">
      <h3 className="font-serif text-xl font-bold text-ink">Wine Types</h3>
      <div className="mt-5 overflow-hidden rounded-full bg-ink/10">
        <div className="flex h-4 w-full">
          {entries.map(([label, value]) => (
            <div
              key={label}
              className={typeColors[label]}
              style={{ width: total ? `${(value / total) * 100}%` : '0%' }}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {entries.map(([label, value]) => (
          <div key={label} className="rounded-md border border-ink/10 bg-white/75 px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${typeColors[label]}`} aria-hidden="true" />
              <span className="text-sm font-semibold text-ink">{label}</span>
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-smoke">{value} bottles</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorldSplitCard({ data }: { data: Record<'Old World' | 'New World' | 'Unknown', number> }) {
  const entries = (Object.entries(data) as Array<[keyof typeof data, number]>).filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const splitColors: Record<keyof typeof data, string> = {
    'Old World': 'bg-plum',
    'New World': 'bg-clay',
    Unknown: 'bg-smoke/35',
  };

  return (
    <div className="soft-card">
      <h3 className="font-serif text-xl font-bold text-ink">World Split</h3>
      <div className="mt-5 overflow-hidden rounded-lg border border-ink/10 bg-white/70 p-3 shadow-sm">
        <div className="flex h-5 overflow-hidden rounded-full bg-ink/10">
          {entries.map(([label, value]) => (
            <div
              key={label}
              className={splitColors[label]}
              style={{ width: total ? `${(value / total) * 100}%` : '0%' }}
            />
          ))}
        </div>
        <div className="mt-4 space-y-2.5">
          {entries.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${splitColors[label]}`} aria-hidden="true" />
                <span className="font-semibold text-ink">{label}</span>
              </div>
              <span className="font-bold text-smoke">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VintageSpreadCard({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, value]) => value), 1);

  return (
    <div className="soft-card">
      <h3 className="font-serif text-xl font-bold text-ink">Vintage Spread</h3>
      <div className="mt-5 flex min-h-[180px] items-end justify-between gap-3">
        {entries.map(([label, value], index) => (
          <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-smoke">{value}</span>
            <div className="flex h-28 w-full items-end rounded-t-md bg-ink/8 px-1.5 pt-1.5">
              <div
                className={`w-full rounded-t-md ${COMPOSITION_COLORS[index % COMPOSITION_COLORS.length]}`}
                style={{ height: `${Math.max(14, (value / max) * 100)}%` }}
              />
            </div>
            <span className="text-center text-xs font-semibold leading-4 text-ink">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ wines }: DashboardProps) {
  const totalBottles = wines.reduce((sum, wine) => sum + wine.quantity, 0);
  const collectionValue = wines.reduce((sum, wine) => sum + wine.marketValue * wine.quantity, 0);
  const ratedWines = wines.filter((wine) => wine.personalRating);
  const averageRating = ratedWines.length
    ? ratedWines.reduce((sum, wine) => sum + (wine.personalRating ?? 0), 0) / ratedWines.length
    : undefined;
  const readyNow = wines.filter(isDrinkableNow);
  const pastPeak = wines.filter((wine) => getDrinkabilityInfo(wine).status === 'Past peak');
  const nextTwoYears = wines.filter(isInNextTwoYears);

  const wineTypes = getWineTypeData(wines);
  const topRegions = getTopRegionsData(wines);
  const worldSplit = getWorldSplitData(wines);
  const vintageSpread = getVintageSpreadData(wines);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total bottles" value={String(totalBottles)} helper={`${wines.length} unique wines`} icon="bottle" />
        <MetricCard label="Collection value" value={formatCurrency(collectionValue)} helper="Estimated market value" icon="analytics" tone="gold" />
        <MetricCard label="Average rating" value={formatRating(averageRating)} helper={`${ratedWines.length} bottles rated`} icon="star" tone="moss" />
        <MetricCard label="Ready now" value={String(readyNow.length)} helper={`${pastPeak.length} past peak · ${nextTwoYears.length} upcoming`} icon="glass" tone={pastPeak.length ? 'clay' : 'vine'} />
      </div>

      <section id="analytics" className="panel scroll-mt-32 overflow-hidden">
        <div className="drink-soon-header border-b border-ink/10 px-5 py-5 text-center text-white">
          <h2 className="font-liam text-[2.35rem] font-normal leading-none text-white sm:text-[2.55rem]">
            Cellar Composition
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            A quick look at the types, regions, vintages, and world balance in your collection.
          </p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <WineTypesCard data={wineTypes} />
          <TopRegionsCard data={topRegions} />
          <WorldSplitCard data={worldSplit} />
          <VintageSpreadCard data={vintageSpread} />
        </div>
      </section>
    </div>
  );
}
