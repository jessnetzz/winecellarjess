import { Wine } from '../types/wine';
import Icon from './Icon';

interface StorageLocationViewProps {
  wines: Wine[];
  onSelectWine: (wine: Wine) => void;
}

type StorageTone = {
  zoneLabel: string;
  card: string;
  iconWrap: string;
  icon: string;
  count: string;
  chip: string;
  chipValue: string;
  bottle: string;
  bottleTitle: string;
};

const storageTones: Record<string, StorageTone> = {
  rack: {
    zoneLabel: 'Wooden rack',
    card: 'border-[#D8C2A5] bg-[linear-gradient(135deg,rgba(255,248,240,0.96),rgba(247,235,220,0.9))] hover:border-[#C9A878]',
    iconWrap: 'bg-[#F5E6D4] group-hover:bg-[#ECD6BC]',
    icon: 'text-[#94613C]',
    count: 'bg-white/80 text-[#7C5A39]',
    chip: 'border-[#E7D5C3] bg-white/80 hover:border-[#D8C2A5] hover:bg-[#FBF1E6]',
    chipValue: 'text-[#94613C]',
    bottle: 'bg-white/88 hover:bg-[#FBF1E6]',
    bottleTitle: 'text-[#7D4A39]',
  },
  fridge: {
    zoneLabel: 'Fridge',
    card: 'border-[#C6D9E4] bg-[linear-gradient(135deg,rgba(247,251,255,0.96),rgba(228,239,246,0.92))] hover:border-[#97B6C8]',
    iconWrap: 'bg-[#E4EEF5] group-hover:bg-[#D3E4EE]',
    icon: 'text-[#567B92]',
    count: 'bg-white/80 text-[#4B6E84]',
    chip: 'border-[#D7E5EE] bg-white/82 hover:border-[#B8D0DE] hover:bg-[#F0F6FA]',
    chipValue: 'text-[#567B92]',
    bottle: 'bg-white/88 hover:bg-[#F0F6FA]',
    bottleTitle: 'text-[#47657B]',
  },
  bin: {
    zoneLabel: 'Bins & boxes',
    card: 'border-[#D9CFBF] bg-[linear-gradient(135deg,rgba(252,247,240,0.96),rgba(239,232,220,0.92))] hover:border-[#BFAA88]',
    iconWrap: 'bg-[#EEE5D7] group-hover:bg-[#E1D5C3]',
    icon: 'text-[#7E6A4C]',
    count: 'bg-white/80 text-[#6E5C43]',
    chip: 'border-[#E1D8CB] bg-white/82 hover:border-[#CDBEA8] hover:bg-[#F7F0E6]',
    chipValue: 'text-[#7E6A4C]',
    bottle: 'bg-white/88 hover:bg-[#F7F0E6]',
    bottleTitle: 'text-[#6E5C43]',
  },
  shelf: {
    zoneLabel: 'Display shelf',
    card: 'border-[#D8CEE6] bg-[linear-gradient(135deg,rgba(251,248,255,0.96),rgba(239,231,248,0.92))] hover:border-[#B9A4D3]',
    iconWrap: 'bg-[#EEE7F6] group-hover:bg-[#E4D9F0]',
    icon: 'text-[#7A5A96]',
    count: 'bg-white/80 text-[#6B5186]',
    chip: 'border-[#E1D8EC] bg-white/82 hover:border-[#CBB9E0] hover:bg-[#F5EFFB]',
    chipValue: 'text-[#7A5A96]',
    bottle: 'bg-white/88 hover:bg-[#F5EFFB]',
    bottleTitle: 'text-[#6B5186]',
  },
  unassigned: {
    zoneLabel: 'Unassigned',
    card: 'border-ink/10 bg-porcelain hover:border-gold/35',
    iconWrap: 'bg-vine/10 group-hover:bg-vine/15',
    icon: 'text-vine',
    count: 'bg-white text-smoke',
    chip: 'border-ink/10 bg-white hover:border-plum/25 hover:bg-paper',
    chipValue: 'text-vine',
    bottle: 'bg-white hover:bg-linen',
    bottleTitle: 'text-vine',
  },
};

function getStorageTone(location: string, wines: Wine[]): StorageTone {
  const combined = [
    location,
    ...wines.flatMap((wine) => [
      wine.storageLocation.displayName,
      wine.storageLocation.fridge,
      wine.storageLocation.rack,
      wine.storageLocation.shelf,
      wine.storageLocation.bin,
      wine.storageLocation.box,
    ]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (combined.includes('fridge') || combined.includes('eurocave')) return storageTones.fridge;
  if (combined.includes('rack') || combined.includes('wood')) return storageTones.rack;
  if (combined.includes('bin') || combined.includes('box') || combined.includes('case')) return storageTones.bin;
  if (combined.includes('shelf') || combined.includes('display') || combined.includes('counter')) return storageTones.shelf;
  return storageTones.unassigned;
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
          .map(([location, locationWines]) => {
            const tone = getStorageTone(location, locationWines);

            return (
            <div key={location} className={`storage-card group ${tone.card}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`interactive-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone.iconWrap} ${tone.icon}`}>
                    <Icon name="cellar" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-smoke/70">{tone.zoneLabel}</p>
                    <h3 className="truncate font-bold text-ink">{location}</h3>
                  </div>
                </div>
                <span className={`rounded-md px-3 py-1 text-xs font-bold shadow-sm ${tone.count}`}>
                  {locationWines.reduce((sum, wine) => sum + wine.quantity, 0)} bottles
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {['Rack', 'Shelf', 'Bin'].map((label) => (
                  <div key={label} className={`storage-chip ${tone.chip}`}>
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-smoke">{label}</span>
                    <span className={`mt-1 block truncate text-xs font-bold ${tone.chipValue}`}>
                      {location.includes(label) ? location : '-'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {locationWines.map((wine) => (
                  <button
                    key={wine.id}
                    className={`storage-bottle-button ${tone.bottle}`}
                    type="button"
                    onClick={() => onSelectWine(wine)}
                  >
                    <span className={`font-bold ${tone.bottleTitle}`}>{wine.vintage} {wine.name}</span>
                    <span className="block text-smoke">{wine.producer} - qty {wine.quantity}</span>
                  </button>
                ))}
              </div>
            </div>
          )})}
      </div>
    </section>
  );
}
