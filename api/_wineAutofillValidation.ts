import { WineAutofillRequest } from './_wineAutofillPrompt';

export interface WineAutofillApiResult {
  producer: string | null;
  wine_name: string | null;
  vintage: number | null;
  appellation: string | null;
  region: string | null;
  country: string | null;
  varietal: string | null;
  style_category: string | null;
  color: string | null;
  body: string | null;
  acidity: string | null;
  tannin: string | null;
  drink_window_start_year: number | null;
  drink_window_end_year: number | null;
  best_drink_by_year: number | null;
  estimated_peak_year: number | null;
  tasting_notes: string | null;
  food_pairing_notes: string | null;
  cellar_note: string | null;
  confidence: number;
  uncertain_fields: string[];
  known_vs_inferred_summary: string | null;
}

const textFields = [
  'producer',
  'wine_name',
  'appellation',
  'region',
  'country',
  'varietal',
  'style_category',
  'color',
  'body',
  'acidity',
  'tannin',
  'tasting_notes',
  'food_pairing_notes',
  'cellar_note',
  'known_vs_inferred_summary',
] as const;

const yearFields = ['vintage', 'drink_window_start_year', 'drink_window_end_year', 'best_drink_by_year', 'estimated_peak_year'] as const;
const allowedStyles = new Set(['red', 'white', 'rose', 'sparkling', 'dessert', 'fortified', 'orange']);

function cleanText(value: unknown) {
  if (typeof value !== 'string') return null;
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean ? clean.slice(0, 1200) : null;
}

function cleanYear(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const rounded = Math.round(number);
  if (rounded < 1800 || rounded > 2200) return null;
  return rounded;
}

export function validateWineAutofillRequest(body: unknown): { input?: WineAutofillRequest; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Please enter a producer, wine name, and vintage.' };

  const record = body as Record<string, unknown>;
  const producer = cleanText(record.producer);
  const wineName = cleanText(record.wine_name);
  const vintage = cleanYear(record.vintage);

  if (!producer) return { error: 'Producer is required.' };
  if (!wineName) return { error: 'Wine name is required.' };
  if (!vintage) return { error: 'Vintage must be a valid year.' };

  return { input: { producer, wine_name: wineName, vintage } };
}

export function validateWineAutofillResult(value: unknown): WineAutofillApiResult | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const result = {} as WineAutofillApiResult;

  for (const key of textFields) {
    result[key] = cleanText(record[key]);
  }

  for (const key of yearFields) {
    result[key] = cleanYear(record[key]);
  }

  if (result.style_category && !allowedStyles.has(result.style_category)) {
    result.style_category = null;
  }

  const confidence = Number(record.confidence);
  result.confidence = Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0;
  result.uncertain_fields = Array.isArray(record.uncertain_fields)
    ? record.uncertain_fields.map((field) => cleanText(field)).filter(Boolean).slice(0, 24) as string[]
    : [];

  return result;
}
