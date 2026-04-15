import { User } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import AppShell from './components/AppShell';
import AuthScreen, { AuthMode } from './components/AuthScreen';
import CellarPriorities from './components/CellarPriorities';
import CellarStats from './components/CellarStats';
import CellarToolbar from './components/CellarToolbar';
import CollectionCards from './components/CollectionCards';
import CollectionTable from './components/CollectionTable';
import Dashboard from './components/Dashboard';
import FiltersPanel from './components/FiltersPanel';
import ImportExportTools from './components/ImportExportTools';
import LandingPage from './components/LandingPage';
import Modal from './components/Modal';
import SearchResultsSection from './components/SearchResultsSection';
import StorageLocationView from './components/StorageLocationView';
import TonightsBottleCard from './components/TonightsBottleCard';
import WineDetail from './components/WineDetail';
import WineForm from './components/WineForm';
import { useAuth } from './hooks/useAuth';
import { usePersistentWines } from './hooks/usePersistentWines';
import { AppRoute, useRoute } from './hooks/useRoute';
import { authService } from './services/authService';
import { searchWinesNaturally } from './services/naturalLanguageSearchService';
import { NaturalLanguageSearchMatch, SortConfig, TastingLogEntry, Wine, WineFilters } from './types/wine';
import { getDrinkabilityInfo } from './utils/drinkWindow';
import { getDailyWineFact } from './utils/dailyWineFact';
import { getUserCellarLabel } from './utils/userDisplayName';

type ViewMode = 'cards' | 'table';

const initialFilters: WineFilters = {
  query: '',
  style: 'all',
  country: '',
  region: '',
  status: 'all',
  rating: '',
  vintage: '',
  drinkability: 'all',
  storage: '',
};

const initialSort: SortConfig = { key: 'bestDrinkBy', direction: 'asc' };

function searchableWineText(wine: Wine) {
  return [
    wine.name,
    wine.producer,
    wine.region,
    wine.country,
    wine.appellation,
    wine.varietal,
    wine.tastingNotes,
    wine.foodPairingNotes,
    wine.storageLocation.displayName,
  ]
    .join(' ')
    .toLowerCase();
}

function applyFilters(wines: Wine[], filters: WineFilters, semanticIds?: Set<string>) {
  const query = filters.query.trim().toLowerCase();
  const minRating = filters.rating ? Number(filters.rating) : undefined;
  const vintage = filters.vintage ? Number(filters.vintage) : undefined;

  return wines.filter((wine) => {
    const drinkStatus = getDrinkabilityInfo(wine).status;

    return (
      (!query || searchableWineText(wine).includes(query) || semanticIds?.has(wine.id)) &&
      (filters.style === 'all' || wine.style === filters.style) &&
      (!filters.country || wine.country === filters.country) &&
      (!filters.region || wine.region === filters.region) &&
      (filters.status === 'all' || wine.status === filters.status) &&
      (filters.drinkability === 'all' || drinkStatus === filters.drinkability) &&
      (!filters.storage || wine.storageLocation.displayName === filters.storage) &&
      (!Number.isFinite(minRating) || (wine.personalRating ?? 0) >= Number(minRating)) &&
      (!Number.isFinite(vintage) || wine.vintage === Number(vintage))
    );
  });
}

function applySemanticOrder(wines: Wine[], matches: NaturalLanguageSearchMatch[]) {
  const rank = new Map(matches.map((match, index) => [match.id, index]));
  return [...wines].sort((a, b) => {
    const aRank = rank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bRank = rank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return a.name.localeCompare(b.name);
  });
}

function applySort(wines: Wine[], sort: SortConfig) {
  return [...wines].sort((a, b) => {
    const aValue = a[sort.key] ?? '';
    const bValue = b[sort.key] ?? '';
    const direction = sort.direction === 'asc' ? 1 : -1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * direction;
    }

    return String(aValue).localeCompare(String(bValue)) * direction;
  });
}

