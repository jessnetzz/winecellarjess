import { useMemo, useState } from 'react';
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

function blankFilters(): WineFilters {
  return {
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
}

export default function FiltersPanel({ filters, sort, wines, onFiltersChange, onSortChange }: FiltersPanelProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const countries = uniqueValues(wines, (wine) => wine.country);
  const regions = uniqueValues(wines, (wine) => wine.region);
  const storageLocations = uniqueValues(wines, (wine) => wine.storageLocation.displayName);

  const update = (patch: Partial<WineFilters>) => onFiltersChange({ ...filters, ...patch });
  const clearFilters = () => onFiltersChange(blankFilters());
  const activeFilterCount = useMemo(
    () =>
      [
        filters.query.trim(),
        filters.style !== 'all',
        filters.country,
        filters.region,
        filters.status !== 'all',
        filters.rating,
        filters.vintage,
        filters.drinkability !== 'all',
        filters.storage,
      ].filter(Boolean).length,
    [filters],
  );

  const quickDrinkOptions: Array<{ label: string; value: WineFilters['drinkability'] }> = [
    { label: 'All', value: 'all' },
    { label: 'Ready', value: 'Ready to drink' },
    { label: 'Peak', value: 'Peak window' },
    { label: 'Drink soon', value: 'Nearing end of peak' },
  ];

  const FilterFields = ({ compact = false }: { compact?: boolean }) => (
    <>
      <div className={compact ? 'grid gap-4' : 'flex flex-col gap-4 lg:flex-row'}>
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
        <label className={compact ? '' : 'lg:w-48'}>
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
        <label className={compact ? '' : 'lg:w-36'}>
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

      <div className={compact ? 'mt-5 grid gap-4' : 'mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8'}>
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
    </>
  );

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
          onClick={clearFilters}
        >
          Clear filters
        </button>
      </div>

      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickDrinkOptions.map((option) => (
            <button
              key={option.value}
              className={`filter-chip ${filters.drinkability === option.value ? 'filter-chip-active' : ''}`}
              type="button"
              onClick={() => update({ drinkability: option.value })}
            >
              {option.label}
            </button>
          ))}
          <button className={`filter-chip ${filters.style === 'red' ? 'filter-chip-active' : ''}`} type="button" onClick={() => update({ style: filters.style === 'red' ? 'all' : 'red' })}>
            Reds
          </button>
          <button className={`filter-chip ${filters.style === 'white' ? 'filter-chip-active' : ''}`} type="button" onClick={() => update({ style: filters.style === 'white' ? 'all' : 'white' })}>
            Whites
          </button>
        </div>
        <button className="secondary-button mt-2 w-full justify-between" type="button" onClick={() => setIsMobileFiltersOpen(true)}>
          Advanced filters
          <span className="rounded-md bg-plum/10 px-2 py-0.5 text-xs text-plum">{activeFilterCount}</span>
        </button>
      </div>

      <div className="hidden lg:block">
        <FilterFields />
      </div>

      {isMobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 bg-ink/55 p-3 backdrop-blur-sm lg:hidden" role="dialog" aria-modal="true" aria-label="Advanced filters">
          <div className="ml-auto flex max-h-[calc(100vh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-lg border border-[#E7DCCB] bg-porcelain shadow-cellar">
            <div className="flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-4">
              <div>
                <p className="section-kicker">Advanced filters</p>
                <h3 className="mt-1 font-serif text-2xl font-bold text-ink">Refine the cellar</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setIsMobileFiltersOpen(false)}>
                Done
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <FilterFields compact />
              <button className="secondary-button mt-5 w-full" type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
