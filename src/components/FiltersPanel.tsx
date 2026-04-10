import { DrinkabilityStatus, SortConfig, Wine, WineFilters, WineSortKey, WineStatus, WineStyle } from '../types/wine';

interface FiltersPanelProps {
  filters: WineFilters;
  sort: SortConfig;
  wines: Wine[];
  onFiltersChange: (filters: WineFilters) => void;
  onSortChange: (sort: SortConfig) => void;
}

const styles: Array<WineStyle | 'all'> = ['all', 'red', 'white', 'rose', 'sparkling', 'dessert', 'fortified', 'orange'];
const statuses: Array<WineStatus | 'all'> = ['all', 'unopened', 'opened', 'consumed'];
const drinkability: Array<DrinkabilityStatus | 'all'> = [
  'all',
  'Too young',
  'Approaching window',
  'Ready to drink',
  'Peak window',
  'Nearing end of peak',
  'Past peak',
];

const sortKeys: Array<{ label: string; value: WineSortKey }> = [
  { label: 'Wine name', value: 'name' },
  { label: 'Producer', value: 'producer' },
  { label: 'Vintage', value: 'vintage' },
  { label: 'Quantity', value: 'quantity' },
  { label: 'Purchase price', value: 'purchasePrice' },
  { label: 'Best drink year', value: 'bestDrinkBy' },
  { label: 'Rating', value: 'personalRating' },
];

function uniqueValues(wines: Wine[], getValue: (wine: Wine) => string) {
  return Array.from(new Set(wines.map(getValue).filter(Boolean))).sort();
}

export default function FiltersPanel({ filters, sort, wines, onFiltersChange, onSortChange }: FiltersPanelProps) {
  const countries = uniqueValues(wines, (wine) => wine.country);
  const regions = uniqueValues(wines, (wine) => wine.region);
  const storageLocations = uniqueValues(wines, (wine) => wine.storageLocation.displayName);

  const update = (patch: Partial<WineFilters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <section className="panel p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Filters</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-ink">Refine the cellar</h2>
        </div>
        <button
          className="ghost-button"
          type="button"
          onClick={() =>
            onFiltersChange({
              query: '',
              style: 'all',
              country: '',
              region: '',
              status: 'all',
              rating: '',
              vintage: '',
              drinkability: 'all',
              storage: '',
            })
          }
        >
          Clear filters
        </button>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <label className="flex-1">
          <span className="field-label">Search cellar</span>
          <input
            className="field mt-2"
            type="search"
            placeholder="Wine, producer, region, grape, notes..."
            value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
          />
        </label>
        <label className="lg:w-48">
          <span className="field-label">Sort</span>
          <select
            className="field mt-2"
            value={sort.key}
            onChange={(event) => onSortChange({ ...sort, key: event.target.value as WineSortKey })}
          >
            {sortKeys.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="lg:w-36">
          <span className="field-label">Direction</span>
          <select
            className="field mt-2"
            value={sort.direction}
            onChange={(event) => onSortChange({ ...sort, direction: event.target.value as SortConfig['direction'] })}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <label>
          <span className="field-label">Style</span>
          <select className="field mt-2" value={filters.style} onChange={(event) => update({ style: event.target.value as WineStyle | 'all' })}>
            {styles.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Country</span>
          <select className="field mt-2" value={filters.country} onChange={(event) => update({ country: event.target.value })}>
            <option value="">All countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Region</span>
          <select className="field mt-2" value={filters.region} onChange={(event) => update({ region: event.target.value })}>
            <option value="">All regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Status</span>
          <select className="field mt-2" value={filters.status} onChange={(event) => update({ status: event.target.value as WineStatus | 'all' })}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Drinkability</span>
          <select
            className="field mt-2"
            value={filters.drinkability}
            onChange={(event) => update({ drinkability: event.target.value as DrinkabilityStatus | 'all' })}
          >
            {drinkability.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Rating min</span>
          <input
            className="field mt-2"
            inputMode="numeric"
            placeholder="e.g. 94"
            value={filters.rating}
            onChange={(event) => update({ rating: event.target.value })}
          />
        </label>
        <label>
          <span className="field-label">Vintage</span>
          <input
            className="field mt-2"
            inputMode="numeric"
            placeholder="Any"
            value={filters.vintage}
            onChange={(event) => update({ vintage: event.target.value })}
          />
        </label>
        <label>
          <span className="field-label">Location</span>
          <select className="field mt-2" value={filters.storage} onChange={(event) => update({ storage: event.target.value })}>
            <option value="">All locations</option>
            {storageLocations.map((storage) => (
              <option key={storage} value={storage}>
                {storage}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