function LoadingScreen() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-lg p-8 text-center">
        <p className="field-label text-vine">Loading cellar</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-ink">Pouring the first glass...</h1>
        <p className="mt-4 text-sm leading-6 text-smoke">Checking your secure Supabase session.</p>
      </div>
    </div>
  );
}

function RouteRedirect({ to, replace }: { to: AppRoute; replace: (route: AppRoute) => void }) {
  useEffect(() => {
    replace(to);
  }, [replace, to]);

  return <LoadingScreen />;
}

function LocalImportBanner({
  onImport,
  onDismiss,
  isBusy,
}: {
  onImport: () => void;
  onDismiss: () => void;
  isBusy: boolean;
}) {
  return (
    <section className="rounded-lg border border-gold/40 bg-gold/10 p-5 shadow-subtle">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="field-label text-[#7B5A22]">Local data found</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-ink">Import your browser cellar into Supabase</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-smoke">
            This is a one-time migration from the old localStorage data. After import, Supabase becomes the source of truth.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="premium-button" type="button" onClick={onImport} disabled={isBusy}>
            {isBusy ? 'Importing...' : 'Import my local data'}
          </button>
          <button className="ghost-button" type="button" onClick={onDismiss} disabled={isBusy}>
            Not now
          </button>
        </div>
      </div>
    </section>
  );
}

