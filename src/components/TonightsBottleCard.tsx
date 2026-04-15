import { useEffect, useMemo, useState } from 'react';
import DrinkStatusBadge from './DrinkStatusBadge';
import { getLocalWeather, LocalWeather } from '../services/localWeatherService';
import { mapWineToProfile } from '../services/wineAttributeMapper';
import { getProfileSupportChips } from '../services/wineProfileSelectors';
import { buildSommelierRecommendation } from '../services/sommelierReasoningEngine';
import { Wine } from '../types/wine';
import {
  getRecommendationScoreBreakdown,
  getWeatherContextLabel,
  getWeatherRecommendationContext,
  scoreTonightsBottle,
} from '../utils/tonightsBottleWeatherMatrix';

interface TonightsBottleCardProps {
  wines: Wine[];
  onSelectWine?: (wine: Wine) => void;
}

export default function TonightsBottleCard({ wines, onSelectWine }: TonightsBottleCardProps) {
  const [offset, setOffset] = useState(0);
  const [weather, setWeather] = useState<LocalWeather | null>(null);
  const [weatherAttempted, setWeatherAttempted] = useState(false);
  const weatherContext = useMemo(() => getWeatherRecommendationContext(weather), [weather]);
  const candidates = useMemo(
    () =>
      wines
        .filter((wine) => wine.status !== 'consumed' && wine.quantity > 0)
        .sort((a, b) => {
          const scoreDifference = scoreTonightsBottle(b, weatherContext) - scoreTonightsBottle(a, weatherContext);
          if (scoreDifference !== 0) return scoreDifference;
          return a.name.localeCompare(b.name);
        }),
    [wines, weatherContext],
  );
  const wine = candidates.length ? candidates[offset % candidates.length] : undefined;
  const weatherContextLabel = getWeatherContextLabel(weatherContext);
  const profile = wine ? mapWineToProfile(wine) : null;
  const scoreBreakdown = wine ? getRecommendationScoreBreakdown(wine, weatherContext) : null;
  const tonightChips = Array.from(
    new Set([...(profile ? getProfileSupportChips(profile, 2) : []), ...((scoreBreakdown?.profileReasons ?? []).slice(0, 2))]),
  );
  const tonightRecommendation = useMemo(
    () =>
      wine
        ? buildSommelierRecommendation({
            wine,
            context: 'tonight',
            query: '',
            weatherContext,
          })
        : null,
    [wine, weatherContext],
  );

  useEffect(() => {
    let isMounted = true;

    getLocalWeather()
      .then((localWeather) => {
        if (isMounted) setWeather(localWeather);
      })
      .catch(() => {
        if (isMounted) setWeather(null);
      })
      .finally(() => {
        if (isMounted) setWeatherAttempted(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
        {weatherContextLabel ? (
          <span className="rounded-md bg-lavender/25 px-2.5 py-1 text-xs font-bold text-plum">
            {weatherContextLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-4 rounded-lg border border-gold/20 bg-porcelain/70 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#7B5A22]">Tonight's note</p>
        <p className="mt-2 font-serif text-xl font-bold leading-tight text-ink">{tonightRecommendation?.heading ?? 'Why tonight'}</p>
        <p className="mt-2 text-sm leading-6 text-ink">{tonightRecommendation?.body}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tonightChips.map((chip) => (
            <span key={chip} className="rounded-md bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-smoke shadow-sm">
              {chip}
            </span>
          ))}
        </div>
      </div>
      {!weatherContext && !weatherAttempted ? (
        <p className="mt-2 text-xs font-semibold text-smoke/80">Checking tonight’s weather...</p>
      ) : null}

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
