import DrinkStatusBadge from './DrinkStatusBadge';
import { NaturalLanguageSearchMatch, SortConfig, Wine, WineSortKey } from '../types/wine';
import { formatCurrency, formatRating } from '../utils/formatters';

interface CollectionTableProps {
  wines: Wine[];
  sort: SortConfig;
  searchMatches?: Map<string, NaturalLanguageSearchMatch>;
  featuredWineId?: string;
  onSortChange: (sort: SortConfig) => void;
  onSelectWine: (wine: Wine) => void;
  onEditWine: (wine: Wine) => void;
}

const columns: Array<{ label: string; key?: WineSortKey }> = [
  { label: 'Wine', key: 'name' },
  { label: 'Producer', key: 'producer' },
  { label: 'Vintage', key: 'vintage' },
  { label: 'Status' },
  { label: 'Qty', key: 'quantity' },
  { label: 'Location' },
  { label: 'Best by', key: 'bestDrinkBy' },
  { label: 'Price', key: 'purchasePrice' },
  { label: 'Rating', key: 'personalRating' },
  { label: 'Actions' },
];

function getMatchLabel(match: NaturalLanguageSearchMatch) {
  if (match.keywordScore > 0.08 && match.semanticScore > 0.58) return 'Exact + AI match';
  if (match.keywordScore > 0.08) return 'Exact match';
  if (match.readinessBoost > 0) return 'Drink-window match';
  return 'AI meaning match';
}

export default function CollectionTable({
  wines,
  sort,
  searchMatches,
  featuredWineId,
  onSortChange,
  onSelectWine,
  onEditWine,
}: CollectionTableProps) {
  const toggleSort = (key: WineSortKey) => {
    onSortChange({
      key,
      direction: sort.key === key && sort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  if (!wines.length) {
    return (
      <div className="panel p-10 text-center">
        <p className="section-kicker">No rows</p>
        <h3 className="mt-3 font-serif text-3xl font-bold text-ink">No wines match this view</h3>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="max-h-[720px] overflow-auto">
        <table className="min-w-[1120px] w-full border-separate border-spacing-0">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.label} className="table-th">
                  {column.key ? (
                    <button className="flex items-center gap-1 text-left transition hover:text-vine" type="button" onClick={() => toggleSort(column.key!)}>
                      {column.label}
                      <span className="text-[10px]" aria-hidden="true">{sort.key === column.key ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {wines.map((wine) => {
              const match = searchMatches?.get(wine.id);
              const isFeatured = Boolean(match && featuredWineId === wine.id);

              return (
                <tr key={wine.id} className="table-row-hover">
                  <td className="table-td">
                    <button className="text-left" type="button" onClick={() => onSelectWine(wine)}>
                      {isFeatured ? (
                        <span className="mb-2 inline-flex rounded-md bg-gold/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#7B5A22]">
                          Best match
                        </span>
                      ) : null}
                      <span className="block font-serif text-lg font-bold text-vine transition duration-300 ease-out hover:text-pinot">{wine.name}</span>
                      <span className="mt-1 block text-xs uppercase text-smoke">{wine.appellation}</span>
                      {match ? (
                        <span className="mt-3 block max-w-sm rounded-lg border border-lavender/25 bg-lavender/10 px-3 py-2 text-xs leading-5 text-ink">
                          <span className="block font-bold uppercase tracking-wide text-plum">{getMatchLabel(match)}</span>
                          {match.reason}
                        </span>
                      ) : null}
                    </button>
                  </td>
                  <td className="table-td font-semibold text-ink">{wine.producer}</td>
                  <td className="table-td">{wine.vintage}</td>
                  <td className="table-td">
                    <DrinkStatusBadge wine={wine} compact />
                    <div className="mt-2 text-xs text-smoke">{wine.status}</div>
                  </td>
                  <td className="table-td font-bold">{wine.quantity}</td>
                  <td className="table-td max-w-48 text-smoke">{wine.storageLocation.displayName}</td>
                  <td className="table-td">{wine.bestDrinkBy}</td>
                  <td className="table-td">{formatCurrency(wine.purchasePrice)}</td>
                  <td className="table-td">{formatRating(wine.personalRating)}</td>
                  <td className="table-td">
                    <button className="ghost-button" type="button" onClick={() => onEditWine(wine)}>
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
