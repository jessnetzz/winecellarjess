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
    <section className="panel p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Storage map</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-ink">Find the bottle</h2>
        </div>
        <p className="text-sm leading-6 text-smoke">Grouped by rack, shelf, bin, box, fridge, or any display location you enter.</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(groups)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([location, locationWines]) => (
            <div key={location} className="rounded-lg border border-ink/10 bg-porcelain p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-vine/10 text-vine">
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
                  <div key={label} className="rounded-md border border-ink/10 bg-white px-2 py-2 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-smoke">{label}</span>
                    <span className="mt-1 block truncate text-xs font-bold text-vine">{location.includes(label) ? location : '-'}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {locationWines.map((wine) => (
                  <button
                    key={wine.id}
                    className="block w-full rounded-md bg-white px-3 py-2 text-left text-sm shadow-sm transition hover:bg-linen"
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
