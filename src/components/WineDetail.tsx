import AIAdvicePanel from './AIAdvicePanel';
import BottleImage from './BottleImage';
import DrinkStatusBadge from './DrinkStatusBadge';
import TastingJournal from './TastingJournal';
import { TastingLogEntry, Wine } from '../types/wine';
import { formatCurrency, formatRating } from '../utils/formatters';
import { getDrinkabilityInfo } from '../utils/drinkWindow';

interface WineDetailProps {
  wine: Wine;
  onEdit: (wine: Wine) => void;
  onDelete: (wine: Wine) => void;
  onUpdateWine: (wine: Wine) => void;
  onAddTastingEntry: (wine: Wine, entry: TastingLogEntry) => void | Promise<void>;
}

function DetailItem({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="interactive-surface rounded-lg border border-ink/10 bg-porcelain p-4 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-white hover:shadow-sm">
      <p className="field-label">{label}</p>
      <p className="mt-2 font-semibold text-ink">{value || 'Not set'}</p>
    </div>
  );
}

export default function WineDetail({ wine, onEdit, onDelete, onUpdateWine, onAddTastingEntry }: WineDetailProps) {
  const drinkInfo = getDrinkabilityInfo(wine);

  return (
    <div className="space-y-6 p-5">
      <section className="grid gap-6 rounded-lg bg-vine p-5 text-white lg:grid-cols-[260px_minmax(0,1fr)]">
        <BottleImage imageUrl={wine.imageUrl} name={wine.name} producer={wine.producer} vintage={wine.vintage} />
        <div className="flex flex-col justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/70">{wine.appellation || wine.region}</p>
            <h2 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">{wine.vintage} {wine.name}</h2>
            <p className="mt-3 text-lg font-semibold text-white/80">{wine.producer}</p>
            <div className="mt-5 max-w-xl rounded-lg bg-white p-4 text-ink shadow-subtle">
              <DrinkStatusBadge wine={wine} showTimeline />
              <p className="mt-3 text-sm leading-6 text-smoke">{drinkInfo.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="secondary-button border-white/30 bg-white/95" type="button" onClick={() => onEdit(wine)}>
              Edit profile
            </button>
            <button className="secondary-button border-white/30 bg-white/10 text-white hover:bg-white/15" type="button" onClick={() => onDelete(wine)}>
              Delete
            </button>
          </div>
        </div>
      </section>

      <main className="space-y-6">
        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">Overview</p>
              <h3 className="mt-2 font-serif text-3xl font-bold text-ink">Bottle profile</h3>
            </div>
            <p className="text-sm font-semibold text-smoke">{wine.storageLocation.displayName}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Quantity" value={`${wine.quantity} bottle${wine.quantity === 1 ? '' : 's'}`} />
            <DetailItem label="Location" value={wine.storageLocation.displayName} />
            <DetailItem label="Style" value={wine.style} />
            <DetailItem label="Rating" value={formatRating(wine.personalRating)} />
            <DetailItem label="Varietal" value={wine.varietal} />
            <DetailItem label="Region" value={`${wine.region}, ${wine.country}`} />
            <DetailItem label="Bottle size" value={wine.bottleSize} />
            <DetailItem label="Status" value={wine.status} />
            <DetailItem label="Purchase" value={`${formatCurrency(wine.purchasePrice)} · ${wine.purchaseDate || 'date unknown'}`} />
            <DetailItem label="Market value" value={formatCurrency(wine.marketValue)} />
            <DetailItem label="Alcohol" value={wine.alcoholPercent ? `${wine.alcoholPercent}%` : undefined} />
            <DetailItem label="Source" value={wine.acquisitionSource} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="soft-card">
            <p className="field-label">Drink window</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">
              {wine.drinkWindowStart}-{wine.drinkWindowEnd}
            </p>
          </div>
          <div className="soft-card">
            <p className="field-label">Best drink by</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">{wine.bestDrinkBy}</p>
          </div>
          <div className="soft-card">
            <p className="field-label">Inventory value</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">{formatCurrency(wine.marketValue * wine.quantity)}</p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="tasting-note-card">
            <p className="section-kicker">Tasting notes</p>
            <p className="mt-3 text-sm leading-6 text-ink">{wine.tastingNotes || 'No tasting notes yet.'}</p>
          </div>
          <div className="tasting-note-card">
            <p className="section-kicker">Food pairing notes</p>
            <p className="mt-3 text-sm leading-6 text-ink">{wine.foodPairingNotes || 'No pairing notes yet.'}</p>
          </div>
        </section>

        <AIAdvicePanel wine={wine} onApplyAdvice={onUpdateWine} />
        <TastingJournal wine={wine} onAddTastingEntry={onAddTastingEntry} />
      </main>
    </div>
  );
}
