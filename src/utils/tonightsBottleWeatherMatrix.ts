import { LocalWeather } from '../services/localWeatherService';
import { mapWineToProfile } from '../services/wineAttributeMapper';
import { getProfileWeatherScore, ProfileTemperatureBand, ProfileWeatherCondition } from '../services/wineProfileSelectors';
import { Wine } from '../types/wine';
import { getDrinkabilityInfo } from './drinkWindow';

export type TemperatureBand = ProfileTemperatureBand;
export type WeatherConditionCategory = ProfileWeatherCondition;

export interface WeatherRecommendationContext {
  temperatureBand: TemperatureBand;
  condition: WeatherConditionCategory;
  mood: string;
  temperatureF: number;
  feelsLikeF?: number;
}

export interface RecommendationScoreBreakdown {
  readiness: number;
  rating: number;
  quantity: number;
  temperatureFit: number;
  conditionFit: number;
  profileBoost: number;
  interest: number;
  statusAdjustment: number;
  profileReasons: string[];
  total: number;
}

const TEMPERATURE_LABELS: Record<TemperatureBand, { label: string; mood: string }> = {
  cold: { label: 'Cold-night pick', mood: 'cozy, warming, and deep' },
  cool: { label: 'Cool evening pick', mood: 'relaxed, crisp, and comforting' },
  mild: { label: 'Mild evening pick', mood: 'balanced, easygoing, and adaptable' },
  warm: { label: 'Warm-weather recommendation', mood: 'fresh, social, and bright' },
  hot: { label: 'Hot-night refresher', mood: 'celebratory, refreshing, and easy' },
};

const CONDITION_LABELS: Record<WeatherConditionCategory, { label: string; mood: string }> = {
  rainy: { label: 'Rainy-night bottle', mood: 'introspective, cozy, and soft' },
  clear: { label: 'Clear-evening pick', mood: 'lively, open, and fresh' },
  cloudy: { label: 'Soft overcast pick', mood: 'calm, quiet, and balanced' },
  windy: { label: 'Brisk-evening pick', mood: 'lifted, brisk, and energetic' },
  snow: { label: 'Wintry cellar pick', mood: 'deep, warm, and indulgent' },
  neutral: { label: 'Evening-minded pick', mood: 'quietly suited to tonight' },
};

export function getTemperatureBand(temperatureF: number): TemperatureBand {
  if (temperatureF < 50) return 'cold';
  if (temperatureF < 60) return 'cool';
  if (temperatureF < 68) return 'mild';
  if (temperatureF < 78) return 'warm';
  return 'hot';
}

export function getWeatherConditionCategory(weather: LocalWeather): WeatherConditionCategory {
  const code = weather.weatherCode;

  if (typeof weather.windSpeedMph === 'number' && weather.windSpeedMph >= 18) return 'windy';
  if (code === undefined) return 'neutral';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rainy';
  if (code === 0 || code === 1) return 'clear';
  if (code === 2 || code === 3 || (code >= 45 && code <= 48)) return 'cloudy';

  return 'neutral';
}

export function getWeatherRecommendationContext(weather: LocalWeather | null): WeatherRecommendationContext | null {
  if (!weather) return null;

  const temperature = weather.apparentTemperatureF ?? weather.temperatureF;
  const temperatureBand = getTemperatureBand(temperature);
  const condition = getWeatherConditionCategory(weather);
  const conditionMood = condition === 'neutral' ? '' : `${CONDITION_LABELS[condition].mood}; `;

  return {
    temperatureBand,
    condition,
    mood: `${conditionMood}${TEMPERATURE_LABELS[temperatureBand].mood}`,
    temperatureF: weather.temperatureF,
    feelsLikeF: weather.apparentTemperatureF,
  };
}

function getInterestScore(wine: Wine) {
  const hasSpecificVarietal = wine.varietal.trim().length > 0;
  const valueSignal = wine.marketValue >= 75 ? 2 : wine.marketValue >= 40 ? 1 : 0;
  const specialBottleBonus = wine.style === 'sparkling' || wine.style === 'dessert' || wine.style === 'fortified' ? 2 : 0;

  return (hasSpecificVarietal ? 1 : 0) + valueSignal + specialBottleBonus;
}

