import { User } from '@supabase/supabase-js';
import { useMemo, useState } from 'react';
import AppShell from './components/AppShell';
import AuthScreen, { AuthMode } from './components/AuthScreen';
import CellarPriorities from './components/CellarPriorities';
import CellarStats from './components/CellarStats';
import CollectionCards from './components/CollectionCards';
import CollectionTable from './components/CollectionTable';
import Dashboard from './components/Dashboard';
import FiltersPanel from './components/FiltersPanel';
import ImportExportTools from './components/ImportExportTools';
import LandingPage from './components/LandingPage';
import Modal from './components/Modal';
import StorageLocationView from './components/StorageLocationView';
import TonightsBottleCard from './components/TonightsBottleCard';
import WineDetail from './components/WineDetail';
import WineForm from './components/WineForm';
import { useAuth } from './hooks/useAuth';
import { usePersistentWines } from './hooks/usePersistentWines';
import { authService } from './services/authService';
import { SortConfig, TastingLogEntry, Wine, WineFilters } from './types/wine';
import { getDrinkabilityInfo } from './utils/drinkWindow';

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

function applyFilters(wines: Wine[], filters: WineFilters) {
  const query = filters.query.trim().toLowerCase();
  const minRating = filters.rating ? Number(filters.rating) : undefined;
  const vintage = filters.vintage ? Number(filters.vintage) : undefined;

  return wines.filter((wine) => {
    const drinkStatus = getDrinkabilityInfo(wine).status;

    return (
      (!query || searchableWineText(wine).includes(query)) &&
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

function AuthenticatedCellar({ user }: { user: User }) {
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

  const filteredWines = useMemo(() => applySort(applyFilters(wines, filters), sort), [wines, filters, sort]);
  const selectedWine = wines.find((wine) => wine.id === selectedWineId) ?? null;

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

  const handleAddTastingEntry = async (wine: Wine, entry: TastingLogEntry) => {
    const updated = await addTastingEntry(wine, entry);
    if (updated) setSelectedWineId(updated.id);
  };

  return (
    <AppShell
      user={user}
      query={filters.query}
      viewMode={viewMode}
      isBusy={isLoading || isMutating}
      onQueryChange={(query) => setFilters((current) => ({ ...current, query }))}
      onCreateWine={openCreate}
      onRefresh={() => void reload()}
      onSignOut={() => void authService.signOut()}
      onToggleView={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
    >
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <section className="whimsy-hero grid max-w-full gap-4 rounded-lg border border-[#E7DCCB] p-4 shadow-subtle sm:gap-6 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div className="min-w-0">
            <p className="section-kicker">Private cellar</p>
            <h1 className="mt-2 max-w-full whitespace-normal break-words font-liam font-normal leading-[1.05] text-ink sm:mt-3 sm:max-w-4xl sm:leading-tight">
              <span className="block text-[2.35rem] lg:hidden">Your wine cellar, beautifully kept.</span>
              <span className="hidden text-6xl lg:block">
                Your collection, in one place—drink windows, tasting notes, and cellar value, thoughtfully kept.
              </span>
            </h1>
            <div className="mt-4 grid gap-4 xl:block">
              <CellarStats wines={wines} />
              <div className="xl:hidden">
                <TonightsBottleCard wines={wines} onSelectWine={(wine) => setSelectedWineId(wine.id)} />
              </div>
            </div>
            <p className="mt-4 max-w-full whitespace-normal break-words text-sm leading-6 text-smoke sm:mt-5 sm:max-w-3xl sm:text-base sm:leading-7">
              Track bottles, spot what is at peak, and keep your Supabase-backed collection in sync across your devices.
            </p>
          </div>
          <div className="hidden xl:block">
            <TonightsBottleCard wines={wines} onSelectWine={(wine) => setSelectedWineId(wine.id)} />
          </div>
        </section>

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
            <section id="dashboard" className="scroll-mt-32">
              <Dashboard wines={wines} onSelectWine={(wine) => setSelectedWineId(wine.id)} />
            </section>
            <section id="drink-now" className="scroll-mt-32">
              <CellarPriorities wines={wines} onSelectWine={(wine) => setSelectedWineId(wine.id)} />
            </section>
            <FiltersPanel filters={filters} sort={sort} wines={wines} onFiltersChange={setFilters} onSortChange={setSort} />

            <section id="collection" className="scroll-mt-32">
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
                <CollectionCards wines={filteredWines} onSelectWine={(wine) => setSelectedWineId(wine.id)} onEditWine={openEdit} />
              </div>
              {viewMode === 'table' ? (
                <div className="hidden lg:block">
                  <CollectionTable
                    wines={filteredWines}
                    sort={sort}
                    onSortChange={setSort}
                    onSelectWine={(wine) => setSelectedWineId(wine.id)}
                    onEditWine={openEdit}
                  />
                </div>
              ) : null}
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

      <Modal title="Delete wine?" isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} size="md">
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
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  if (isLoading) return <LoadingScreen />;
  if (!user && !authMode) return <LandingPage onAuthEntry={setAuthMode} />;
  if (!user) return <AuthScreen initialMode={authMode ?? 'sign-in'} onBackToLanding={() => setAuthMode(null)} />;

  return <AuthenticatedCellar user={user} />;
}
