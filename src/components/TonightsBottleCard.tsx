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

function buildCardNoteSummary(body?: string) {
  if (!body) return '';

  const normalized = body.replace(/\s+/g, ' ').trim();
  const sentences = normalized.match(/[^.!?]+[.!?]+/g)?.map((sentence) => sentence.trim()) ?? [normalized];
  const firstSentence = sentences[0] ?? normalized;

  if (firstSentence.length >= 110 || sentences.length === 1) {
    return firstSentence;
  }

  const secondSentence = sentences[1];
  if (!secondSentence) return firstSentence;

  const combined = `${firstSentence} ${secondSentence}`;
  return combined.length <= 190 ? combined : firstSentence;
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
  ).slice(0, 2);
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
  const cardNoteSummary = useMemo(
    () => buildCardNoteSummary(tonightRecommendation?.body),
    [tonightRecommendation?.body],
  );
  const hasFullNote = Boolean(tonightRecommendation?.body && cardNoteSummary && tonightRecommendation.body.trim() !== cardNoteSummary.trim());

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
    <section className="tonights-bottle-card space-y-4" aria-labelledby="tonights-bottle-heading">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/70 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            <p id="tonights-bottle-heading" className="section-kicker text-[11px] text-plum/85">Tonight’s Bottle</p>
          </div>
          <h2 className="mt-2 font-serif text-[1.9rem] font-bold leading-[1.05] text-ink">
            {wine.vintage} {wine.name}
          </h2>
          <p className="mt-2 text-sm font-semibold text-smoke">{wine.producer}</p>
        </div>
        <span className="shrink-0 rounded-lg bg-gold/12 px-2.5 py-2 text-base" aria-hidden="true">🌙</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DrinkStatusBadge wine={wine} compact />
        {location ? <span className="rounded-md bg-white/70 px-2.5 py-1 text-xs font-semibold text-smoke">{location}</span> : null}
      </div>
      {weatherContextLabel ? (
        <p className="rounded-md bg-lavender/18 px-2.5 py-1.5 text-xs font-semibold leading-5 text-plum">
          {weatherContextLabel}
        </p>
      ) : null}
      {!weatherContext && !weatherAttempted ? (
        <p className="text-xs font-semibold text-smoke/80">Checking tonight’s weather...</p>
      ) : null}

      <div className="border-t border-gold/15 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#7B5A22]">Tonight's note</p>
        <p className="mt-2 font-serif text-[1.5rem] font-bold leading-[1.1] text-ink">{tonightRecommendation?.heading ?? 'Why tonight'}</p>
        <p className="mt-2 text-sm leading-6 text-ink/90">
          {cardNoteSummary || tonightRecommendation?.body}
        </p>
        {hasFullNote && onSelectWine ? (
          <button
            className="ghost-button mt-2 px-0 py-0 text-xs font-bold uppercase tracking-wide text-plum"
            type="button"
            onClick={() => onSelectWine(wine)}
          >
            Read full note
          </button>
        ) : null}
        {tonightChips.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {tonightChips.map((chip) => (
              <span key={chip} className="rounded-md bg-paper px-2.5 py-1 text-[11px] font-semibold text-smoke">
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 pt-1">
        {onSelectWine ? (
          <button className="premium-button w-full justify-center" type="button" onClick={() => onSelectWine(wine)}>
            View bottle
          </button>
        ) : null}
        {candidates.length > 1 ? (
          <button className="secondary-button w-full justify-center bg-white/80" type="button" onClick={() => setOffset((current) => current + 1)}>
            Show another
          </button>
        ) : null}
      </div>
    </section>
  );
}
