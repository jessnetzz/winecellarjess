import BottleImage from './BottleImage';
import CollectionCards from './CollectionCards';
import CollectionTable from './CollectionTable';
import DrinkStatusBadge from './DrinkStatusBadge';
import Icon from './Icon';
import { NaturalLanguageSearchMatch, SortConfig, Wine } from '../types/wine';
import { formatRating } from '../utils/formatters';
import { getBestMatchNote, getSearchMatchChips } from '../utils/searchResultDisplay';

interface SearchResultsSectionProps {
  query: string;
  wines: Wine[];
  searchMatches?: Map<string, NaturalLanguageSearchMatch>;
  isLoading: boolean;
  error: string | null;
  viewMode: 'cards' | 'table';
  sort: SortConfig;
  onClearSearch: () => void;
  onSortChange: (sort: SortConfig) => void;
  onSelectWine: (wine: Wine) => void;
  onEditWine: (wine: Wine) => void;
  onDeleteWine: (wine: Wine) => void;
}

function SearchEmptyState({ query, onClearSearch }: Pick<SearchResultsSectionProps, 'query' | 'onClearSearch'>) {
  return (
    <section className="search-results-shell p-6 text-center sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-lavender/15 text-plum">
        <Icon name="search" className="h-7 w-7" />
      </div>
      <p className="section-kicker mt-6">Search results</p>
      <h2 className="mt-2 font-serif text-3xl font-bold text-ink">No bottles match that search</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-smoke">
        Nothing surfaced for "{query}". Try searching by food, mood, occasion, tasting note, producer, or region.
      </p>
      <button className="secondary-button mt-6" type="button" onClick={onClearSearch}>
        Clear search
      </button>
    </section>
  );
}

function SearchSummaryBar({
  query,
  resultCount,
  isLoading,
  error,
  onClearSearch,
}: Pick<SearchResultsSectionProps, 'query' | 'isLoading' | 'error' | 'onClearSearch'> & { resultCount: number }) {
  return (
    <section className="search-summary-bar">
      <div className="min-w-0">
        <p className="section-kicker">Search results</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-lavender/25 bg-white/75 px-3 py-1.5 text-sm font-bold text-plum shadow-sm">
            "{query}"
          </span>
          <span className="text-sm font-semibold text-ink">
            {resultCount} bottle{resultCount === 1 ? '' : 's'} found
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-smoke">
          {isLoading
            ? 'Reading the cellar by meaning, pairing, notes, and drinking window.'
            : error
              ? 'AI ranking is unavailable right now, so keyword matches are still shown.'
              : 'Best matches for your search, ranked by pairing, notes, AI suggestions, and cellar timing.'}
        </p>
      </div>
      <button className="ghost-button bg-white/70" type="button" onClick={onClearSearch}>
        Clear search
      </button>
    </section>
  );
}

