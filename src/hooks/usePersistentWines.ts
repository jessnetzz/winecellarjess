import { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { localWineImport, wineRepository } from '../services/wineStorage';
import { TastingLogEntry, Wine } from '../types/wine';

export function usePersistentWines(user: User | null) {
  const [wines, setWines] = useState<Wine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocalImport, setHasLocalImport] = useState(false);

  const userId = user?.id ?? null;

  const loadWines = useCallback(async () => {
    if (!userId) {
      setWines([]);
      setHasLocalImport(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setWines(await wineRepository.listWines(userId));
      setHasLocalImport(localWineImport.hasImportableWines(userId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load your cellar.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadWines();
  }, [loadWines]);

  const mutate = async <T>(mutation: () => Promise<T>): Promise<T | null> => {
    if (!userId) return null;

    setIsMutating(true);
    setError(null);
    try {
      return await mutation();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your cellar changes.');
      return null;
    } finally {
      setIsMutating(false);
    }
  };

  const saveWine = async (wine: Wine) => {
    const saved = await mutate(() => wineRepository.saveWine(userId!, wine));
    if (!saved) return null;

    setWines((current) => {
      const exists = current.some((existing) => existing.id === saved.id);
      return exists ? current.map((existing) => (existing.id === saved.id ? saved : existing)) : [saved, ...current];
    });
    return saved;
  };

  const updateWine = async (wine: Wine) => saveWine(wine);

  const deleteWine = async (wine: Wine) => {
    const result = await mutate(() => wineRepository.deleteWine(wine.id));
    if (result === null) return false;

    setWines((current) => current.filter((existing) => existing.id !== wine.id));
    return true;
  };

  const addTastingEntry = async (wine: Wine, entry: TastingLogEntry) => {
    const updated = await mutate(() => wineRepository.addTastingEntry(userId!, wine, entry));
    if (!updated) return null;

    setWines((current) => current.map((existing) => (existing.id === updated.id ? updated : existing)));
    return updated;
  };

  const importWines = async (incomingWines: Wine[]) => {
    const imported = await mutate(() => wineRepository.importWines(userId!, incomingWines));
    if (!imported) return false;

    await loadWines();
    return true;
  };

  const importLocalWines = async () => {
    const localWines = localWineImport.loadLocalWines();
    if (!localWines.length || !userId) return false;

    const imported = await mutate(() => wineRepository.importWines(userId, localWines));
    if (!imported) return false;

    localWineImport.markImported(userId);
    setHasLocalImport(false);
    await loadWines();
    return true;
  };

  const dismissLocalImport = () => {
    if (!userId) return;
    localWineImport.dismiss(userId);
    setHasLocalImport(false);
  };

  const resetDemoData = async () => {
    const reset = await mutate(() => wineRepository.replaceWithDemoData(userId!));
    if (!reset) return false;

    setWines(reset);
    return true;
  };

  return {
    wines,
    isLoading,
    isMutating,
    error,
    hasLocalImport,
    reload: loadWines,
    saveWine,
    updateWine,
    deleteWine,
    addTastingEntry,
    importWines,
    importLocalWines,
    dismissLocalImport,
    resetDemoData,
  };
}
