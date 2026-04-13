import { LocalWeather } from '../services/localWeatherService';
import { Wine } from '../types/wine';
import { getDrinkabilityInfo } from './drinkWindow';

export type TemperatureBand = 'cold' | 'cool' | 'mild' | 'warm' | 'hot';
export type WeatherConditionCategory = 'rainy' | 'clear' | 'cloudy' | 'windy' | 'snow' | 'neutral';
export type WineWeatherGroup =
  | 'bold_red'
  | 'medium_red'
  | 'light_red'
  | 'crisp_white'
  | 'rich_white'
  | 'rose'
  | 'sparkling'
  | 'dessert'
  | 'fortified'
  | 'other';

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
  interest: number;
  statusAdjustment: number;
  total: number;
}

const TEMPERATURE_MATRIX: Record<TemperatureBand, { label: string; mood: string; groups: Partial<Record<WineWeatherGroup, number>> }> = {
  cold: {
    label: 'Cold-night pick',
    mood: 'cozy, warming, and deep',
    groups: { bold_red: 13, fortified: 8, dessert: 5, medium_red: 4, crisp_white: -4, rose: -5, sparkling: -3 },
  },
  cool: {
    label: 'Cool evening pick',
    mood: 'relaxed, crisp, and comforting',
    groups: { light_red: 12, medium_red: 10, bold_red: 5, rich_white: 3, crisp_white: -2, rose: -2 },
  },
  mild: {
    label: 'Mild evening pick',
    mood: 'balanced, easygoing, and adaptable',
    groups: { light_red: 8, rich_white: 8, crisp_white: 5, medium_red: 5, rose: 4, sparkling: 3 },
  },
  warm: {
    label: 'Warm-weather recommendation',
    mood: 'fresh, social, and bright',
    groups: { rose: 12, crisp_white: 12, sparkling: 8, rich_white: 3, light_red: 1, bold_red: -5 },
  },
  hot: {
    label: 'Hot-night refresher',
    mood: 'celebratory, refreshing, and easy',
    groups: { sparkling: 14, crisp_white: 12, rose: 10, rich_white: 2, medium_red: -5, bold_red: -8 },
  },
};

const CONDITION_MATRIX: Record<WeatherConditionCategory, { label: string; mood: string; groups: Partial<Record<WineWeatherGroup, number>> }> = {
  rainy: {
    label: 'Rainy-night bottle',
    mood: 'introspective, cozy, and soft',
    groups: { light_red: 8, medium_red: 7, bold_red: 5, rich_white: 4, crisp_white: -2 },
  },
  clear: {
    label: 'Clear-evening pick',
    mood: 'lively, open, and fresh',
    groups: { rose: 7, crisp_white: 7, sparkling: 6, light_red: 2 },
  },
  cloudy: {
    label: 'Soft overcast pick',
    mood: 'calm, quiet, and balanced',
    groups: { rich_white: 7, light_red: 7, medium_red: 4, crisp_white: 3 },
  },
  windy: {
    label: 'Brisk-evening pick',
    mood: 'lifted, brisk, and energetic',
    groups: { crisp_white: 7, medium_red: 6, sparkling: 5, bold_red: 4 },
  },
  snow: {
    label: 'Wintry cellar pick',
    mood: 'deep, warm, and indulgent',
    groups: { bold_red: 12, fortified: 8, dessert: 7, medium_red: 5, crisp_white: -5, rose: -6 },
  },
  neutral: {
    label: 'Evening-minded pick',
    mood: 'quietly suited to tonight',
    groups: {},
  },
};

const GROUP_LABELS: Record<WineWeatherGroup, string> = {
  bold_red: 'bold red',
  medium_red: 'medium-bodied red',
  light_red: 'lighter red',
  crisp_white: 'crisp white',
  rich_white: 'fuller white',
  rose: 'rosé',
  sparkling: 'sparkling wine',
  dessert: 'dessert wine',
  fortified: 'fortified wine',
  other: 'wine',
};

const BOLD_RED_TERMS = ['cabernet', 'syrah', 'shiraz', 'malbec', 'bordeaux', 'petite sirah', 'mourvedre', 'monastrell', 'zinfandel'];
const MEDIUM_RED_TERMS = ['merlot', 'grenache', 'garnacha', 'tempranillo', 'sangiovese', 'rioja', 'nebbiolo', 'barbera', 'chianti'];
const LIGHT_RED_TERMS = ['pinot noir', 'gamay', 'beaujolais', 'zweigelt', 'trousseau', 'poulsard'];
const CRISP_WHITE_TERMS = ['sauvignon blanc', 'albarino', 'albariño', 'pinot grigio', 'pinot gris', 'riesling', 'gruner', 'grüner', 'vermentino', 'muscadet'];
const RICH_WHITE_TERMS = ['chardonnay', 'chenin blanc', 'viognier', 'marsanne', 'roussanne', 'white burgundy'];

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

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
  const conditionMood = condition === 'neutral' ? '' : `${CONDITION_MATRIX[condition].mood}; `;

  return {
    temperatureBand,
    condition,
    mood: `${conditionMood}${TEMPERATURE_MATRIX[temperatureBand].mood}`,
    temperatureF: weather.temperatureF,
    feelsLikeF: weather.apparentTemperatureF,
  };
}

