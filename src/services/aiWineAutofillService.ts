import { WineAutofillField, WineAutofillInput, WineAutofillResult, WineStyle } from '../types/wine';

export interface AIWineAutofillService {
  getWineAutofill(input: WineAutofillInput): Promise<WineAutofillResult>;
}

function field<T>(value: T | null, source: WineAutofillField<T>['source'], note?: string): WineAutofillField<T> {
  return { value, source, note };
}

interface WineAutofillApiResult {
  producer: string | null;
  wine_name: string | null;
  vintage: number | null;
  appellation: string | null;
  region: string | null;
  country: string | null;
  varietal: string | null;
  style_category: WineStyle | null;
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

function sourceFor(value: unknown, known = false): WineAutofillField<unknown>['source'] {
  if (value === null || value === undefined || value === '') return 'unknown';
  return known ? 'known' : 'inferred';
}

function mapApiResult(result: WineAutofillApiResult): WineAutofillResult {
  return {
    producer: field(result.producer, sourceFor(result.producer, true)),
    wineName: field(result.wine_name, sourceFor(result.wine_name, true)),
    vintage: field(result.vintage, sourceFor(result.vintage, true)),
    appellation: field(result.appellation, sourceFor(result.appellation)),
    region: field(result.region, sourceFor(result.region)),
    country: field(result.country, sourceFor(result.country)),
    varietal: field(result.varietal, sourceFor(result.varietal)),
    styleCategory: field(result.style_category, sourceFor(result.style_category)),
    color: field(result.color, sourceFor(result.color)),
    body: field(result.body, sourceFor(result.body)),
    acidity: field(result.acidity, sourceFor(result.acidity)),
    tannin: field(result.tannin, sourceFor(result.tannin)),
    drinkWindowStartYear: field(result.drink_window_start_year, sourceFor(result.drink_window_start_year)),
    drinkWindowEndYear: field(result.drink_window_end_year, sourceFor(result.drink_window_end_year)),
    bestDrinkByYear: field(result.best_drink_by_year, sourceFor(result.best_drink_by_year)),
    estimatedPeakYear: field(result.estimated_peak_year, sourceFor(result.estimated_peak_year)),
    tastingNotes: field(result.tasting_notes, sourceFor(result.tasting_notes)),
    foodPairingNotes: field(result.food_pairing_notes, sourceFor(result.food_pairing_notes)),
    cellarNote: field(result.cellar_note, sourceFor(result.cellar_note)),
    confidence: result.confidence,
    uncertainFields: result.uncertain_fields,
    knownVsInferredSummary: result.known_vs_inferred_summary || 'AI suggested details. Review before saving.',
  };
}

export async function getServerWineAutofill(input: WineAutofillInput): Promise<WineAutofillResult> {
  const response = await fetch('/api/wine-autofill', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      producer: input.producer,
      wine_name: input.wineName,
      vintage: input.vintage,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'AI autofill could not finish. Your typed values are still safe.');
  }

