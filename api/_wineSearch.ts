export interface SearchWineRequest {
  query: string;
  limit: number;
}

export interface SearchWineMatch {
  id: string;
  score: number;
  semanticScore: number;
  keywordScore: number;
  readinessBoost: number;
  qualityBoost: number;
  reason: string;
}

interface TastingEntryRow {
  tasted_at?: string | null;
  notes?: string | null;
  rating?: number | null;
  pairing?: string | null;
  occasion?: string | null;
}

export interface SearchWineRow {
  id: string;
  wine_name: string;
  producer: string;
  vintage_year: number;
  appellation?: string | null;
  region?: string | null;
  country?: string | null;
  varietal?: string | null;
  style_category?: string | null;
  quantity?: number | null;
  drink_window_start_year?: number | null;
  drink_window_end_year?: number | null;
  best_drink_by_year?: number | null;
  status?: string | null;
  tasting_notes?: string | null;
  personal_rating?: number | null;
  food_pairing_notes?: string | null;
  ai_advice?: string | null;
  updated_at?: string | null;
  storage_locations?: {
    label?: string | null;
    rack?: string | null;
    shelf?: string | null;
    bin?: string | null;
    box?: string | null;
    fridge?: string | null;
    notes?: string | null;
  } | null;
  tasting_entries?: TastingEntryRow[] | null;
}

const cozyTerms = ['cozy', 'rainy', 'cold', 'winter', 'fireplace', 'comforting', 'warming'];
const boldTerms = ['bold', 'rich', 'steak', 'full', 'structured', 'cabernet', 'syrah', 'malbec', 'bordeaux'];
const freshTerms = ['seafood', 'fish', 'crisp', 'fresh', 'white', 'oyster', 'salmon', 'shrimp'];
const specialTerms = ['special', 'friends', 'dinner', 'celebration', 'date', 'occasion'];