export function getWineWeatherGroup(wine: Wine): WineWeatherGroup {
  const varietal = wine.varietal.toLowerCase();
  const searchable = `${wine.varietal} ${wine.name} ${wine.appellation} ${wine.region}`.toLowerCase();

  if (wine.style === 'sparkling') return 'sparkling';
  if (wine.style === 'rose') return 'rose';
  if (wine.style === 'dessert') return 'dessert';
  if (wine.style === 'fortified') return 'fortified';
  if (wine.style === 'red') {
    if (includesAny(searchable, LIGHT_RED_TERMS)) return 'light_red';
    if (includesAny(searchable, BOLD_RED_TERMS)) return 'bold_red';
    if (includesAny(searchable, MEDIUM_RED_TERMS)) return 'medium_red';
    return 'medium_red';
  }
  if (wine.style === 'white' || wine.style === 'orange') {
    if (includesAny(varietal, RICH_WHITE_TERMS) || includesAny(searchable, RICH_WHITE_TERMS)) return 'rich_white';
    if (includesAny(varietal, CRISP_WHITE_TERMS) || includesAny(searchable, CRISP_WHITE_TERMS)) return 'crisp_white';
    return wine.style === 'orange' ? 'rich_white' : 'crisp_white';
  }

  return 'other';
}

function getMatrixScore(
  groups: Partial<Record<WineWeatherGroup, number>>,
  wineGroup: WineWeatherGroup,
) {
  return groups[wineGroup] ?? 0;
}

function getInterestScore(wine: Wine, wineGroup: WineWeatherGroup) {
  const hasSpecificVarietal = wine.varietal.trim().length > 0;
  const specialGroupBonus = ['sparkling', 'fortified', 'dessert'].includes(wineGroup) ? 2 : 0;
  const valueSignal = wine.marketValue >= 75 ? 2 : wine.marketValue >= 40 ? 1 : 0;

  return (hasSpecificVarietal ? 1 : 0) + specialGroupBonus + valueSignal;
}

export function getRecommendationScoreBreakdown(
  wine: Wine,
  weatherContext: WeatherRecommendationContext | null,
): RecommendationScoreBreakdown {
  const drinkInfo = getDrinkabilityInfo(wine);
  const wineGroup = getWineWeatherGroup(wine);
  const rating = wine.personalRating ? Math.max(0, wine.personalRating - 80) : 6;
  const quantity = Math.min(wine.quantity, 3) * 2;
  const temperatureFit = weatherContext
    ? getMatrixScore(TEMPERATURE_MATRIX[weatherContext.temperatureBand].groups, wineGroup)
    : 0;
  const conditionFit = weatherContext
    ? getMatrixScore(CONDITION_MATRIX[weatherContext.condition].groups, wineGroup)
    : 0;
  const statusAdjustment =
    (wine.status === 'opened' ? -10 : 0) +
    (wine.status === 'consumed' ? -999 : 0);
  const interest = getInterestScore(wine, wineGroup);
  const total = drinkInfo.urgencyScore + rating + quantity + temperatureFit + conditionFit + interest + statusAdjustment;

  return {
    readiness: drinkInfo.urgencyScore,
    rating,
    quantity,
    temperatureFit,
    conditionFit,
    interest,
    statusAdjustment,
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
  const conditionLabel = CONDITION_MATRIX[context.condition].label;
  const temperatureLabelPrefix = TEMPERATURE_MATRIX[context.temperatureBand].label;

  return `${context.condition === 'neutral' ? temperatureLabelPrefix : conditionLabel} · ${temperatureLabel}`;
}

export function getWeatherAwareRecommendation(wine: Wine, weatherContext: WeatherRecommendationContext | null) {
  const status = getDrinkabilityInfo(wine).status;
  const wineGroup = getWineWeatherGroup(wine);
  const wineLabel = wine.varietal || GROUP_LABELS[wineGroup];
  const baseRecommendation =
    status === 'Peak window'
      ? 'It is drinking beautifully now, with enough presence to feel a little special.'
      : status === 'Nearing end of peak'
        ? 'It is a thoughtful candidate for dinner tonight before it slips further along.'
        : status === 'Ready to drink'
          ? 'It looks ready and would make a lovely bottle to open tonight.'
          : 'It is not perfectly in its moment, but still worth a look if it feels right tonight.';

  if (!weatherContext) return baseRecommendation;

  const condition = weatherContext.condition;
  if (condition === 'rainy') {
    return `Cooler, rainy-night energy suits this ${wineLabel} beautifully — cozy without feeling heavy. ${baseRecommendation}`;
  }

  if (condition === 'snow') {
    return `A wintry night gives this ${wineLabel} a warm, indulgent case for the table. ${baseRecommendation}`;
  }

  if (condition === 'clear' && ['rose', 'sparkling', 'crisp_white'].includes(wineGroup)) {
    return `Clear evening weather makes this ${GROUP_LABELS[wineGroup]} feel bright and easy to love. ${baseRecommendation}`;
  }

  if (condition === 'cloudy' && ['rich_white', 'light_red', 'medium_red'].includes(wineGroup)) {
    return `A soft overcast evening suits this ${wineLabel} in a calm, quietly elegant way. ${baseRecommendation}`;
  }

  if (condition === 'windy') {
    return `A brisk evening calls for a bottle with a little lift and shape; this ${wineLabel} fits that mood. ${baseRecommendation}`;
  }

  if (weatherContext.temperatureBand === 'cold') {
    return `Cold weather gives this ${GROUP_LABELS[wineGroup]} a cozy, deeper pull tonight. ${baseRecommendation}`;
  }

  if (weatherContext.temperatureBand === 'warm' || weatherContext.temperatureBand === 'hot') {
    return `Warmer weather gives this ${GROUP_LABELS[wineGroup]} a fresh case for tonight. ${baseRecommendation}`;
  }

  return `Mild evening conditions make this ${wineLabel} feel easy, balanced, and right for tonight. ${baseRecommendation}`;
}

