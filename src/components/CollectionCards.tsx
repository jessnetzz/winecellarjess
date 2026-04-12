import BottleImage from './BottleImage';
import DrinkStatusBadge from './DrinkStatusBadge';
import Icon from './Icon';
import { Wine } from '../types/wine';
import { formatCurrency, formatRating } from '../utils/formatters';

interface CollectionCardsProps {
  wines: Wine[];
  highlightedWineId?: string | null;
  onSelectWine: (wine: Wine) => void;
  onEditWine: (wine: Wine) => void;
}

export default function CollectionCards({ wines, highlightedWineId, onSelectWine, onEditWine }: CollectionCardsProps) {
  if (!wines.length) {
    return (
      <section className="panel p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-vine/10 text-vine">
          <Icon name="search" className="h-7 w-7" />
        </div>
        <p className="section-kicker mt-6">No matches</p>
        <h3 className="mt-2 font-serif text-3xl font-bold text-ink">Try relaxing a filter</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-smoke">
          Search checks the bottle name, producer, origin, varietal, tasting notes, pairings, and storage label.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {wines.map((wine) => (
        <article
          key={wine.id}
          className={`group overflow-hidden rounded-lg border bg-white shadow-subtle transition duration-300 hover:-translate-y-1 hover:shadow-lift ${
            highlightedWineId === wine.id ? 'cellar-new-highlight border-gold/70' : 'border-white/70'
          }`}
        >
          <button className="block w-full text-left" type="button" onClick={() => onSelectWine(wine)}>
            <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-4 p-4">
              <BottleImage imageUrl={wine.imageUrl} name={wine.name} producer={wine.producer} vintage={wine.vintage} />
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="section-kicker">{wine.style}</p>
                  <DrinkStatusBadge wine={wine} compact />
                </div>
                <h3 className="mt-3 line-clamp-2 font-serif text-2xl font-bold leading-tight text-ink group-hover:text-vine">
                  {wine.name}
                </h3>
                <p className="mt-2 truncate text-sm font-semibold text-smoke">
                  {wine.producer} · {wine.vintage}
                </p>
                <p className="mt-1 truncate text-sm text-smoke">{wine.region}, {wine.country}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-paper px-3 py-2">
                    <span className="block field-label">Qty</span>
                    <span className="font-bold text-ink">{wine.quantity}</span>
                  </div>
                  <div className="rounded-md bg-paper px-3 py-2">
                    <span className="block field-label">Rating</span>
                    <span className="font-bold text-ink">{formatRating(wine.personalRating)}</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
          <div className="flex items-center justify-between gap-3 border-t border-ink/10 bg-porcelain px-4 py-3">
            <span className="truncate text-xs font-semibold text-smoke">
              {wine.storageLocation.displayName} · {formatCurrency(wine.marketValue)}
            </span>
            <button
              className="rounded-md px-3 py-1.5 text-xs font-bold text-vine opacity-100 transition hover:bg-vine/10 sm:opacity-0 sm:group-hover:opacity-100"
              type="button"
              onClick={() => onEditWine(wine)}
            >
              Edit
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