function BestMatchCard({
  wine,
  match,
  query,
  onSelectWine,
  onDeleteWine,
}: {
  wine: Wine;
  match?: NaturalLanguageSearchMatch;
  query: string;
  onSelectWine: (wine: Wine) => void;
  onDeleteWine: (wine: Wine) => void;
}) {
  const sommelierNote = getBestMatchNote(wine, match, query);

  return (
    <article className="best-match-card">
      <button
        className="quick-delete-button"
        type="button"
        aria-label={`Delete bottle: ${wine.vintage} ${wine.name}`}
        title="Delete bottle"
        onClick={() => onDeleteWine(wine)}
      >
        <Icon name="trash" className="h-4 w-4" />
      </button>
      <div className="grid gap-5 p-5 sm:grid-cols-[164px_minmax(0,1fr)] sm:p-6">
        <button className="text-left" type="button" onClick={() => onSelectWine(wine)}>
          <BottleImage imageUrl={wine.imageUrl} name={wine.name} producer={wine.producer} vintage={wine.vintage} />
        </button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#7B5A22]">
              <Icon name="sparkle" className="h-3.5 w-3.5" />
              Best match for your search
            </span>
            <DrinkStatusBadge wine={wine} compact />
          </div>
          <button className="mt-4 block text-left" type="button" onClick={() => onSelectWine(wine)}>
            <h3 className="font-serif text-3xl font-bold leading-tight text-ink transition duration-300 ease-out hover:text-vine sm:text-4xl">
              {wine.name}
            </h3>
          </button>
          <p className="mt-2 text-base font-semibold text-smoke">
            {wine.producer} · {wine.vintage}
          </p>
          <p className="mt-1 text-sm leading-6 text-smoke">
            {[wine.region, wine.appellation, wine.varietal].filter(Boolean).join(' · ')}
          </p>
          <div className="mt-4 max-w-2xl rounded-lg border border-gold/25 bg-porcelain/75 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#7B5A22]">Sommelier's note</p>
            <p className="mt-2 font-serif text-xl font-bold leading-tight text-ink">{sommelierNote.heading}</p>
            <p className="mt-2 text-sm leading-6 text-ink">
              {sommelierNote.body}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(match ? getSearchMatchChips(match, wine, query) : ['Top visible result', `Style: ${wine.varietal || wine.style}`, `Rating: ${formatRating(wine.personalRating)}`]).map((chip) => (
              <span key={chip} className="rounded-md border border-white/80 bg-white/75 px-2.5 py-1 text-xs font-semibold text-smoke shadow-sm">
                {chip}
              </span>
            ))}
          </div>
          <button className="premium-button mt-5" type="button" onClick={() => onSelectWine(wine)}>
            View bottle
          </button>
        </div>
      </div>
    </article>
  );
}

export default function SearchResultsSection({
  query,
  wines,
  searchMatches,
  isLoading,
  error,
  viewMode,
  sort,
  onClearSearch,
  onSortChange,
  onSelectWine,
  onEditWine,
  onDeleteWine,
}: SearchResultsSectionProps) {
  const bestMatch = wines[0];
  const otherMatches = bestMatch ? wines.slice(1) : [];

  if (!wines.length && !isLoading) {
    return <SearchEmptyState query={query} onClearSearch={onClearSearch} />;
  }

  return (
    <div className="search-results-mode space-y-5">
      <SearchSummaryBar
        query={query}
        resultCount={wines.length}
        isLoading={isLoading}
        error={error}
        onClearSearch={onClearSearch}
      />

      {bestMatch ? (
        <section className="space-y-3">
          <p className="section-kicker">Most likely bottle</p>
          <BestMatchCard
            wine={bestMatch}
            match={searchMatches?.get(bestMatch.id)}
            query={query}
            onSelectWine={onSelectWine}
            onDeleteWine={onDeleteWine}
          />
        </section>
      ) : (
        <section className="search-results-shell p-6">
          <div className="skeleton h-40" />
        </section>
      )}

      {otherMatches.length ? (
        <section className="space-y-4">
          <div>
            <p className="section-kicker">Other matches</p>
            <h3 className="mt-2 font-serif text-2xl font-bold text-ink">
              {otherMatches.length} more bottle{otherMatches.length === 1 ? '' : 's'} worth considering
            </h3>
          </div>
          <div className={viewMode === 'cards' ? '' : 'lg:hidden'}>
            <CollectionCards
              wines={otherMatches}
              searchMatches={searchMatches}
              searchQuery={query}
              onSelectWine={onSelectWine}
              onEditWine={onEditWine}
              onDeleteWine={onDeleteWine}
            />
          </div>
          {viewMode === 'table' ? (
            <div className="hidden lg:block">
              <CollectionTable
                wines={otherMatches}
                sort={sort}
                searchMatches={searchMatches}
                onSortChange={onSortChange}
                onSelectWine={onSelectWine}
                onEditWine={onEditWine}
                onDeleteWine={onDeleteWine}
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
