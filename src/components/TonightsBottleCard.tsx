import { useEffect, useMemo, useState } from 'react';
import { getLocalWeather, LocalWeather } from '../services/localWeatherService';
import { mapWineToProfile } from '../services/wineAttributeMapper';
import { getProfileSupportChips } from '../services/wineProfileSelectors';
import { buildSommelierRecommendation } from '../services/sommelierReasoningEngine';
import { Wine } from '../types/wine';
import { isDrinkableNow } from '../utils/drinkWindow';
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

function getBottleMomentLabel(date = new Date()) {
  const hour = date.getHours();
  return hour >= 5 && hour < 16 ? 'Today’s Bottle' : 'Tonight’s Bottle';
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
  const [bottleMomentLabel, setBottleMomentLabel] = useState(() => getBottleMomentLabel());
  const weatherContext = useMemo(() => getWeatherRecommendationContext(weather), [weather]);
  const candidates = useMemo(
    () =>
      wines
        .filter((wine) => wine.status !== 'consumed' && wine.quantity > 0 && isDrinkableNow(wine))
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

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBottleMomentLabel(getBottleMomentLabel());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  if (!wine) {
    return (
      <section className="tonights-bottle-card" aria-labelledby="tonights-bottle-heading">
        <p id="tonights-bottle-heading" className="section-kicker">{bottleMomentLabel}</p>
        <p className="mt-3 font-serif text-2xl font-bold text-ink">Nothing is calling perfectly tonight.</p>
        <p className="mt-3 text-sm leading-6 text-smoke">
          Maybe browse your cellar and choose something special.
        </p>
      </section>
    );
  }
  return (
    <section className="tonights-bottle-card space-y-5" aria-labelledby="tonights-bottle-heading">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-plum/18 bg-white/78 px-3 py-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            <p id="tonights-bottle-heading" className="text-[12px] font-bold uppercase tracking-[0.16em] text-plum">{bottleMomentLabel}</p>
          </div>
          {weatherContextLabel ? (
            <p className="mx-auto mt-3 inline-flex max-w-fit items-center justify-center rounded-full border border-lavender/18 bg-lavender/18 px-3 py-1.5 text-xs font-semibold leading-5 text-plum shadow-sm">
              {weatherContextLabel}
            </p>
          ) : null}
          {!weatherContext && !weatherAttempted ? (
            <p className="mt-3 text-xs font-semibold text-smoke/80">Checking tonight’s weather...</p>
          ) : null}
          <h2 className="mx-auto mt-4 max-w-[15ch] font-liam text-[1.32rem] font-normal leading-[1.12] text-ink sm:text-[1.48rem]">
            {wine.vintage} {wine.name}
          </h2>
        </div>
        <span className="shrink-0 rounded-lg bg-gold/12 px-2.5 py-2 text-base" aria-hidden="true">🌙</span>
      </div>

      <div className="rounded-lg border border-gold/15 bg-white/55 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/18 bg-white/78 px-3 py-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#7B5A22]">{tonightRecommendation?.heading ?? 'Why tonight'}</p>
          </div>
        </div>
        <p className="mt-3 text-center text-sm leading-6 text-ink/90">
          {cardNoteSummary || tonightRecommendation?.body}
        </p>
        {hasFullNote && onSelectWine ? (
          <div className="mt-3 flex justify-center">
            <button
              className="ghost-button px-0 py-0 text-[11px] font-bold uppercase tracking-[0.14em] text-plum"
              type="button"
              onClick={() => onSelectWine(wine)}
            >
              Read full note
            </button>
          </div>
        ) : null}
        {tonightChips.length ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
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