function AuthenticatedCellar({ user, accessToken }: { user: User; accessToken: string }) {
  const {
    wines,
    isLoading,
    isMutating,
    error,
    hasLocalImport,
    saveWine,
    updateWine,
    deleteWine: deleteCloudWine,
    addTastingEntry,
    importWines,
    importLocalWines,
    dismissLocalImport,
    resetDemoData,
    reload,
  } = usePersistentWines(user);
  const [filters, setFilters] = useState<WineFilters>(initialFilters);
  const [sort, setSort] = useState<SortConfig>(initialSort);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedWineId, setSelectedWineId] = useState<string | null>(null);
  const [editingWine, setEditingWine] = useState<Wine | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Wine | null>(null);
  const [naturalSearch, setNaturalSearch] = useState<{
    query: string;
    matches: NaturalLanguageSearchMatch[];
    isLoading: boolean;
    error: string | null;
  }>({ query: '', matches: [], isLoading: false, error: null });

  const searchQuery = filters.query.trim();
  const activeNaturalSearch =
    naturalSearch.query === searchQuery && naturalSearch.matches.length > 0 && !naturalSearch.error;
  const naturalSearchIds = useMemo(
    () => activeNaturalSearch ? new Set(naturalSearch.matches.map((match) => match.id)) : undefined,
    [activeNaturalSearch, naturalSearch.matches],
  );
  const searchMatchById = useMemo(
    () => activeNaturalSearch ? new Map(naturalSearch.matches.map((match) => [match.id, match])) : undefined,
    [activeNaturalSearch, naturalSearch.matches],
  );
  const filteredWines = useMemo(() => {
    const filtered = applyFilters(wines, filters, naturalSearchIds);
    return activeNaturalSearch ? applySemanticOrder(filtered, naturalSearch.matches) : applySort(filtered, sort);
  }, [activeNaturalSearch, naturalSearch.matches, naturalSearchIds, wines, filters, sort]);
  const dailyWineFact = useMemo(() => getDailyWineFact(new Date(), wines), [wines]);
  const cellarLabel = useMemo(() => getUserCellarLabel(user), [user]);
  const isSearchingByText = searchQuery.length > 0;
  const selectedWine = wines.find((wine) => wine.id === selectedWineId) ?? null;

  useEffect(() => {
    const query = filters.query.trim();
    if (query.length < 3 || !accessToken || !wines.length) {
      setNaturalSearch({ query: '', matches: [], isLoading: false, error: null });
      return;
    }

    let isCurrent = true;
    setNaturalSearch((current) => ({ ...current, query, isLoading: true, error: null }));

    const timeout = window.setTimeout(() => {
      searchWinesNaturally(query, accessToken, 40)
        .then((result) => {
          if (!isCurrent) return;
          setNaturalSearch({ query: result.query, matches: result.matches, isLoading: false, error: null });
        })
        .catch((caught) => {
          if (!isCurrent) return;
          setNaturalSearch({
            query,
            matches: [],
            isLoading: false,
            error: caught instanceof Error ? caught.message : 'Natural-language search is unavailable right now.',
          });
        });
    }, 650);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeout);
    };
  }, [accessToken, filters.query, wines.length]);

  const upsertWine = async (wine: Wine) => {
    const saved = await saveWine(wine);
    if (!saved) return;

    setIsFormOpen(false);
    setEditingWine(undefined);
    setSelectedWineId(saved.id);
  };

  const deleteWine = async (wine: Wine) => {
    const deleted = await deleteCloudWine(wine);
    if (!deleted) return;

    if (selectedWineId === wine.id) setSelectedWineId(null);
    setDeleteTarget(null);
  };

  const openCreate = () => {
    setEditingWine(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (wine: Wine) => {
    setEditingWine(wine);
    setSelectedWineId(null);
    setIsFormOpen(true);
  };

  const clearSearch = () => {
    setFilters((current) => ({ ...current, query: '' }));
    setNaturalSearch({ query: '', matches: [], isLoading: false, error: null });
  };

  const handleAddTastingEntry = async (wine: Wine, entry: TastingLogEntry) => {
    const updated = await addTastingEntry(wine, entry);
    if (updated) setSelectedWineId(updated.id);
  };

  return (
    <AppShell
      user={user}
      onCreateWine={openCreate}
      onSignOut={() => void authService.signOut()}
    >
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <section className="whimsy-hero grid max-w-full gap-4 rounded-lg border border-[#E7DCCB] p-4 shadow-subtle sm:gap-6 sm:p-6 xl:min-h-[430px] xl:grid-cols-[minmax(0,1fr)_336px] xl:items-center xl:gap-10">
          <div className="min-w-0 xl:flex xl:min-h-[360px] xl:max-w-[860px] xl:flex-col xl:justify-center">
            <div className="xl:max-w-[700px]">
              <p className="section-kicker">{cellarLabel}</p>
              <h1 className="mt-2 max-w-3xl whitespace-normal break-words font-liam text-[2.55rem] font-normal leading-[1.05] text-ink sm:mt-3 sm:text-5xl sm:leading-[1.08] lg:text-6xl lg:leading-tight">
                <span className="block">Everything you love</span>
                <span className="block">about your wines.</span>
              </h1>
              <p className="mt-4 max-w-2xl whitespace-normal break-words text-base leading-7 text-smoke sm:mt-5 sm:text-lg sm:leading-8">
                All in one place—even the little details you forget.
              </p>
              <div className={`hero-cellar-note hero-cellar-note--${dailyWineFact.tone} mt-4 max-w-xl`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-plum/75">Today&apos;s wine fact</p>
                  <span className="hero-cellar-note-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="hero-cellar-note-sparkle" fill="none">
                      <path
                        d="M12 3.5L13.9 10.1L20.5 12L13.9 13.9L12 20.5L10.1 13.9L3.5 12L10.1 10.1L12 3.5Z"
                        fill="currentColor"
                      />
                      <circle cx="12" cy="12" r="1.2" fill="rgba(255,255,255,0.72)" />
                    </svg>
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-smoke/80">
                  {dailyWineFact.title}
                </p>
                <p className="mt-2 font-serif text-lg leading-7 text-ink/85 sm:text-[1.35rem] sm:leading-8">
                  {dailyWineFact.body}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:mt-5 xl:max-w-[760px]">
              <CellarStats wines={wines} />
              <div className="xl:hidden">
                <TonightsBottleCard wines={wines} onSelectWine={(wine) => setSelectedWineId(wine.id)} />
              </div>
            </div>
          </div>
          <div className="hidden xl:block xl:self-center xl:border-l xl:border-[#E7DCCB]/70 xl:pl-6">
            <TonightsBottleCard wines={wines} onSelectWine={(wine) => setSelectedWineId(wine.id)} />
          </div>
        </section>

        <CellarToolbar
          query={filters.query}
          searchStatus={
            naturalSearch.isLoading
              ? 'searching'
              : activeNaturalSearch
                ? 'smart'
                : naturalSearch.error && filters.query.trim().length >= 3
                  ? 'fallback'
                  : 'idle'
          }
          searchMessage={
            naturalSearch.isLoading
              ? 'Reading your cellar by mood, pairing, occasion, and notes...'
              : activeNaturalSearch
                ? `Showing AI-ranked bottles for "${searchQuery}".`
                : naturalSearch.error && filters.query.trim().length >= 3
                  ? 'AI search is unavailable, so keyword search is still working.'
                  : undefined
          }
          viewMode={viewMode}
          isBusy={isLoading || isMutating}
          onQueryChange={(query) => setFilters((current) => ({ ...current, query }))}
          onCreateWine={openCreate}
          onRefresh={() => void reload()}
          onToggleView={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
        />

        {hasLocalImport ? (
          <LocalImportBanner onImport={() => void importLocalWines()} onDismiss={dismissLocalImport} isBusy={isMutating} />
        ) : null}

        {error ? (
          <section className="rounded-lg border border-clay/30 bg-clay/10 p-5 text-sm leading-6 text-clay">
            <p className="font-bold">Something needs attention</p>
            <p className="mt-1">{error}</p>
          </section>
        ) : null}

        {isLoading ? (
          <section className="panel grid gap-5 p-6 md:grid-cols-3">
            <div className="skeleton h-28" />
            <div className="skeleton h-28" />
            <div className="skeleton h-28" />
          </section>
        ) : null}

        {!isLoading && !wines.length ? (
          <section className="panel p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg bg-vine/10 text-5xl" aria-hidden="true">
              W
            </div>
            <p className="section-kicker mt-6">Empty cellar</p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-ink">Add your first bottle</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-smoke">
              Start with a bottle you already own, import a CSV, or load the demo set to explore the app.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button className="premium-button" type="button" onClick={openCreate}>
                Add wine
              </button>
              <button className="secondary-button" type="button" onClick={() => void resetDemoData()}>
                Load demo data
              </button>
            </div>
          </section>
        ) : null}

        {wines.length ? (
          <>
            {!isSearchingByText ? (
              <>
                <section id="dashboard" className="scroll-mt-32">
                  <Dashboard wines={wines} onSelectWine={(wine) => setSelectedWineId(wine.id)} />
                </section>
                <section id="drink-now" className="scroll-mt-32">
                  <CellarPriorities wines={wines} onSelectWine={(wine) => setSelectedWineId(wine.id)} />
                </section>
              </>
            ) : null}
            <FiltersPanel filters={filters} sort={sort} wines={wines} onFiltersChange={setFilters} onSortChange={setSort} />

            <section id="collection" className="scroll-mt-32">
              {isSearchingByText ? (
                <SearchResultsSection
                  query={searchQuery}
                  wines={filteredWines}
                  searchMatches={searchMatchById}
                  isLoading={naturalSearch.isLoading}
                  error={naturalSearch.error}
                  viewMode={viewMode}
                  sort={sort}
                  onClearSearch={clearSearch}
                  onSortChange={setSort}
                  onSelectWine={(wine) => setSelectedWineId(wine.id)}
                  onEditWine={openEdit}
                  onDeleteWine={(wine) => setDeleteTarget(wine)}
                />
              ) : (
                <>
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="section-kicker">Collection</p>
                      <h2 className="mt-2 font-serif text-3xl font-bold text-ink">
                        {filteredWines.length} wine{filteredWines.length === 1 ? '' : 's'} in view
                      </h2>
                    </div>
                    <p className="text-sm text-smoke">
                      Sorted by {sort.key} {sort.direction === 'asc' ? 'ascending' : 'descending'}
                    </p>
                  </div>
                  <div className={viewMode === 'cards' ? '' : 'lg:hidden'}>
                    <CollectionCards
                      wines={filteredWines}
                      onSelectWine={(wine) => setSelectedWineId(wine.id)}
                      onEditWine={openEdit}
                      onDeleteWine={(wine) => setDeleteTarget(wine)}
                    />
                  </div>
                  {viewMode === 'table' ? (
                    <div className="hidden lg:block">
                      <CollectionTable
                        wines={filteredWines}
                        sort={sort}
                        onSortChange={setSort}
                        onSelectWine={(wine) => setSelectedWineId(wine.id)}
                        onEditWine={openEdit}
                        onDeleteWine={(wine) => setDeleteTarget(wine)}
                      />
                    </div>
                  ) : null}
                </>
              )}
            </section>

            <section id="storage" className="scroll-mt-32">
              <StorageLocationView wines={wines} onSelectWine={(wine) => setSelectedWineId(wine.id)} />
            </section>
          </>
        ) : null}

        <section id="settings" className="scroll-mt-32">
          <ImportExportTools
            wines={wines}
            onImport={importWines}
            onResetDemoData={resetDemoData}
            isBusy={isMutating}
          />
        </section>
      </main>

      <Modal
        title={editingWine ? 'Edit wine' : 'Add wine'}
        description="Log cellar details, location, drink window, tasting notes, and image preview."
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingWine(undefined);
        }}
        size="xl"
      >
        <WineForm
          wine={editingWine}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingWine(undefined);
          }}
          onSave={(wine) => void upsertWine(wine)}
        />
      </Modal>

      <Modal
        title={selectedWine ? `${selectedWine.vintage} ${selectedWine.name}` : 'Wine detail'}
        description={selectedWine ? `${selectedWine.producer} - ${selectedWine.region}` : undefined}
        isOpen={Boolean(selectedWine)}
        onClose={() => setSelectedWineId(null)}
        size="xl"
      >
        {selectedWine ? (
          <WineDetail
            wine={selectedWine}
            onEdit={openEdit}
            onDelete={(wine) => {
              setSelectedWineId(null);
              setDeleteTarget(wine);
            }}
            onUpdateWine={(wine) => void updateWine(wine)}
            onAddTastingEntry={handleAddTastingEntry}
          />
        ) : null}
      </Modal>

      <Modal
        title="Remove this bottle?"
        description="This will permanently remove it from your cellar."
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        size="md"
      >
        {deleteTarget ? (
          <div className="p-5">
            <p className="text-sm leading-6 text-smoke">
              This removes {deleteTarget.vintage} {deleteTarget.name} by {deleteTarget.producer} from Supabase. CSV exports and
              future backups will not include it unless you re-add it.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button className="secondary-button" type="button" onClick={() => setDeleteTarget(null)}>
                Keep bottle
              </button>
              <button
                className="premium-button bg-clay hover:bg-clay/90"
                type="button"
                onClick={() => void deleteWine(deleteTarget)}
                disabled={isMutating}
              >
                Delete wine
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AppShell>
  );
}

export default function App() {
  const { user, session, isLoading } = useAuth();
  const { route, navigate, replace } = useRoute();

  if (isLoading) return <LoadingScreen />;

  if (user) {
    if (route !== '/app') return <RouteRedirect to="/app" replace={replace} />;
    return <AuthenticatedCellar user={user} accessToken={session?.access_token ?? ''} />;
  }

  if (route === '/app') return <RouteRedirect to="/login" replace={replace} />;
  if (route === '/login' || route === '/signup') {
    return (
      <AuthScreen
        initialMode={route === '/signup' ? 'sign-up' : 'sign-in'}
        onBackToLanding={() => navigate('/')}
        onModeChange={(mode: AuthMode) => navigate(mode === 'sign-up' ? '/signup' : '/login')}
      />
    );
  }

  return <LandingPage onAuthEntry={(mode) => navigate(mode === 'sign-up' ? '/signup' : '/login')} />;
}
