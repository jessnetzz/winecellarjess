export interface LocalWeather {
  temperatureF: number;
  apparentTemperatureF?: number;
  weatherCode?: number;
  windSpeedMph?: number;
}

const CACHE_KEY = 'wine-cellar-local-weather';
const CACHE_DURATION_MS = 20 * 60 * 1000;
let weatherRequest: Promise<LocalWeather | null> | null = null;

interface CachedWeather {
  value: LocalWeather;
  savedAt: number;
}

function getCachedWeather(): LocalWeather | null {
  try {
    const cached = window.sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as CachedWeather;
    if (Date.now() - parsed.savedAt > CACHE_DURATION_MS) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

function setCachedWeather(value: LocalWeather) {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ value, savedAt: Date.now() }));
  } catch {
    // Caching is a nice-to-have; recommendation quality should not depend on it.
  }
}

function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not available.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: CACHE_DURATION_MS,
      timeout: 7000,
    });
  });
}

export async function getLocalWeather(): Promise<LocalWeather | null> {
  if (typeof window === 'undefined') return null;

  const cached = getCachedWeather();
  if (cached) return cached;

  if (weatherRequest) return weatherRequest;

  weatherRequest = fetchLocalWeather().finally(() => {
    weatherRequest = null;
  });

  return weatherRequest;
}

async function fetchLocalWeather(): Promise<LocalWeather> {
  const position = await getBrowserPosition();
  const { latitude, longitude } = position.coords;
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'auto',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Weather request failed.');
  }

  const data = (await response.json()) as {
    current?: {
      temperature_2m?: number;
      apparent_temperature?: number;
      weather_code?: number;
      wind_speed_10m?: number;
    };
  };

  if (typeof data.current?.temperature_2m !== 'number') {
    throw new Error('Weather response was missing a temperature.');
  }

  const weather: LocalWeather = {
    temperatureF: Math.round(data.current.temperature_2m),
    apparentTemperatureF:
      typeof data.current.apparent_temperature === 'number'
        ? Math.round(data.current.apparent_temperature)
        : undefined,
    weatherCode: data.current.weather_code,
    windSpeedMph: typeof data.current.wind_speed_10m === 'number' ? Math.round(data.current.wind_speed_10m) : undefined,
  };

  setCachedWeather(weather);
  return weather;
}
