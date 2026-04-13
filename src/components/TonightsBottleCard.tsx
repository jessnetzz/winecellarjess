import { useMemo, useState } from 'react';
import DrinkStatusBadge from './DrinkStatusBadge';
import { Wine } from '../types/wine';
import { getDrinkabilityInfo } from '../utils/drinkWindow';

interface TonightsBottleCardProps {
  wines: Wine[];
  onSelectWine?: (wine: Wine) => void;
}

function scoreWine(wine: Wine) {
  const drinkInfo = getDrinkabilityInfo(wine);
  const ratingScore = wine.personalRating ? Math.max(0, wine.personalRating - 80) : 6;
  const quantityScore = Math.min(wine.quantity, 3) * 2;
  const openedPenalty = wine.status === 'opened' ? -10 : 0;
  const consumedPenalty = wine.status === 'consumed' ? -999 : 0;

  return drinkInfo.urgencyScore + ratingScore + quantityScore + openedPenalty + consumedPenalty;
}

function recommendationFor(wine: Wine) {
  const status = getDrinkabilityInfo(wine).status;

  if (status === 'Peak window') {
    return 'Drinking beautifully now, with enough presence to feel a little special.';
  }

  if (status === 'Nearing end of peak') {
    return 'A thoughtful candidate for dinner tonight before it slips further along.';
  }

  if (status === 'Ready to drink') {
    return 'This one looks ready and would make a lovely bottle to open tonight.';
  }

  return 'Not perfectly in its moment, but still worth a look if it feels right tonight.';
}

export default function TonightsBottleCard({ wines, onSelectWine }: TonightsBottleCardProps) {
  const candidates = useMemo(
    () =>
      wines
        .filter((wine) => wine.status !== 'consumed' && wine.quantity > 0)
        .sort((a, b) => {
          const scoreDifference = scoreWine(b) - scoreWine(a);
          if (scoreDifference !== 0) return scoreDifference;
          return a.name.localeCompare(b.name);
        }),
    [wines],
  );
  const [offset, setOffset] = useState(0);
  const wine = candidates.length ? candidates[offset % candidates.length] : undefined;

  if (!wine) {
    return (
      <section className="tonights-bottle-card" aria-labelledby="tonights-bottle-heading">
        <p id="tonights-bottle-heading" className="section-kicker">Tonight’s Bottle</p>
        <p className="mt-3 font-serif text-2xl font-bold text-ink">Nothing is calling perfectly tonight.</p>
        <p className="mt-3 text-sm leading-6 text-smoke">
          Maybe browse your cellar and choose something special.
        </p>
      </section>
    );
  }

  const location = [wine.appellation || wine.region, wine.country].filter(Boolean).join(', ');

  return (
    <section className="tonights-bottle-card" aria-labelledby="tonights-bottle-heading">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p id="tonights-bottle-heading" className="section-kicker">Tonight’s Bottle</p>
          <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-ink">
            {wine.vintage} {wine.name}
          </h2>
          <p className="mt-2 text-sm font-semibold text-smoke">{wine.producer}</p>
        </div>
        <span className="shrink-0 rounded-lg bg-gold/15 px-3 py-2 text-lg" aria-hidden="true">🌙</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DrinkStatusBadge wine={wine} compact />
        {location ? <span className="rounded-md bg-white/70 px-2.5 py-1 text-xs font-bold text-smoke">{location}</span> : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-ink">{recommendationFor(wine)}</p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {onSelectWine ? (
          <button className="premium-button" type="button" onClick={() => onSelectWine(wine)}>
            View bottle
          </button>
        ) : null}
        {candidates.length > 1 ? (
          <button className="secondary-button bg-white/80" type="button" onClick={() => setOffset((current) => current + 1)}>
            Show another
          </button>
        ) : null}
      </div>
    </section>
  );
}
