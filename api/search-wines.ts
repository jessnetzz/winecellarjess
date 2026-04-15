import {
  buildSearchDocument,
  cosineSimilarity,
  getKeywordScore,
  getProfileBoost,
  getQualityBoost,
  getReadinessBoost,
  reasonForMatch,
  validateSearchWineRequest,
} from './_wineSearch.js';
import type { SearchWineMatch, SearchWineRow } from './_wineSearch.js';

const OPENAI_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings';
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
const MAX_WINES_TO_EMBED = 90;

function sendJson(response: any, status: number, body: unknown) {
  response.status(status).setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(body));
}

function getBearerToken(request: any) {
  const header = request.headers?.authorization;
  if (typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

async function fetchUserWines(accessToken: string, signal?: AbortSignal): Promise<SearchWineRow[]> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error('Supabase is not configured.');
  }

  const select = [
    'id',
    'wine_name',
    'producer',
    'vintage_year',
    'appellation',
    'region',
    'country',
    'varietal',
    'style_category',
    'quantity',
    'drink_window_start_year',
    'drink_window_end_year',
    'best_drink_by_year',
    'status',
    'tasting_notes',
    'personal_rating',
    'food_pairing_notes',
    'ai_advice',
    'updated_at',
    'storage_locations(label,rack,shelf,bin,box,fridge,notes)',
    'tasting_entries(tasted_at,notes,rating,pairing,occasion)',
  ].join(',');
  const url = `${config.url}/rest/v1/wines?select=${encodeURIComponent(select)}&order=updated_at.desc&limit=${MAX_WINES_TO_EMBED}`;

  const response = await fetch(url, {
    signal,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Could not load wines for semantic search.');
  }

  const data = await response.json();
  return Array.isArray(data) ? data as SearchWineRow[] : [];
}

async function getEmbeddings(apiKey: string, inputs: string[], signal?: AbortSignal) {
  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL,
      input: inputs,
    }),
  });

  if (!response.ok) {
    throw new Error('Embedding request failed.');
  }

  const payload = await response.json() as { data?: Array<{ embedding?: number[] }> };
  const embeddings = payload.data?.map((item) => item.embedding).filter(Array.isArray) as number[][] | undefined;
  if (!embeddings || embeddings.length !== inputs.length) {
    throw new Error('Embedding response was incomplete.');
  }

  return embeddings;
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: { code: 'method_not_allowed', message: 'Use POST to search your cellar.' } });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: { code: 'missing_openai_key', message: 'Natural-language search is not configured yet.' } });
    return;
  }

  const accessToken = getBearerToken(request);
  if (!accessToken) {
    sendJson(response, 401, { error: { code: 'missing_session', message: 'Please sign in to use natural-language search.' } });
    return;
  }

  const { input, error } = validateSearchWineRequest(request.body);
  if (!input) {
    sendJson(response, 400, { error: { code: 'invalid_request', message: error ?? 'Please enter a search phrase.' } });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);

  try {
    const wines = await fetchUserWines(accessToken, controller.signal);
    const searchableWines = wines.filter((wine) => wine.status !== 'consumed' && (wine.quantity ?? 0) > 0);
    if (!searchableWines.length) {
      sendJson(response, 200, { query: input.query, matches: [] });
      return;
    }

    const documents = searchableWines.map((wine) => buildSearchDocument(wine));
    const embeddings = await getEmbeddings(apiKey, [input.query, ...documents], controller.signal);
    const queryEmbedding = embeddings[0];

    const matches: SearchWineMatch[] = searchableWines
      .map((wine, index) => {
        const document = documents[index];
        const semanticScore = cosineSimilarity(queryEmbedding, embeddings[index + 1]);
        const keywordScore = getKeywordScore(input.query, wine, document);
        const readinessBoost = getReadinessBoost(input.query, wine);
        const profileBoost = getProfileBoost(input.query, wine);
        const qualityBoost = getQualityBoost(wine);
        const score = semanticScore + keywordScore + readinessBoost + profileBoost.score + qualityBoost;

        return {
          id: wine.id,
          score: Number(score.toFixed(6)),
          semanticScore: Number(semanticScore.toFixed(6)),
          keywordScore: Number(keywordScore.toFixed(6)),
          readinessBoost: Number(readinessBoost.toFixed(6)),
          profileBoost: Number(profileBoost.score.toFixed(6)),
          qualityBoost: Number(qualityBoost.toFixed(6)),
          reason: reasonForMatch(input.query, wine, document),
          profileReasons: profileBoost.reasons,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, input.limit);

    sendJson(response, 200, { query: input.query, matches });
  } catch (caught) {
    const isAbort = caught instanceof Error && caught.name === 'AbortError';
    sendJson(response, isAbort ? 504 : 500, {
      error: {
        code: isAbort ? 'semantic_search_timeout' : 'semantic_search_failed',
        message: isAbort
          ? 'Natural-language search took too long. Keyword search is still available.'
          : 'Natural-language search is unavailable right now. Keyword search is still available.',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}