  return mapApiResult(payload as WineAutofillApiResult);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function inferStyle(wineName: string): WineStyle {
  const name = normalize(wineName);
  if (name.includes('champagne') || name.includes('sparkling') || name.includes('cava') || name.includes('prosecco')) return 'sparkling';
  if (name.includes('sauternes') || name.includes('ice wine') || name.includes('tokaji')) return 'dessert';
  if (name.includes('port') || name.includes('madeira') || name.includes('sherry')) return 'fortified';
  if (name.includes('rosé') || name.includes('rose')) return 'rose';
  if (name.includes('riesling') || name.includes('chardonnay') || name.includes('sauvignon') || name.includes('pinot gris')) return 'white';
  return 'red';
}

function inferVarietal(wineName: string, producer: string) {
  const text = normalize(`${producer} ${wineName}`);
  const matches = [
    'cabernet sauvignon',
    'pinot noir',
    'chardonnay',
    'sauvignon blanc',
    'riesling',
    'syrah',
    'grenache',
    'merlot',
    'nebbiolo',
    'sangiovese',
    'tempranillo',
    'zinfandel',
  ];
  return matches.find((match) => text.includes(match)) ?? null;
}

function inferOrigin(wineName: string) {
  const name = normalize(wineName);
  if (name.includes('barolo')) return { appellation: 'Barolo', region: 'Piedmont', country: 'Italy', varietal: 'nebbiolo' };
  if (name.includes('barbaresco')) return { appellation: 'Barbaresco', region: 'Piedmont', country: 'Italy', varietal: 'nebbiolo' };
  if (name.includes('brunello')) return { appellation: 'Brunello di Montalcino', region: 'Tuscany', country: 'Italy', varietal: 'sangiovese' };
  if (name.includes('chianti')) return { appellation: 'Chianti Classico', region: 'Tuscany', country: 'Italy', varietal: 'sangiovese' };
  if (name.includes('rioja')) return { appellation: 'Rioja', region: 'Rioja', country: 'Spain', varietal: 'tempranillo' };
  if (name.includes('champagne')) return { appellation: 'Champagne', region: 'Champagne', country: 'France', varietal: null };
  if (name.includes('sancerre')) return { appellation: 'Sancerre', region: 'Loire Valley', country: 'France', varietal: 'sauvignon blanc' };
  if (name.includes('chablis')) return { appellation: 'Chablis', region: 'Burgundy', country: 'France', varietal: 'chardonnay' };
  if (name.includes('bordeaux')) return { appellation: 'Bordeaux', region: 'Bordeaux', country: 'France', varietal: 'cabernet sauvignon / merlot blend' };
  if (name.includes('burgundy') || name.includes('bourgogne')) return { appellation: 'Bourgogne', region: 'Burgundy', country: 'France', varietal: null };
  if (name.includes('napa')) return { appellation: 'Napa Valley', region: 'California', country: 'United States', varietal: null };
  return { appellation: null, region: null, country: null, varietal: null };
}

function styleProfile(style: WineStyle, varietal: string | null) {
  if (style === 'sparkling') return { color: 'sparkling', body: 'light to medium', acidity: 'high', tannin: 'low' };
  if (style === 'white') return { color: 'white', body: varietal === 'chardonnay' ? 'medium to full' : 'light to medium', acidity: 'medium to high', tannin: 'low' };
  if (style === 'rose') return { color: 'rosé', body: 'light to medium', acidity: 'medium to high', tannin: 'low' };
  if (style === 'dessert') return { color: 'dessert', body: 'medium to full', acidity: 'medium to high', tannin: 'low' };
  if (style === 'fortified') return { color: 'fortified', body: 'full', acidity: 'medium', tannin: 'medium' };
  if (varietal === 'pinot noir') return { color: 'red', body: 'light to medium', acidity: 'medium to high', tannin: 'low to medium' };
  if (varietal === 'nebbiolo') return { color: 'red', body: 'medium to full', acidity: 'high', tannin: 'high' };
  return { color: 'red', body: 'medium to full', acidity: 'medium', tannin: 'medium to high' };
}

function inferDrinkWindow(vintage: number, style: WineStyle, varietal: string | null) {
  const age = new Date().getFullYear() - vintage;
  const cellarWorthy = ['nebbiolo', 'cabernet sauvignon', 'syrah', 'tempranillo'].includes(varietal ?? '') || style === 'fortified';
  const shortWindow = style === 'white' || style === 'rose' || style === 'sparkling';
  const startOffset = cellarWorthy ? 6 : shortWindow ? 2 : 4;
  const endOffset = cellarWorthy ? 18 : shortWindow ? 7 : 12;
  const start = vintage + startOffset;
  const end = Math.max(start + 3, vintage + endOffset);
  const bestBy = Math.min(end, start + Math.ceil((end - start) * 0.7));
  const peak = Math.min(end, Math.max(start, vintage + Math.round((startOffset + endOffset) / 2)));

  return {
    start: Math.max(vintage + 1, start),
    end,
    bestBy,
    peak,
    conservativeNote: age > endOffset ? 'Conservative estimate: may be past peak unless storage has been excellent.' : undefined,
  };
}

export function buildWineAutofillPrompt(input: WineAutofillInput) {
  return `Return structured JSON only for a wine cellar autofill suggestion.

Input:
- producer: ${input.producer}
- wine_name: ${input.wineName}
- vintage: ${input.vintage}

Rules:
- Fill likely wine details from producer, wine name, vintage, region/appellation cues, and common wine knowledge.
- Use null when unknown.
- If a value is inferred rather than known, keep it broad and conservative.
- Do not present uncertain guesses as guaranteed facts.
- Use conservative drink-window guidance unless confidence is high.
- Return confidence from 0 to 1, uncertain_fields, and known_vs_inferred_summary.
- JSON shape must include producer, wine_name, vintage, appellation, region, country, varietal, style_category, color, body, acidity, tannin, drink_window_start_year, drink_window_end_year, best_drink_by_year, estimated_peak_year, tasting_notes, food_pairing_notes, cellar_note, confidence, uncertain_fields, known_vs_inferred_summary.`;
}

export async function getMockWineAutofill(input: WineAutofillInput): Promise<WineAutofillResult> {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 700));

  const origin = inferOrigin(input.wineName);
  const style = inferStyle(input.wineName);
  const inferredVarietal = inferVarietal(input.wineName, input.producer) ?? origin.varietal;
  const profile = styleProfile(style, inferredVarietal);
  const drinkWindow = inferDrinkWindow(input.vintage, style, inferredVarietal);
  const confidence = origin.region || inferredVarietal ? 0.68 : 0.46;
  const uncertainFields = [
    !origin.appellation && 'appellation',
    !origin.region && 'region',
    !origin.country && 'country',
    !inferredVarietal && 'varietal',
    'drink_window_start_year',
    'drink_window_end_year',
    'estimated_peak_year',
  ].filter(Boolean) as string[];

  const cellarNote = [
    `AI suggested a ${style} profile${origin.region ? ` from ${origin.region}` : ''}.`,
    `Estimated peak around ${drinkWindow.peak}, with a conservative drink window of ${drinkWindow.start}-${drinkWindow.end}.`,
    `${profile.body} body, ${profile.acidity} acidity, ${profile.tannin} tannin.`,
    drinkWindow.conservativeNote,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    producer: field(input.producer, 'known'),
    wineName: field(input.wineName, 'known'),
    vintage: field(input.vintage, 'known'),
    appellation: field(origin.appellation, origin.appellation ? 'inferred' : 'unknown'),
    region: field(origin.region, origin.region ? 'inferred' : 'unknown'),
    country: field(origin.country, origin.country ? 'inferred' : 'unknown'),
    varietal: field(inferredVarietal, inferredVarietal ? 'inferred' : 'unknown'),
    styleCategory: field(style, 'inferred'),
    color: field(profile.color, 'inferred'),
    body: field(profile.body, 'inferred'),
    acidity: field(profile.acidity, 'inferred'),
    tannin: field(profile.tannin, 'inferred'),
    drinkWindowStartYear: field(drinkWindow.start, 'inferred'),
    drinkWindowEndYear: field(drinkWindow.end, 'inferred'),
    bestDrinkByYear: field(drinkWindow.bestBy, 'inferred'),
    estimatedPeakYear: field(drinkWindow.peak, 'inferred'),
    tastingNotes: field(`Expect a ${profile.color} wine with ${profile.body} body, ${profile.acidity} acidity, and ${profile.tannin} tannin. Revisit after opening to replace this AI estimate with your own tasting note.`, 'inferred'),
    foodPairingNotes: field(style === 'white' ? 'Try with seafood, roast chicken, fresh cheeses, or citrus-led dishes.' : 'Try with roasted meats, mushrooms, aged cheeses, or dishes with similar intensity.', 'inferred'),
    cellarNote: field(cellarNote, 'inferred'),
    confidence,
    uncertainFields,
    knownVsInferredSummary:
      confidence >= 0.6
        ? 'Producer, wine name, and vintage came from your input. Origin, style, structure, and drink window are AI-inferred suggestions for review.'
        : 'Producer, wine name, and vintage came from your input. Most remaining details are broad AI estimates and should be reviewed before saving.',
  };
}

export const aiWineAutofillService: AIWineAutofillService = {
  getWineAutofill: getServerWineAutofill,
};
