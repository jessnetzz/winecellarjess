import { seedWines } from '../data/seedWines';
import { Database } from '../types/database';
import { StorageLocation, TastingLogEntry, Wine } from '../types/wine';
import { supabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'wine-cellar:v1:wines';
const LOCAL_IMPORT_MARKER_PREFIX = 'wine-cellar:v1:supabase-imported';

type WineRow = Database['public']['Tables']['wines']['Row'];
type WineInsert = Database['public']['Tables']['wines']['Insert'];
type WineUpdate = Database['public']['Tables']['wines']['Update'];
type StorageLocationRow = Database['public']['Tables']['storage_locations']['Row'];
type StorageLocationInsert = Database['public']['Tables']['storage_locations']['Insert'];
type TastingEntryRow = Database['public']['Tables']['tasting_entries']['Row'];
type TastingEntryInsert = Database['public']['Tables']['tasting_entries']['Insert'];

type WineWithRelations = WineRow & {
  storage_locations: StorageLocationRow | null;
  tasting_entries: TastingEntryRow[] | null;
};

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
  }

  return supabase;
}

function emptyToNull(value?: string): string | null {
  return value?.trim() ? value.trim() : null;
}

function numberOrNull(value?: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function storageFromRow(row: StorageLocationRow | null): StorageLocation {
  if (!row) return { displayName: 'Unassigned' };

  return {
    id: row.id,
    displayName: row.label,
    rack: row.rack ?? undefined,
    shelf: row.shelf ?? undefined,
    bin: row.bin ?? undefined,
    box: row.box ?? undefined,
    fridge: row.fridge ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function tastingEntryFromRow(row: TastingEntryRow): TastingLogEntry {
  return {
    id: row.id,
    tastingDate: row.tasted_at,
    notes: row.notes,
    rating: row.rating ?? undefined,
    decanted: row.decanted,
    pairings: row.pairing ?? undefined,
    occasion: row.occasion ?? undefined,
  };
}

function wineFromRow(row: WineWithRelations): Wine {
  return {
    id: row.id,
    name: row.wine_name,
    producer: row.producer,
    vintage: row.vintage_year,
    appellation: row.appellation ?? '',
    region: row.region ?? '',
    country: row.country ?? '',
    varietal: row.varietal ?? '',
    style: row.style_category,
    bottleSize: row.bottle_size ?? '750 ml',
    quantity: row.quantity,
    purchaseDate: row.purchase_date ?? '',
    purchasePrice: Number(row.purchase_price ?? 0),
    marketValue: Number(row.estimated_market_value ?? 0),
    alcoholPercent: row.alcohol_percentage === null ? undefined : Number(row.alcohol_percentage),
    drinkWindowStart: row.drink_window_start_year,
    drinkWindowEnd: row.drink_window_end_year,
    bestDrinkBy: row.best_drink_by_year,
    storageLocation: storageFromRow(row.storage_locations),
    acquisitionSource: row.acquisition_source ?? '',
    status: row.status,
    tastingNotes: row.tasting_notes ?? '',
    personalRating: row.personal_rating ?? undefined,
    foodPairingNotes: row.food_pairing_notes ?? '',
    aiAdvice: row.ai_advice ?? '',
    imageUrl: row.image_url ?? '',
    tastingLog: [...(row.tasting_entries ?? [])]
      .sort((a, b) => b.tasted_at.localeCompare(a.tasted_at))
      .map(tastingEntryFromRow),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function wineToInsert(userId: string, wine: Wine, storageLocationId: string | null): WineInsert {
  return {
    user_id: userId,
    wine_name: wine.name,
    producer: wine.producer,
    vintage_year: wine.vintage,
    appellation: emptyToNull(wine.appellation),
    region: emptyToNull(wine.region),
    country: emptyToNull(wine.country),
    varietal: emptyToNull(wine.varietal),
    style_category: wine.style,
    bottle_size: emptyToNull(wine.bottleSize),
    quantity: wine.quantity,
    purchase_date: emptyToNull(wine.purchaseDate),
    purchase_price: numberOrNull(wine.purchasePrice),
    estimated_market_value: numberOrNull(wine.marketValue),
    alcohol_percentage: numberOrNull(wine.alcoholPercent),
    drink_window_start_year: wine.drinkWindowStart,
    drink_window_end_year: wine.drinkWindowEnd,
    best_drink_by_year: wine.bestDrinkBy,
    acquisition_source: emptyToNull(wine.acquisitionSource),
    status: wine.status,
    tasting_notes: emptyToNull(wine.tastingNotes),
    personal_rating: numberOrNull(wine.personalRating),
    food_pairing_notes: emptyToNull(wine.foodPairingNotes),
    ai_advice: emptyToNull(wine.aiAdvice),
    image_url: emptyToNull(wine.imageUrl),
    storage_location_id: storageLocationId,
  };
}

function wineToUpdate(wine: Wine, storageLocationId: string | null): WineUpdate {
  const { user_id: _userId, ...insert } = wineToInsert('unused', wine, storageLocationId);
  return insert;
}

function tastingEntryToInsert(userId: string, wineId: string, entry: TastingLogEntry): TastingEntryInsert {
  return {
    user_id: userId,
    wine_id: wineId,
    tasted_at: entry.tastingDate,
    notes: entry.notes,
    rating: numberOrNull(entry.rating),
    decanted: entry.decanted,
    pairing: emptyToNull(entry.pairings),
    occasion: emptyToNull(entry.occasion),
  };
}

function storageToInsert(userId: string, storageLocation: StorageLocation): StorageLocationInsert {
  return {
    user_id: userId,
    label: storageLocation.displayName || 'Unassigned',
    rack: emptyToNull(storageLocation.rack),
    shelf: emptyToNull(storageLocation.shelf),
    bin: emptyToNull(storageLocation.bin),
    box: emptyToNull(storageLocation.box),
    fridge: emptyToNull(storageLocation.fridge),
    notes: emptyToNull(storageLocation.notes),
  };
}

async function ensureStorageLocation(userId: string, storageLocation: StorageLocation): Promise<string | null> {
  const label = storageLocation.displayName?.trim();
  if (!label || label === 'Unassigned') return null;

  const client = requireSupabase();
  const payload = storageToInsert(userId, storageLocation);
  const { data, error } = await client
    .from('storage_locations')
    .upsert(payload, { onConflict: 'user_id,label' })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

async function getWineById(userId: string, id: string): Promise<Wine> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('wines')
    .select('*, storage_locations(*), tasting_entries(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return wineFromRow(data as WineWithRelations);
}

export const wineRepository = {
  async listWines(userId: string): Promise<Wine[]> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('wines')
      .select('*, storage_locations(*), tasting_entries(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data as WineWithRelations[]).map(wineFromRow);
  },

  async saveWine(userId: string, wine: Wine): Promise<Wine> {
    const storageLocationId = await ensureStorageLocation(userId, wine.storageLocation);
    const client = requireSupabase();

    if (wine.id && isUuid(wine.id)) {
      const { data, error } = await client
        .from('wines')
        .update(wineToUpdate(wine, storageLocationId))
        .eq('id', wine.id)
        .eq('user_id', userId)
        .select('id')
        .maybeSingle();

      if (!error && data?.id) {
        return getWineById(userId, data.id);
      }

      if (error) throw error;
      throw new Error('We could not update that bottle. Please refresh and try again.');
    }

    const { data, error } = await client
      .from('wines')
      .insert(wineToInsert(userId, wine, storageLocationId))
      .select('id')
      .single();

    if (error) throw error;
    return getWineById(userId, data.id);
  },

  async deleteWine(wineId: string): Promise<void> {
    const { error } = await requireSupabase().from('wines').delete().eq('id', wineId);
    if (error) throw error;
  },

  async addTastingEntry(userId: string, wine: Wine, entry: TastingLogEntry): Promise<Wine> {
    const client = requireSupabase();
    const { error: entryError } = await client.from('tasting_entries').insert(tastingEntryToInsert(userId, wine.id, entry));
    if (entryError) throw entryError;

    const { error: wineError } = await client
      .from('wines')
      .update({
        tasting_notes: entry.notes,
        personal_rating: entry.rating ?? wine.personalRating ?? null,
        status: wine.status === 'unopened' ? 'opened' : wine.status,
      })
      .eq('id', wine.id)
      .eq('user_id', userId);

    if (wineError) throw wineError;
    return getWineById(userId, wine.id);
  },

  async importWines(userId: string, wines: Wine[]): Promise<Wine[]> {
    const imported: Wine[] = [];
    for (const wine of wines) {
      const saved = await this.saveWine(userId, wine);

      for (const tastingEntry of wine.tastingLog) {
        await this.addTastingEntry(userId, saved, tastingEntry);
      }

      imported.push(await getWineById(userId, saved.id));
    }

    return imported;
  },

  async replaceWithDemoData(userId: string): Promise<Wine[]> {
    const client = requireSupabase();
    const { error } = await client.from('wines').delete().eq('user_id', userId);
    if (error) throw error;
    await this.importWines(userId, seedWines);
    return this.listWines(userId);
  },
};

export const localWineImport = {
  loadLocalWines(): Wine[] {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? (parsed as Wine[]) : [];
    } catch {
      return [];
    }
  },

  hasImportableWines(userId: string): boolean {
    return !this.wasImported(userId) && this.loadLocalWines().length > 0;
  },

  wasImported(userId: string): boolean {
    return localStorage.getItem(`${LOCAL_IMPORT_MARKER_PREFIX}:${userId}`) === 'true';
  },

  markImported(userId: string) {
    localStorage.setItem(`${LOCAL_IMPORT_MARKER_PREFIX}:${userId}`, 'true');
  },

  dismiss(userId: string) {
    this.markImported(userId);
  },
};
