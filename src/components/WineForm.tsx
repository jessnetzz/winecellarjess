import { FormEvent, useMemo, useState } from 'react';
import BottleImage from './BottleImage';
import { Wine, WineFormData, WineStatus, WineStyle } from '../types/wine';
import { createId } from '../utils/id';

interface WineFormProps {
  wine?: Wine;
  onCancel: () => void;
  onSave: (wine: Wine) => void;
}

const wineStyles: WineStyle[] = ['red', 'white', 'rose', 'sparkling', 'dessert', 'fortified', 'orange'];
const wineStatuses: WineStatus[] = ['unopened', 'opened', 'consumed'];

function defaultFormData(): WineFormData {
  const currentYear = new Date().getFullYear();
  return {
    name: '',
    producer: '',
    vintage: currentYear,
    appellation: '',
    region: '',
    country: '',
    varietal: '',
    style: 'red',
    bottleSize: '750 ml',
    quantity: 1,
    purchaseDate: new Date().toISOString().slice(0, 10),
    purchasePrice: 0,
    marketValue: 0,
    alcoholPercent: undefined,
    drinkWindowStart: currentYear,
    drinkWindowEnd: currentYear + 8,
    bestDrinkBy: currentYear + 6,
    storageLocation: { displayName: '' },
    acquisitionSource: '',
    status: 'unopened',
    tastingNotes: '',
    personalRating: undefined,
    foodPairingNotes: '',
    aiAdvice: '',
    imageUrl: '',
    tastingLog: [],
  };
}

function numberValue(value: number | undefined): string | number {
  return value ?? '';
}

type NumericFormKey =
  | 'vintage'
  | 'quantity'
  | 'purchasePrice'
  | 'marketValue'
  | 'alcoholPercent'
  | 'drinkWindowStart'
  | 'drinkWindowEnd'
  | 'bestDrinkBy'
  | 'personalRating';

