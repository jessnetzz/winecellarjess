import { mapQueryToFoodProfile } from '../src/services/foodAttributeMapper.js';
import { getFoodAndWineMatchReason, getProfileSearchBoost, getWineProfileTags, hasMeaningfulFoodSignal } from '../src/services/wineProfileSelectors.js';
import { mapWineToProfile } from '../src/services/wineAttributeMapper.js';
import type { Wine, WineStyle, WineStatus } from '../src/types/wine.js';

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
  profileBoost: number;
  qualityBoost: number;
  reason: string;
  profileReasons: string[];
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

function toWineStyle(value?: string | null): WineStyle {
  if (value === 'red' || value === 'white' || value === 'rose' || value === 'sparkling' || value === 'dessert' || value === 'fortified' || value === 'orange') {
    return value;
  }
  return 'red';
}

function toWineStatus(value?: string | null): WineStatus {
  if (value === 'opened' || value === 'consumed') return value;
  return 'unopened';
}

export function searchWineRowToWine(row: SearchWineRow): Wine {
  return {
    id: row.id,
    name: row.wine_name,
    producer: row.producer ?? '',
    vintage: row.vintage_year ?? new Date().getFullYear(),
    appellation: row.appellation ?? '',
    region: row.region ?? '',
    country: row.country ?? '',
    varietal: row.varietal ?? '',
    style: toWineStyle(row.style_category),
    bottleSize: '750ml',
    quantity: row.quantity ?? 1,
    purchaseDate: '',
    purchasePrice: 0,
    marketValue: 0,
    alcoholPercent: undefined,
    drinkWindowStart: row.drink_window_start_year ?? new Date().getFullYear(),
    drinkWindowEnd: row.drink_window_end_year ?? new Date().getFullYear(),
    bestDrinkBy: row.best_drink_by_year ?? new Date().getFullYear(),
    storageLocation: {
      id: row.storage_locations?.label ?? undefined,
      rack: row.storage_locations?.rack ?? undefined,
      shelf: row.storage_locations?.shelf ?? undefined,
      bin: row.storage_locations?.bin ?? undefined,
      box: row.storage_locations?.box ?? undefined,
      fridge: row.storage_locations?.fridge ?? undefined,
      notes: row.storage_locations?.notes ?? undefined,
      displayName: row.storage_locations?.label ?? 'Cellar',
    },
    acquisitionSource: '',
    status: toWineStatus(row.status),
    tastingNotes: row.tasting_notes ?? '',
    personalRating: row.personal_rating ?? undefined,
    foodPairingNotes: row.food_pairing_notes ?? '',
    aiAdvice: row.ai_advice ?? '',
    imageUrl: undefined,
    tastingLog: (row.tasting_entries ?? []).map((entry, index) => ({
      id: `${row.id}-entry-${index}`,
      tastingDate: entry.tasted_at ?? '',
      notes: entry.notes ?? '',
      rating: entry.rating ?? undefined,
      decanted: false,
      pairings: entry.pairing ?? undefined,
      occasion: entry.occasion ?? undefined,
    })),
    createdAt: row.updated_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function getSearchWineProfile(wine: SearchWineRow) {
  return mapWineToProfile(searchWineRowToWine(wine));
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

export function buildSearchDocument(wine: SearchWineRow) {
  const profile = getSearchWineProfile(wine);
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
    `Profile: ${profile.profileSummary}.`,
    `Profile tags: ${getWineProfileTags(profile).join(', ')}.`,
    `Origin: ${[wine.appellation, wine.region, wine.country].map((value) => cleanText(value)).filter(Boolean).join(', ')}.`,
    `Drink status: ${getDrinkWindowText(wine)}. Window ${wine.drink_window_start_year ?? ''}-${wine.drink_window_end_year ?? ''}, best by ${wine.best_drink_by_year ?? ''}.`,
    wine.personal_rating ? `Personal rating ${wine.personal_rating}.` : '',
    `Tasting notes: ${cleanText(wine.tasting_notes, 900)}.`,
    `Food pairings: ${cleanText(wine.food_pairing_notes, 900)}.`,
    `AI cellar advice: ${cleanText(wine.ai_advice, 900)}.`,
    `Storage: ${location}.`,
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

  const profile = getSearchWineProfile(wine);
  if (profile.readinessTag === 'peak_window') return 0.08;
  if (profile.readinessTag === 'ready_now' || profile.readinessTag === 'nearing_end') return 0.06;
  if (profile.readinessTag === 'too_young') return -0.06;
  return 0;
}

export function getProfileBoost(query: string, wine: SearchWineRow) {
  const profile = getSearchWineProfile(wine);
  return getProfileSearchBoost(query, profile);
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
  const profile = getSearchWineProfile(wine);
  const foodProfile = mapQueryToFoodProfile(query);
  const profileBoost = getProfileSearchBoost(query, profile);
  const queryText = normalize(query);
  const docText = normalize(document);
  if (query.trim() && hasMeaningfulFoodSignal(foodProfile)) {
    return getFoodAndWineMatchReason(profile, foodProfile);
  }
  if (queryText.includes('seafood') && docText.includes('seafood')) return 'Matched seafood pairing notes.';
  if (queryText.includes('steak') && docText.includes('steak')) return 'Matched bold dinner pairing notes.';
  if ((queryText.includes('ready') || queryText.includes('tonight')) && (profile.readinessTag === 'ready_now' || profile.readinessTag === 'peak_window')) {
    return 'Matched readiness and drink-window timing.';
  }
  if (queryText.includes('butter') && docText.includes('butter')) return 'Matched buttery tasting language.';
  if (profileBoost.reasons.length) return `Matched ${profileBoost.reasons[0].toLowerCase()}.`;
  if (queryText.includes('cozy') || queryText.includes('rainy')) return 'Matched mood, style, and cellar notes.';
  return 'Matched cellar details, notes, and pairing context.';
}
