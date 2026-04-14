import BottleImage from './BottleImage';
import DrinkStatusBadge from './DrinkStatusBadge';
import Icon from './Icon';
import { Wine } from '../types/wine';
import { formatCurrency, formatRating } from '../utils/formatters';

interface CollectionCardsProps {
  wines: Wine[];
  onSelectWine: (wine: Wine) => void;
  onEditWine: (wine: Wine) => void;
}

export default function CollectionCards({ wines, onSelectWine, onEditWine }: CollectionCardsProps) {
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
      {wines.map((wine) => (
        <article
          key={wine.id}
          className="wine-card group"
        >
          <button className="relative z-10 block w-full text-left" type="button" onClick={() => onSelectWine(wine)}>
            <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[132px_minmax(0,1fr)]">
              <BottleImage imageUrl={wine.imageUrl} name={wine.name} producer={wine.producer} vintage={wine.vintage} />
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="section-kicker">{wine.style}</p>
                  <DrinkStatusBadge wine={wine} compact />
                </div>
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
      ))}
    </div>
  );
}
