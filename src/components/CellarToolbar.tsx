import Icon from './Icon';

interface CellarToolbarProps {
  query: string;
  searchStatus?: 'idle' | 'searching' | 'smart' | 'fallback';
  searchMessage?: string;
  viewMode: 'cards' | 'table';
  isBusy: boolean;
  onQueryChange: (query: string) => void;
  onCreateWine: () => void;
  onRefresh: () => void;
  onToggleView: () => void;
}

export default function CellarToolbar({
  query,
  searchStatus = 'idle',
  searchMessage,
  viewMode,
  isBusy,
  onQueryChange,
  onCreateWine,
  onRefresh,
  onToggleView,
}: CellarToolbarProps) {
  return (
    <section className="cellar-toolbar">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search cellar</span>
        <Icon name="search" className="pointer-events-none absolute left-3 top-6 h-5 w-5 -translate-y-1/2 text-smoke" />
        <input
          className="field h-12 bg-white/95 pl-11 text-base sm:h-11 sm:text-sm"
          type="search"
          placeholder="Try “something cozy for a rainy night”..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {searchStatus !== 'idle' || searchMessage ? (
          <span className={`mt-2 block text-xs font-semibold ${
            searchStatus === 'fallback' ? 'text-clay' : searchStatus === 'searching' ? 'text-smoke' : 'text-plum'
          }`}>
            {searchMessage ?? (searchStatus === 'searching' ? 'Reading your cellar by mood, pairing, and notes...' : 'AI-ranked cellar results')}
          </span>
        ) : null}
      </label>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-start sm:justify-end sm:gap-3">
        <button className="secondary-button min-h-12 sm:min-h-11" type="button" onClick={onToggleView}>
          {viewMode === 'cards' ? 'Table view' : 'Gallery view'}
        </button>
        <button className="secondary-button min-h-12 sm:min-h-11" type="button" onClick={onRefresh} disabled={isBusy}>
          Refresh
        </button>
        <button className="premium-button col-span-2 min-h-12 sm:col-span-1 sm:min-h-11" type="button" onClick={onCreateWine} disabled={isBusy}>
          <Icon name="plus" className="h-4 w-4" />
          Add wine
        </button>
      </div>
    </section>
  );
}
