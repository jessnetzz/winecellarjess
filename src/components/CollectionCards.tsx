import BottleImage from './BottleImage';
import DrinkStatusBadge from './DrinkStatusBadge';
import Icon from './Icon';
import { NaturalLanguageSearchMatch, Wine } from '../types/wine';
import { formatCurrency, formatRating } from '../utils/formatters';
import { getSearchMatchChips } from '../utils/searchResultDisplay';

interface CollectionCardsProps {
  wines: Wine[];
  searchMatches?: Map<string, NaturalLanguageSearchMatch>;
  featuredWineId?: string;
  searchQuery?: string;
  onSelectWine: (wine: Wine) => void;
  onEditWine: (wine: Wine) => void;
  onDeleteWine: (wine: Wine) => void;
}

export default function CollectionCards({
  wines,
  searchMatches,
  featuredWineId,
  searchQuery = '',
  onSelectWine,
  onEditWine,
  onDeleteWine,
}: CollectionCardsProps) {
  if (!wines.length) {
    return (
      <section className="panel p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-vine/10 text-vine">
          <Icon name="search" className="h-7 w-7" />
        </div>
        <p className="section-kicker mt-6">No matches</p>
        <h3 className="mt-2 font-serif text-3xl font-bold text-ink">Try relaxing a filter</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-smoke">
          Search understands names, producers, mood, pairings, tasting notes, AI advice, drink windows, and journal entries.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {wines.map((wine) => {
        const match = searchMatches?.get(wine.id);
        const isFeatured = Boolean(match && featuredWineId === wine.id);

        return (
          <article
            key={wine.id}
            className={`wine-card group ${isFeatured ? 'ring-2 ring-gold/45' : ''}`}
          >
            <button
              className="quick-delete-button"
              type="button"
              aria-label={`Delete bottle: ${wine.vintage} ${wine.name}`}
              title="Delete bottle"
              onClick={() => onDeleteWine(wine)}
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
            <button className="relative z-10 block w-full text-left" type="button" onClick={() => onSelectWine(wine)}>
              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[132px_minmax(0,1fr)]">
                <BottleImage imageUrl={wine.imageUrl} name={wine.name} producer={wine.producer} vintage={wine.vintage} />
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="section-kicker">{wine.style}</p>
                    <DrinkStatusBadge wine={wine} compact />
                  </div>
                  {isFeatured ? (
                    <span className="mt-3 inline-flex rounded-md bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#7B5A22]">
                      Best match
                    </span>
                  ) : null}
                  <h3 className="mt-3 line-clamp-2 font-serif text-2xl font-bold leading-tight text-ink group-hover:text-vine">
                    {wine.name}
                  </h3>
                  <p className="wine-card-meta mt-2 truncate text-sm font-semibold text-smoke">
                    {wine.producer} · {wine.vintage}
                  </p>
                  <p className="wine-card-meta mt-1 truncate text-sm text-smoke">{wine.region}, {wine.country}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="wine-card-peek rounded-md bg-paper px-3 py-2">
                      <span className="block field-label">Qty</span>
                      <span className="font-bold text-ink">{wine.quantity}</span>
                    </div>
                    <div className="wine-card-peek rounded-md bg-paper px-3 py-2">
                      <span className="block field-label">Rating</span>
                      <span className="font-bold text-ink">{formatRating(wine.personalRating)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {match ? (
                <div className="mx-4 mb-4 rounded-lg border border-lavender/25 bg-lavender/10 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-plum">Why this matched</p>
                  <p className="mt-1 text-sm leading-5 text-ink">{match.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getSearchMatchChips(match, wine, searchQuery).map((chip) => (
                      <span key={chip} className="rounded-md bg-white/80 px-2 py-1 text-[11px] font-semibold text-smoke shadow-sm">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </button>
            <div className="relative z-10 flex items-center justify-between gap-3 border-t border-ink/10 bg-porcelain px-4 py-3 transition duration-300 ease-out group-hover:bg-white/90">
              <span className="truncate text-xs font-semibold text-smoke">
                {wine.storageLocation.displayName} · {formatCurrency(wine.marketValue)}
              </span>
              <button
                className="ghost-button min-h-10 px-3 py-1.5 text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                type="button"
                onClick={() => onEditWine(wine)}
              >
                Edit
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