export function getRecommendationScoreBreakdown(
  wine: Wine,
  weatherContext: WeatherRecommendationContext | null,
): RecommendationScoreBreakdown {
  const drinkInfo = getDrinkabilityInfo(wine);
  const profile = mapWineToProfile(wine);
  const profileWeatherScore = weatherContext
    ? getProfileWeatherScore(profile, weatherContext.temperatureBand, weatherContext.condition)
    : { temperatureFit: 0, conditionFit: 0, traitBoost: 0, total: 0, reasons: [] };
  const rating = wine.personalRating ? Math.max(0, wine.personalRating - 80) : 6;
  const quantity = Math.min(wine.quantity, 3) * 2;
  const statusAdjustment =
    (wine.status === 'opened' ? -10 : 0) +
    (wine.status === 'consumed' ? -999 : 0);
  const interest = getInterestScore(wine);
  const total =
    drinkInfo.urgencyScore +
    rating +
    quantity +
    profileWeatherScore.temperatureFit +
    profileWeatherScore.conditionFit +
    profileWeatherScore.traitBoost +
    interest +
    statusAdjustment;

  return {
    readiness: drinkInfo.urgencyScore,
    rating,
    quantity,
    temperatureFit: profileWeatherScore.temperatureFit,
    conditionFit: profileWeatherScore.conditionFit,
    profileBoost: profileWeatherScore.traitBoost,
    interest,
    statusAdjustment,
    profileReasons: profileWeatherScore.reasons,
    total,
  };
}

export function scoreTonightsBottle(wine: Wine, weatherContext: WeatherRecommendationContext | null) {
  return getRecommendationScoreBreakdown(wine, weatherContext).total;
}

export function getWeatherContextLabel(context: WeatherRecommendationContext | null) {
  if (!context) return null;

  const temperatureLabel =
    context.feelsLikeF && context.feelsLikeF !== context.temperatureF
      ? `${context.temperatureF}°F, feels like ${context.feelsLikeF}°`
      : `${context.temperatureF}°F`;
  const conditionLabel = CONDITION_LABELS[context.condition].label;
  const temperatureLabelPrefix = TEMPERATURE_LABELS[context.temperatureBand].label;

  return `${context.condition === 'neutral' ? temperatureLabelPrefix : conditionLabel} · ${temperatureLabel}`;
}

export function getWeatherAwareRecommendation(wine: Wine, weatherContext: WeatherRecommendationContext | null) {
  const status = getDrinkabilityInfo(wine).status;
  const profile = mapWineToProfile(wine);
  const wineLabel = wine.varietal || profile.styleLabel;
  const baseRecommendation =
    status === 'Peak window'
      ? 'It is drinking beautifully now, with enough presence to feel a little special.'
      : status === 'Nearing end of peak'
        ? 'It is a thoughtful candidate for dinner tonight before it slips further along.'
        : status === 'Ready to drink'
          ? 'It looks ready and would make a lovely bottle to open tonight.'
          : 'It is not perfectly in its moment, but still worth a look if it feels right tonight.';

  if (!weatherContext) return baseRecommendation;

  const weatherScore = getProfileWeatherScore(profile, weatherContext.temperatureBand, weatherContext.condition);
  const leadReason = weatherScore.reasons[0];

  if (leadReason === 'Rainy-night fit') {
    return `Cooler, rainy-night energy suits this ${wineLabel} beautifully — cozy without feeling heavy. ${baseRecommendation}`;
  }

  if (leadReason === 'Wintry bottle energy' || leadReason === 'Warming style') {
    return `A wintry evening gives this ${wineLabel} a warm, indulgent case for the table. ${baseRecommendation}`;
  }

  if (leadReason === 'Patio-friendly profile' || leadReason === 'Fresh warm-weather style') {
    return `Warmer weather makes this ${wineLabel} feel bright, fresh, and very easy to love tonight. ${baseRecommendation}`;
  }

  if (leadReason === 'Soft overcast fit') {
    return `A soft overcast evening suits this ${wineLabel} in a calm, quietly elegant way. ${baseRecommendation}`;
  }

  if (leadReason === 'Lift and structure for brisk weather') {
    return `A brisk evening calls for a bottle with a little lift and shape; this ${wineLabel} fits that mood. ${baseRecommendation}`;
  }

  if (weatherContext.temperatureBand === 'cold' || weatherContext.temperatureBand === 'cool') {
    return `Cooler weather gives this ${wineLabel} a cozy, deeper pull tonight. ${baseRecommendation}`;
  }

  if (weatherContext.temperatureBand === 'warm' || weatherContext.temperatureBand === 'hot') {
    return `Warmer weather gives this ${wineLabel} a fresh case for tonight. ${baseRecommendation}`;
  }

  return `Mild evening conditions make this ${wineLabel} feel easy, balanced, and right for tonight. ${baseRecommendation}`;
}