export default function WineForm({ wine, onCancel, onSave }: WineFormProps) {
  const [form, setForm] = useState<WineFormData>(() => (wine ? { ...wine } : defaultFormData()));
  const [errors, setErrors] = useState<string[]>([]);
  const isEditing = Boolean(wine);

  const previewName = useMemo(() => form.name || 'New cellar bottle', [form.name]);

  const update = <K extends keyof WineFormData>(key: K, value: WineFormData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateNumber = (key: NumericFormKey, value: string) => {
    const parsed = Number(value);
    setForm((current) => ({ ...current, [key]: value === '' || Number.isNaN(parsed) ? undefined : parsed }) as WineFormData);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const validationErrors: string[] = [];
    if (!form.name.trim()) validationErrors.push('Wine name is required.');
    if (!form.producer.trim()) validationErrors.push('Producer is required.');
    if (!form.vintage || form.vintage < 1800) validationErrors.push('Vintage must be a valid year.');
    if (form.quantity === undefined || form.quantity < 0) validationErrors.push('Quantity must be zero or greater.');
    if (!form.drinkWindowStart || !form.drinkWindowEnd || !form.bestDrinkBy) validationErrors.push('Drink window years are required.');
    if (form.drinkWindowEnd < form.drinkWindowStart) validationErrors.push('Drink window end must be after the start year.');

    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    const timestamp = new Date().toISOString();
    const savedWine: Wine = {
      ...form,
      id: wine?.id ?? createId('wine'),
      name: form.name.trim(),
      producer: form.producer.trim(),
      appellation: form.appellation.trim(),
      region: form.region.trim(),
      country: form.country.trim(),
      varietal: form.varietal.trim(),
      quantity: Number(form.quantity),
      purchasePrice: Number(form.purchasePrice ?? 0),
      marketValue: Number(form.marketValue ?? 0),
      drinkWindowStart: Number(form.drinkWindowStart),
      drinkWindowEnd: Number(form.drinkWindowEnd),
      bestDrinkBy: Number(form.bestDrinkBy),
      tastingLog: form.tastingLog ?? [],
      storageLocation: {
        ...form.storageLocation,
        displayName:
          form.storageLocation.displayName.trim() ||
          [form.storageLocation.fridge, form.storageLocation.rack && `Rack ${form.storageLocation.rack}`, form.storageLocation.shelf && `Shelf ${form.storageLocation.shelf}`, form.storageLocation.bin && `Bin ${form.storageLocation.bin}`, form.storageLocation.box && `Box ${form.storageLocation.box}`]
            .filter(Boolean)
            .join(' / ') ||
          'Unassigned',
      },
      createdAt: wine?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    onSave(savedWine);
  };

  return (
    <form className="grid gap-6 p-5 lg:grid-cols-[260px_minmax(0,1fr)]" onSubmit={submit}>
      <div className="space-y-4">
        <BottleImage
          editable
          imageUrl={form.imageUrl}
          name={previewName}
          producer={form.producer}
          vintage={form.vintage}
          onImageChange={(imageUrl) => update('imageUrl', imageUrl)}
        />
        {errors.length ? (
          <div className="rounded-lg border border-clay/30 bg-clay/10 p-3 text-sm text-clay">
            <p className="font-bold">Please fix</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="space-y-8">
        <div className="rounded-lg border border-ink/10 bg-porcelain p-5">
          <p className="section-kicker">Basic info</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-ink">Bottle identity</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label>
              <span className="field-label">Wine name</span>
              <input className="field mt-2" required value={form.name} onChange={(event) => update('name', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Producer</span>
              <input className="field mt-2" required value={form.producer} onChange={(event) => update('producer', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Vintage</span>
              <input className="field mt-2" required type="number" value={numberValue(form.vintage)} onChange={(event) => updateNumber('vintage', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Appellation</span>
              <input className="field mt-2" value={form.appellation} onChange={(event) => update('appellation', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Region</span>
              <input className="field mt-2" value={form.region} onChange={(event) => update('region', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Country</span>
              <input className="field mt-2" value={form.country} onChange={(event) => update('country', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Grape / varietal</span>
              <input className="field mt-2" value={form.varietal} onChange={(event) => update('varietal', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Style</span>
              <select className="field mt-2" value={form.style} onChange={(event) => update('style', event.target.value as WineStyle)}>
                {wineStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Bottle size</span>
              <input className="field mt-2" value={form.bottleSize} onChange={(event) => update('bottleSize', event.target.value)} />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-porcelain p-5">
          <p className="section-kicker">Purchase</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-ink">Inventory and value</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label>
              <span className="field-label">Quantity</span>
              <input className="field mt-2" type="number" min="0" value={numberValue(form.quantity)} onChange={(event) => updateNumber('quantity', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Purchase date</span>
              <input className="field mt-2" type="date" value={form.purchaseDate} onChange={(event) => update('purchaseDate', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Purchase price</span>
              <input className="field mt-2" type="number" min="0" step="0.01" value={numberValue(form.purchasePrice)} onChange={(event) => updateNumber('purchasePrice', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Market value</span>
              <input className="field mt-2" type="number" min="0" step="0.01" value={numberValue(form.marketValue)} onChange={(event) => updateNumber('marketValue', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Alcohol %</span>
              <input className="field mt-2" type="number" min="0" step="0.1" value={numberValue(form.alcoholPercent)} onChange={(event) => updateNumber('alcoholPercent', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Status</span>
              <select className="field mt-2" value={form.status} onChange={(event) => update('status', event.target.value as WineStatus)}>
                {wineStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="md:col-span-2">
              <span className="field-label">Acquisition source</span>
              <input className="field mt-2" value={form.acquisitionSource} onChange={(event) => update('acquisitionSource', event.target.value)} />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-porcelain p-5">
          <p className="section-kicker">Aging</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-ink">Drink window</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label>
              <span className="field-label">Start year</span>
              <input className="field mt-2" type="number" value={numberValue(form.drinkWindowStart)} onChange={(event) => updateNumber('drinkWindowStart', event.target.value)} />
            </label>
            <label>
              <span className="field-label">End year</span>
              <input className="field mt-2" type="number" value={numberValue(form.drinkWindowEnd)} onChange={(event) => updateNumber('drinkWindowEnd', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Best drink by</span>
              <input className="field mt-2" type="number" value={numberValue(form.bestDrinkBy)} onChange={(event) => updateNumber('bestDrinkBy', event.target.value)} />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-porcelain p-5">
          <p className="section-kicker">Location</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-ink">Storage location</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(['rack', 'shelf', 'bin', 'box', 'fridge'] as const).map((key) => (
              <label key={key}>
                <span className="field-label">{key}</span>
                <input
                  className="field mt-2"
                  value={form.storageLocation[key] ?? ''}
                  onChange={(event) =>
                    update('storageLocation', {
                      ...form.storageLocation,
                      [key]: event.target.value,
                    })
                  }
                />
              </label>
            ))}
            <label className="md:col-span-3">
              <span className="field-label">Display label</span>
              <input
                className="field mt-2"
                placeholder="Rack A / Shelf 3 / Bin 07"
                value={form.storageLocation.displayName}
                onChange={(event) => update('storageLocation', { ...form.storageLocation, displayName: event.target.value })}
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-porcelain p-5">
          <p className="section-kicker">Journal</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-ink">Notes</h3>
          <div className="mt-4 grid gap-4">
            <label>
              <span className="field-label">Tasting notes</span>
              <textarea className="field mt-2 min-h-24" value={form.tastingNotes} onChange={(event) => update('tastingNotes', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Food pairing notes</span>
              <textarea className="field mt-2 min-h-20" value={form.foodPairingNotes} onChange={(event) => update('foodPairingNotes', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Personal rating</span>
              <div className="mt-2 flex max-w-md items-center gap-4 rounded-md border border-ink/15 bg-white px-3 py-2 shadow-sm">
                <input
                  className="accent-vine"
                  type="range"
                  min="50"
                  max="100"
                  value={form.personalRating ?? 90}
                  onChange={(event) => updateNumber('personalRating', event.target.value)}
                />
                <input
                  className="w-20 rounded-md border border-ink/15 px-2 py-1 text-sm font-bold text-ink"
                  type="number"
                  min="50"
                  max="100"
                  value={numberValue(form.personalRating)}
                  onChange={(event) => updateNumber('personalRating', event.target.value)}
                />
              </div>
            </label>
            <label>
              <span className="field-label">AI advice</span>
              <textarea className="field mt-2 min-h-20" value={form.aiAdvice} onChange={(event) => update('aiAdvice', event.target.value)} />
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:justify-end">
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="premium-button" type="submit">
            {isEditing ? 'Save changes' : 'Add wine'}
          </button>
        </div>
      </div>
    </form>
  );
}
