import DrinkStatusBadge from './DrinkStatusBadge';
import CellarInsights from './CellarInsights';
import Icon, { IconName } from './Icon';
import { mapWineToProfile } from '../services/wineAttributeMapper';
import { getProfileContextSummary, getProfileSupportChips } from '../services/wineProfileSelectors';
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

interface CellarReadCardProps {
  featuredWine?: Wine;
  queue: Wine[];
  onSelectWine?: (wine: Wine) => void;
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

function urgencyScore(wine: Wine) {
  const drinkability = getDrinkabilityInfo(wine).status;
  let score = 0;

  if (drinkability === 'Past peak') score += 100;
  else if (drinkability === 'Nearing end of peak') score += 80;
  else if (drinkability === 'Peak window') score += 45;

  if (wine.bestDrinkBy) {
    score += Math.max(0, 10 - Math.max(0, wine.bestDrinkBy - new Date().getFullYear()));
  }

  score += Math.min(wine.quantity, 3);
  score += (wine.personalRating ?? 0) * 2;

  return score;
}

function sortCellarReadCandidates(wines: Wine[]) {
  return [...wines].sort((a, b) => urgencyScore(b) - urgencyScore(a));
}

function getFeaturedBottleNote(wine: Wine) {
  const status = getDrinkabilityInfo(wine).status;
  const profile = mapWineToProfile(wine);

  if (status === 'Past peak') {
    return 'Still lovely, but this bottle is already asking not to be left waiting much longer.';
  }

  if (status === 'Nearing end of peak') {
    return 'Still bright, still charming, but the window is asking for your attention.';
  }

  if (profile.styleFamily === 'rose' || profile.styleFamily === 'crisp_white' || profile.styleFamily === 'sparkling') {
    return 'Fresh, easygoing, and especially worth enjoying while all that lift is still singing.';
  }

  return 'This bottle is in a lovely place now and feels worth opening before the cellar starts changing the conversation.';
}

function getWhyThisPickReasons(wine: Wine) {
  const reasons: string[] = [];
  const status = getDrinkabilityInfo(wine).status;
  const profile = mapWineToProfile(wine);

  if (status === 'Past peak') reasons.push('It is already past its ideal peak.');
  else if (status === 'Nearing end of peak') reasons.push('Its drink window is starting to narrow.');
  else if (status === 'Peak window') reasons.push('It is drinking beautifully right now.');

  if (['rose', 'crisp_white', 'sparkling'].includes(profile.styleFamily)) {
    reasons.push('Its fresher style is especially nice while it is still bright and lively.');
  } else if (['light_red', 'medium_red'].includes(profile.styleFamily)) {
    reasons.push('It has the kind of gentle structure that feels very dinner-ready.');
  } else if (profile.styleFamily === 'bold_red' || profile.styleFamily === 'rich_white') {
    reasons.push('It has enough depth to feel special without needing more cellar time.');
  }

  if (wine.quantity > 1) reasons.push('You have more than one bottle, so opening one feels easy.');
  if ((wine.personalRating ?? 0) >= 4) reasons.push('You rated it highly enough to trust the instinct.');

  return reasons.slice(0, 4);
}

function FeaturedBottleCard({ featuredWine, onSelectWine }: { featuredWine?: Wine; onSelectWine?: (wine: Wine) => void }) {
  if (!featuredWine) {
    return (
      <div className="priority-card flex min-h-[260px] flex-col justify-center">
        <p className="section-kicker">Featured pick</p>
        <h3 className="mt-3 font-serif text-3xl font-bold text-ink">Nothing is rushing you tonight.</h3>
        <p className="mt-3 max-w-xl text-sm leading-6 text-smoke">
          Your cellar is patient right now — no bottle needs urgent attention.
        </p>
      </div>
    );
  }

  const profile = mapWineToProfile(featuredWine);
  const chips = Array.from(new Set([
    getDrinkabilityInfo(featuredWine).status === 'Peak window' ? 'Drinking beautifully' : 'Drink soon',
    ...getProfileSupportChips(profile, 3),
  ])).slice(0, 4);

  return (
    <button
      type="button"
      className="priority-card group block w-full text-left"
      onClick={() => onSelectWine?.(featuredWine)}
    >
      <p className="section-kicker">Featured bottle</p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-[1.9rem] font-bold leading-9 text-ink group-hover:text-plum">
            {featuredWine.vintage} {featuredWine.name}
          </h3>
          <p className="mt-2 text-base font-semibold text-smoke">{featuredWine.producer || featuredWine.region || 'Cellar pick'}</p>
        </div>
        <span className="rounded-md border border-gold/35 bg-gold/10 px-3 py-1 text-xs font-bold text-[#8A6727]">
          {getDrinkabilityInfo(featuredWine).status === 'Peak window' ? 'Drinking beautifully' : 'Drink soon'}
        </span>
      </div>
      {(featuredWine.region || featuredWine.style) ? (
        <p className="mt-3 text-sm leading-6 text-smoke">
          {[featuredWine.region, featuredWine.style].filter(Boolean).join(' · ')}
        </p>
      ) : null}
      <p className="mt-4 max-w-2xl text-sm leading-6 text-smoke">
        {getFeaturedBottleNote(featuredWine)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span key={chip} className="rounded-md bg-white/75 px-2.5 py-1 text-[11px] font-semibold text-smoke">
            {chip}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-plum/80">Open this soon</p>
    </button>
  );
}

function CellarReadSidebar({ featuredWine, queue, onSelectWine }: CellarReadCardProps) {
  const whyReasons = featuredWine ? getWhyThisPickReasons(featuredWine) : [];

  return (
    <div className="grid gap-4">
      <div className="priority-card">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-xl font-bold text-ink">Also worth attention</h3>
          <span className="rounded-md bg-plum/10 px-2.5 py-1 text-xs font-bold text-plum">{queue.length}</span>
        </div>
        <div className="mt-4 space-y-2.5">
          {queue.length ? (
            queue.map((wine) => (
              <button
                key={wine.id}
                type="button"
                className="interactive-surface group flex w-full items-start justify-between gap-3 rounded-md border border-transparent px-2.5 py-2.5 text-left hover:-translate-y-px hover:border-plum/20 hover:bg-paper hover:shadow-sm"
                onClick={() => onSelectWine?.(wine)}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink group-hover:text-plum">{wine.vintage} {wine.name}</p>
                  <p className="truncate text-sm text-smoke">{wine.producer || wine.region || 'Cellar pick'}</p>
                  <p className="mt-1 text-xs leading-5 text-smoke">
                    {getDrinkabilityInfo(wine).status === 'Peak window' ? 'Ready when you are.' : 'Worth opening soon.'}
                  </p>
                </div>
                <span className="rounded-md bg-white/75 px-2 py-1 text-[11px] font-semibold text-smoke">
                  {getDrinkabilityInfo(wine).status === 'Peak window' ? 'Beautiful now' : 'Drink soon'}
                </span>
              </button>
            ))
          ) : (
            <p className="text-sm leading-6 text-smoke">No urgent bottles waiting.</p>
          )}
        </div>
      </div>

      <div className="priority-card sidebar-note">
        <p className="section-kicker">Why this pick?</p>
        {featuredWine ? (
          <ul className="mt-4 space-y-2">
            {whyReasons.map((reason) => (
              <li key={reason} className="flex gap-2 text-sm leading-6 text-smoke">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold/70" aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-smoke">
            No urgent logic to explain tonight. The cellar can rest.
          </p>
        )}
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
  const atPeak = wines.filter((wine) => getDrinkabilityInfo(wine).status === 'Peak window');
  const drinkSoon = wines.filter((wine) => ['Nearing end of peak', 'Past peak'].includes(getDrinkabilityInfo(wine).status));
  const featuredQueue = sortCellarReadCandidates([...drinkSoon, ...atPeak]);
  const featuredWine = featuredQueue[0];
  const attentionQueue = featuredQueue.slice(1, 5);

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
        <MetricCard label="Ready now" value={String(readyNow.length)} helper={`${pastPeak.length} past peak · ${nextTwoYears.length} upcoming`} icon="glass" tone={pastPeak.length ? 'clay' : 'vine'} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel overflow-hidden">
          <div className="drink-soon-header border-b border-ink/10 px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-white/70">Today’s cellar read</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Drink Soon</h2>
          </div>
          <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <FeaturedBottleCard featuredWine={featuredWine} onSelectWine={onSelectWine} />
            <CellarReadSidebar featuredWine={featuredWine} queue={attentionQueue} onSelectWine={onSelectWine} />
          </div>
        </section>

        <div className="space-y-5">
          <CellarInsights wines={wines} />

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
      </div>
    </div>
  );
}
