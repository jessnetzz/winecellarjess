import { Wine } from '../types/wine';
import Icon from './Icon';

interface StorageLocationViewProps {
  wines: Wine[];
  onSelectWine: (wine: Wine) => void;
}

export default function StorageLocationView({ wines, onSelectWine }: StorageLocationViewProps) {
  const groups = wines.reduce<Record<string, Wine[]>>((result, wine) => {
    const location = wine.storageLocation.displayName || 'Unassigned';
    result[location] = [...(result[location] ?? []), wine];
    return result;
  }, {});

  return (
    <section className="panel overflow-hidden">
      <div className="drink-soon-header border-b border-ink/10 px-5 py-5 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-liam text-[2.35rem] font-normal leading-none text-white sm:text-[2.55rem]">
            Find the bottle
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/78">
            Grouped by rack, shelf, bin, box, fridge, or any display location you enter.
          </p>
        </div>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(groups)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([location, locationWines]) => (
            <div key={location} className="storage-card group">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="interactive-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-vine/10 text-vine group-hover:bg-vine/15">
                    <Icon name="cellar" className="h-5 w-5" />
                  </span>
                  <h3 className="truncate font-bold text-ink">{location}</h3>
                </div>
                <span className="rounded-md bg-white px-3 py-1 text-xs font-bold text-smoke shadow-sm">
                  {locationWines.reduce((sum, wine) => sum + wine.quantity, 0)} bottles
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {['Rack', 'Shelf', 'Bin'].map((label) => (
                  <div key={label} className="storage-chip">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-smoke">{label}</span>
                    <span className="mt-1 block truncate text-xs font-bold text-vine">{location.includes(label) ? location : '-'}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {locationWines.map((wine) => (
                  <button
                    key={wine.id}
                    className="storage-bottle-button"
                    type="button"
                    onClick={() => onSelectWine(wine)}
                  >
                    <span className="font-bold text-vine">{wine.vintage} {wine.name}</span>
                    <span className="block text-smoke">{wine.producer} - qty {wine.quantity}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