function cleanText(value: unknown, maxLength = 240) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalize(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function tokenize(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function validateSearchWineRequest(body: unknown): { input?: SearchWineRequest; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Enter a search phrase to explore your cellar.' };

  const record = body as Record<string, unknown>;
  const query = cleanText(record.query, 280);
  const limit = Number(record.limit);

  if (query.length < 3) return { error: 'Try a slightly longer search phrase.' };

  return {
    input: {
      query,
      limit: Number.isFinite(limit) ? Math.max(1, Math.min(60, Math.round(limit))) : 30,
    },
  };
}

function getDrinkWindowText(wine: SearchWineRow, currentYear = new Date().getFullYear()) {
  const start = wine.drink_window_start_year;
  const end = wine.drink_window_end_year;
  const bestBy = wine.best_drink_by_year;
  if (!start || !end || !bestBy) return '';

  if (wine.status === 'consumed') return 'consumed archived bottle';
  if (currentYear > end || currentYear > bestBy + 2) return 'past peak drink soon likely beyond ideal window';
  if (bestBy - currentYear <= 1 || end - currentYear <= 1) return 'drink soon nearing end of peak window';
  if (currentYear >= start && currentYear <= bestBy) return 'ready to drink now in peak drinking window';
  if (currentYear >= start) return 'ready to drink now inside drinking window';
  if (start - currentYear <= 2) return 'approaching drinking window soon';
  return 'too young hold for later';
}

function getMoodText(wine: SearchWineRow) {
  const style = wine.style_category ?? '';
  const varietal = normalize(wine.varietal ?? '');
  const text = normalize(`${wine.wine_name} ${wine.producer} ${wine.varietal ?? ''} ${wine.tasting_notes ?? ''} ${wine.food_pairing_notes ?? ''}`);
  const moods: string[] = [];

  if (style === 'red' || cozyTerms.some((term) => text.includes(term))) moods.push('cozy dinner red evening warming savory');
  if (boldTerms.some((term) => text.includes(term))) moods.push('rich bold structured steak grilled meat special');
  if (style === 'white' || style === 'rose' || style === 'sparkling' || freshTerms.some((term) => text.includes(term))) {
    moods.push('fresh bright seafood crisp patio lighter dinner');
  }
  if (specialTerms.some((term) => text.includes(term)) || (wine.personal_rating ?? 0) >= 94 || (wine.quantity ?? 0) <= 1) {
    moods.push('special bottle dinner with friends memorable occasion');
  }
  if (varietal.includes('chardonnay')) moods.push('chardonnay buttery creamy seafood roast chicken fuller white');
  if (varietal.includes('pinot')) moods.push('pinot noir silky earthy rainy night salmon mushrooms');
  if (varietal.includes('cabernet') || varietal.includes('syrah') || varietal.includes('malbec')) moods.push('bold red steak rich winter cellar');

  return moods.join('. ');
}

export function buildSearchDocument(wine: SearchWineRow) {
  const tastingEntries = (wine.tasting_entries ?? [])
    .map((entry) =>
      [
        entry.tasted_at ? `tasted ${entry.tasted_at}` : '',
        cleanText(entry.notes, 500),
        entry.rating ? `journal rating ${entry.rating}` : '',
        entry.pairing ? `paired with ${cleanText(entry.pairing)}` : '',
        entry.occasion ? `occasion ${cleanText(entry.occasion)}` : '',
      ].filter(Boolean).join(', '),
    )
    .filter(Boolean)
    .join('. ');

  const location = wine.storage_locations
    ? [
        wine.storage_locations.label,
        wine.storage_locations.rack,
        wine.storage_locations.shelf,
        wine.storage_locations.bin,
        wine.storage_locations.box,
        wine.storage_locations.fridge,
        wine.storage_locations.notes,
      ].map((value) => cleanText(value)).filter(Boolean).join(', ')
    : '';

  return [
    `${wine.vintage_year} ${wine.producer} ${wine.wine_name}`,
    `Style: ${wine.style_category ?? 'unknown'} wine. Varietal: ${wine.varietal ?? 'unknown'}.`,
    `Origin: ${[wine.appellation, wine.region, wine.country].map((value) => cleanText(value)).filter(Boolean).join(', ')}.`,
    `Drink status: ${getDrinkWindowText(wine)}. Window ${wine.drink_window_start_year ?? ''}-${wine.drink_window_end_year ?? ''}, best by ${wine.best_drink_by_year ?? ''}.`,
    wine.personal_rating ? `Personal rating ${wine.personal_rating}.` : '',
    `Tasting notes: ${cleanText(wine.tasting_notes, 900)}.`,
    `Food pairings: ${cleanText(wine.food_pairing_notes, 900)}.`,
    `AI cellar advice: ${cleanText(wine.ai_advice, 900)}.`,
    `Storage: ${location}.`,
    getMoodText(wine),
    tastingEntries ? `Tasting journal: ${tastingEntries}` : '',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 5000);
}

export function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function getKeywordScore(query: string, wine: SearchWineRow, document: string) {
  const queryTokens = Array.from(new Set(tokenize(query)));
  if (!queryTokens.length) return 0;

  const exactText = normalize(`${wine.producer} ${wine.wine_name} ${wine.vintage_year} ${wine.varietal ?? ''} ${wine.region ?? ''}`);
  const docText = normalize(document);
  const matches = queryTokens.filter((token) => docText.includes(token)).length;
  const exactBoost = queryTokens.some((token) => exactText.includes(token)) ? 0.12 : 0;
  const phraseBoost = docText.includes(normalize(query)) ? 0.16 : 0;

  return Math.min(0.32, matches / queryTokens.length * 0.2 + exactBoost + phraseBoost);
}

export function getReadinessBoost(query: string, wine: SearchWineRow) {
  const text = normalize(query);
  const asksReady = ['ready', 'drink now', 'tonight', 'open', 'peak', 'dinner'].some((term) => text.includes(term));
  if (!asksReady) return 0;

  const readiness = getDrinkWindowText(wine);
  if (readiness.includes('ready to drink') || readiness.includes('peak')) return 0.08;
  if (readiness.includes('drink soon')) return 0.06;
  if (readiness.includes('too young')) return -0.06;
  return 0;
}

export function getQualityBoost(wine: SearchWineRow) {
  const rating = wine.personal_rating;
  if (!rating) return 0;
  if (rating >= 96) return 0.06;
  if (rating >= 93) return 0.04;
  if (rating >= 90) return 0.02;
  return 0;
}

export function reasonForMatch(query: string, wine: SearchWineRow, document: string) {
  const queryText = normalize(query);
  const docText = normalize(document);
  if (queryText.includes('seafood') && docText.includes('seafood')) return 'Matched seafood pairing notes.';
  if (queryText.includes('steak') && docText.includes('steak')) return 'Matched bold dinner pairing notes.';
  if ((queryText.includes('ready') || queryText.includes('tonight')) && getDrinkWindowText(wine).includes('ready')) {
    return 'Matched readiness and drink-window timing.';
  }
  if (queryText.includes('butter') && docText.includes('butter')) return 'Matched buttery tasting language.';
  if (queryText.includes('cozy') || queryText.includes('rainy')) return 'Matched mood, style, and cellar notes.';
  return 'Matched cellar details, notes, and pairing context.';
}

