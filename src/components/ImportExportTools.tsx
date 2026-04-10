import { ChangeEvent, useRef, useState } from 'react';
import { downloadCSV, exportWinesToCSV, importWinesFromCSV } from '../utils/csv';
import { Wine } from '../types/wine';

interface ImportExportToolsProps {
  wines: Wine[];
  onImport: (wines: Wine[]) => void | Promise<unknown>;
  onResetDemoData: () => void | Promise<unknown>;
  isBusy?: boolean;
}

export default function ImportExportTools({ wines, onImport, onResetDemoData, isBusy = false }: ImportExportToolsProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const exportCsv = () => {
    downloadCSV(`wine-cellar-${new Date().toISOString().slice(0, 10)}.csv`, exportWinesToCSV(wines));
  };

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const result = importWinesFromCSV(text);
    setErrors(result.errors);

    if (result.wines.length) {
      await onImport(result.wines);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="section-kicker">Import / export</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-ink">Portable cellar data</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-smoke">
            Import expects a header row. Recommended columns: name, producer, vintage, region, country, varietal, style,
            quantity, drinkWindowStart, drinkWindowEnd, bestDrinkBy, storageLocation, personalRating.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="secondary-button" type="button" onClick={exportCsv} disabled={isBusy}>
            Export CSV
          </button>
          <label className={`secondary-button cursor-pointer ${isBusy ? 'pointer-events-none opacity-50' : ''}`}>
            Import CSV
            <input ref={inputRef} className="sr-only" type="file" accept=".csv,text/csv" onChange={importCsv} />
          </label>
          <button className="ghost-button" type="button" onClick={() => void onResetDemoData()} disabled={isBusy}>
            Reset demo data
          </button>
        </div>
      </div>
      {errors.length ? (
        <div className="mt-4 rounded-lg border border-clay/30 bg-clay/10 p-4 text-sm text-clay">
          <p className="font-bold">Import notes</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.slice(0, 6).map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
