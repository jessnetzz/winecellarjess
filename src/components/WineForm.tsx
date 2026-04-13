import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import BottleImage from './BottleImage';
import { Wine, WineAutofillResult, WineFormData, WineStatus, WineStyle } from '../types/wine';
import { aiWineAutofillService } from '../services/aiWineAutofillService';
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

type SuggestedFormKey =
  | 'producer'
  | 'name'
  | 'vintage'
  | 'appellation'
  | 'region'
  | 'country'
  | 'varietal'
  | 'style'
  | 'drinkWindowStart'
  | 'drinkWindowEnd'
  | 'bestDrinkBy'
  | 'tastingNotes'
  | 'foodPairingNotes'
  | 'aiAdvice';

const autofillFieldLabels: Partial<Record<SuggestedFormKey, string>> = {
  producer: 'producer',
  name: 'wine name',
  vintage: 'vintage',
  appellation: 'appellation',
  region: 'region',
  country: 'country',
  varietal: 'varietal',
  style: 'style category',
  drinkWindowStart: 'drink window start year',
  drinkWindowEnd: 'drink window end year',
  bestDrinkBy: 'best drink by year',
  tastingNotes: 'tasting notes',
  foodPairingNotes: 'food pairing notes',
  aiAdvice: 'cellar note',
};

function hasValue(value: unknown) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function SuggestedMark({ show }: { show: boolean }) {
  if (!show) return null;
  return <span className="ai-suggested-mark" title="AI suggested">AI suggested</span>;
}

type FormSectionId = 'basic' | 'origin' | 'inventory' | 'window' | 'storage' | 'notes';

const formSections: Array<{ id: FormSectionId; label: string }> = [
  { id: 'basic', label: 'Basic' },
  { id: 'origin', label: 'Origin' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'window', label: 'Window' },
  { id: 'storage', label: 'Storage' },
  { id: 'notes', label: 'Notes' },
];

interface FormSectionProps {
  id: FormSectionId;
  activeSection: FormSectionId;
  kicker: string;
  title: string;
  description?: string;
  onActivate: (section: FormSectionId) => void;
  children: ReactNode;
}

function FormSection({
  id,
  activeSection,
  kicker,
  title,
  description,
  onActivate,
  children,
}: FormSectionProps) {
  const isActive = activeSection === id;

  return (
    <section className="mobile-form-section">
      <button
        className="form-section-toggle lg:hidden"
        type="button"
        onClick={() => onActivate(id)}
        aria-expanded={isActive}
      >
        <span>
          <span className="section-kicker">{kicker}</span>
          <span className="mt-1 block font-serif text-xl font-bold text-ink">{title}</span>
          {description ? <span className="mt-1 block text-sm font-medium leading-5 text-smoke">{description}</span> : null}
        </span>
        <span className="form-section-toggle-icon">{isActive ? 'Current' : 'Open'}</span>
      </button>
      <div className="hidden lg:block">
        <p className="section-kicker">{kicker}</p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-ink">{title}</h3>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-smoke">{description}</p> : null}
      </div>
      <div className={`${isActive ? 'block' : 'hidden'} mt-4 lg:block`}>{children}</div>
    </section>
  );
}

export default function WineForm({ wine, onCancel, onSave }: WineFormProps) {
  const [form, setForm] = useState<WineFormData>(() => (wine ? { ...wine } : defaultFormData()));
  const [errors, setErrors] = useState<string[]>([]);
  const [suggestedFields, setSuggestedFields] = useState<Set<SuggestedFormKey>>(new Set());
  const [autofillResult, setAutofillResult] = useState<WineAutofillResult | null>(null);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<FormSectionId>('basic');
  const isEditing = Boolean(wine);

  const previewName = useMemo(() => form.name || 'New cellar bottle', [form.name]);
  const canAutofill = Boolean(form.producer.trim() && form.name.trim() && form.vintage && form.vintage >= 1800);
  const defaultData = useMemo(() => defaultFormData(), []);

  const update = <K extends keyof WineFormData>(key: K, value: WineFormData[K]) => {
    if (suggestedFields.has(key as SuggestedFormKey)) {
      setSuggestedFields((current) => {
        const next = new Set(current);
        next.delete(key as SuggestedFormKey);
        return next;
      });
    }
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateNumber = (key: NumericFormKey, value: string) => {
    if (suggestedFields.has(key as SuggestedFormKey)) {
      setSuggestedFields((current) => {
        const next = new Set(current);
        next.delete(key as SuggestedFormKey);
        return next;
      });
    }
    const parsed = Number(value);
    setForm((current) => ({ ...current, [key]: value === '' || Number.isNaN(parsed) ? undefined : parsed }) as WineFormData);
  };

  const suggestedClass = (key: SuggestedFormKey) =>
    suggestedFields.has(key) ? 'border-lavender/70 bg-lavender/10 ring-1 ring-lavender/40 hover:border-plum/45 hover:bg-lavender/15' : '';

  const markSuggested = (keys: SuggestedFormKey[]) => {
    setSuggestedFields((current) => {
      const next = new Set(current);
      keys.forEach((key) => next.add(key));
      return next;
    });
  };

  const runAutofill = async () => {
    if (!canAutofill || isAutofilling) return;

    setAutofillError(null);
    setIsAutofilling(true);

    try {
      const result = await aiWineAutofillService.getWineAutofill({
        producer: form.producer,
        wineName: form.name,
        vintage: Number(form.vintage),
      });
      const shouldAssign = (key: keyof WineFormData, shouldReplace = false) => shouldReplace || !hasValue(form[key]);
      const nextSuggested: SuggestedFormKey[] = [
        result.producer.value && shouldAssign('producer') ? 'producer' : null,
        result.wineName.value && shouldAssign('name') ? 'name' : null,
        result.vintage.value && shouldAssign('vintage') ? 'vintage' : null,
        result.appellation.value && shouldAssign('appellation') ? 'appellation' : null,
        result.region.value && shouldAssign('region') ? 'region' : null,
        result.country.value && shouldAssign('country') ? 'country' : null,
        result.varietal.value && shouldAssign('varietal') ? 'varietal' : null,
        result.styleCategory.value && shouldAssign('style', !isEditing && form.style === defaultData.style) ? 'style' : null,
        result.drinkWindowStartYear.value && shouldAssign('drinkWindowStart', !isEditing && form.drinkWindowStart === defaultData.drinkWindowStart) ? 'drinkWindowStart' : null,
        result.drinkWindowEndYear.value && shouldAssign('drinkWindowEnd', !isEditing && form.drinkWindowEnd === defaultData.drinkWindowEnd) ? 'drinkWindowEnd' : null,
        result.bestDrinkByYear.value && shouldAssign('bestDrinkBy', !isEditing && form.bestDrinkBy === defaultData.bestDrinkBy) ? 'bestDrinkBy' : null,
        result.tastingNotes.value && shouldAssign('tastingNotes') ? 'tastingNotes' : null,
        result.foodPairingNotes.value && shouldAssign('foodPairingNotes') ? 'foodPairingNotes' : null,
        result.cellarNote.value && shouldAssign('aiAdvice') ? 'aiAdvice' : null,
      ].filter(Boolean) as SuggestedFormKey[];

      setAutofillResult(result);
      setForm((current) => {
        const next = { ...current };

        const assignText = (key: SuggestedFormKey, value: string | null, shouldReplace = false) => {
          if (!value) return;
          const currentValue = next[key as keyof WineFormData];
          if (shouldReplace || !hasValue(currentValue)) {
            (next as Record<string, unknown>)[key] = value;
          }
        };

        const assignNumber = (key: SuggestedFormKey, value: number | null, shouldReplace = false) => {
          if (!value) return;
          const currentValue = next[key as keyof WineFormData];
          if (shouldReplace || !hasValue(currentValue)) {
            (next as Record<string, unknown>)[key] = value;
          }
        };

        assignText('producer', result.producer.value);
        assignText('name', result.wineName.value);
        assignNumber('vintage', result.vintage.value);
        assignText('appellation', result.appellation.value);
        assignText('region', result.region.value);
        assignText('country', result.country.value);
        assignText('varietal', result.varietal.value);
        assignText('style', result.styleCategory.value, !isEditing && current.style === defaultData.style);
        assignNumber('drinkWindowStart', result.drinkWindowStartYear.value, !isEditing && current.drinkWindowStart === defaultData.drinkWindowStart);
        assignNumber('drinkWindowEnd', result.drinkWindowEndYear.value, !isEditing && current.drinkWindowEnd === defaultData.drinkWindowEnd);
        assignNumber('bestDrinkBy', result.bestDrinkByYear.value, !isEditing && current.bestDrinkBy === defaultData.bestDrinkBy);
        assignText('tastingNotes', result.tastingNotes.value);
        assignText('foodPairingNotes', result.foodPairingNotes.value);
        assignText('aiAdvice', result.cellarNote.value);

        return next;
      });

      markSuggested(nextSuggested);
    } catch (caught) {
      setAutofillError(caught instanceof Error ? caught.message : 'AI autofill could not finish. Your typed values are still safe.');
    } finally {
      setIsAutofilling(false);
    }
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
      if (validationErrors.some((error) => error.includes('Wine name') || error.includes('Producer') || error.includes('Vintage'))) {
        setActiveMobileSection('basic');
      } else if (validationErrors.some((error) => error.includes('Quantity'))) {
        setActiveMobileSection('inventory');
      } else {
        setActiveMobileSection('window');
      }
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
    <form className="grid gap-5 p-4 pb-0 sm:p-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:pb-5" onSubmit={submit}>
      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
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

      <div className="space-y-5 lg:space-y-7">
        <div className="lg:hidden">
          <p className="section-kicker">Add bottle</p>
          <h3 className="mt-1 font-serif text-2xl font-bold text-ink">{isEditing ? 'Edit cellar record' : 'Start with the label'}</h3>
          <p className="mt-2 text-sm leading-6 text-smoke">
            Producer, wine name, and vintage unlock the AI sommelier. Everything stays editable before saving.
          </p>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {formSections.map((section) => (
              <button
                key={section.id}
                className={`form-step-chip ${activeMobileSection === section.id ? 'form-step-chip-active' : ''}`}
                type="button"
                onClick={() => setActiveMobileSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <FormSection
          id="basic"
          activeSection={activeMobileSection}
          kicker="Basic info"
          title="Bottle identity"
          description="Enter producer, wine name, and vintage, then ask the sommelier to suggest likely details."
          onActivate={setActiveMobileSection}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <label className="sm:col-span-2 xl:col-span-1">
              <span className="field-label">Producer<SuggestedMark show={suggestedFields.has('producer')} /></span>
              <input className={`field mt-2 ${suggestedClass('producer')}`} required value={form.producer} onChange={(event) => update('producer', event.target.value)} />
            </label>
            <label className="sm:col-span-2 xl:col-span-1">
              <span className="field-label">Wine name<SuggestedMark show={suggestedFields.has('name')} /></span>
              <input className={`field mt-2 ${suggestedClass('name')}`} required value={form.name} onChange={(event) => update('name', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Vintage<SuggestedMark show={suggestedFields.has('vintage')} /></span>
              <input className={`field mt-2 ${suggestedClass('vintage')}`} required type="number" inputMode="numeric" value={numberValue(form.vintage)} onChange={(event) => updateNumber('vintage', event.target.value)} />
            </label>
            <div className="sm:col-span-2 xl:col-span-3">
              <div className="ai-autofill-card ai-surface rounded-lg border border-lavender/30 bg-lavender/10 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-ink">AI Sommelier Autofill</p>
                    <p className="mt-1 text-sm leading-6 text-smoke">
                      Suggested details fill only safe fields. Review every note and year before saving.
                    </p>
                  </div>
                  <button
                    className="premium-button min-h-12 w-full shrink-0 md:w-auto"
                    type="button"
                    onClick={() => void runAutofill()}
                    disabled={!canAutofill || isAutofilling}
                  >
                    {isAutofilling ? 'Generating details...' : 'Autofill with AI'}
                  </button>
                </div>
                {!canAutofill ? (
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-plum/80">
                    Add producer, wine name, and a valid vintage to enable autofill.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          {autofillError ? (
            <div className="mt-4 rounded-lg border border-clay/30 bg-clay/10 p-3 text-sm leading-6 text-clay">
              {autofillError}
            </div>
          ) : null}
          {autofillResult ? (
            <div className="ai-surface mt-4 rounded-lg border border-lavender/30 bg-lavender/10 p-4 text-sm leading-6 text-smoke">
              <p className="font-bold text-ink">AI suggested details — review before saving</p>
              <p className="mt-1">
                Confidence {Math.round(autofillResult.confidence * 100)}%. {autofillResult.knownVsInferredSummary}
              </p>
              {autofillResult.uncertainFields.length ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-plum">
                  Inferred fields: {autofillResult.uncertainFields.map((fieldName) => autofillFieldLabels[fieldName as SuggestedFormKey] ?? fieldName).join(', ')}
                </p>
              ) : null}
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
                {[
                  ['Color', autofillResult.color.value],
                  ['Body', autofillResult.body.value],
                  ['Acidity', autofillResult.acidity.value],
                  ['Tannin', autofillResult.tannin.value],
                ].map(([label, value]) => (
                  <div key={label} className="interactive-surface rounded-md border border-lavender/20 bg-white/60 px-3 py-2 hover:border-lavender/40 hover:bg-white hover:shadow-sm">
                    <span className="block font-bold uppercase tracking-wide text-plum">{label}</span>
                    <span className="mt-1 block text-sm text-ink">{value || 'Unknown'}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {isAutofilling ? (
            <div className="mt-4 space-y-2">
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ) : null}
        </FormSection>

        <FormSection
          id="origin"
          activeSection={activeMobileSection}
          kicker="Origin"
          title="Where it comes from"
          description="Capture appellation, region, grape, style, and bottle format."
          onActivate={setActiveMobileSection}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <label>
              <span className="field-label">Appellation<SuggestedMark show={suggestedFields.has('appellation')} /></span>
              <input className={`field mt-2 ${suggestedClass('appellation')}`} value={form.appellation} onChange={(event) => update('appellation', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Region<SuggestedMark show={suggestedFields.has('region')} /></span>
              <input className={`field mt-2 ${suggestedClass('region')}`} value={form.region} onChange={(event) => update('region', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Country<SuggestedMark show={suggestedFields.has('country')} /></span>
              <input className={`field mt-2 ${suggestedClass('country')}`} value={form.country} onChange={(event) => update('country', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Grape / varietal<SuggestedMark show={suggestedFields.has('varietal')} /></span>
              <input className={`field mt-2 ${suggestedClass('varietal')}`} value={form.varietal} onChange={(event) => update('varietal', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Style<SuggestedMark show={suggestedFields.has('style')} /></span>
              <select className={`field mt-2 ${suggestedClass('style')}`} value={form.style} onChange={(event) => update('style', event.target.value as WineStyle)}>
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
        </FormSection>

        <FormSection
          id="inventory"
          activeSection={activeMobileSection}
          kicker="Inventory"
          title="Inventory and value"
          description="Track bottle count, purchase context, status, and current value."
          onActivate={setActiveMobileSection}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        </FormSection>

        <FormSection
          id="window"
          activeSection={activeMobileSection}
          kicker="Aging"
          title="Drink window"
          description="Set the years that drive cellar priorities and drinkability badges."
          onActivate={setActiveMobileSection}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              <span className="field-label">Start year<SuggestedMark show={suggestedFields.has('drinkWindowStart')} /></span>
              <input className={`field mt-2 ${suggestedClass('drinkWindowStart')}`} type="number" value={numberValue(form.drinkWindowStart)} onChange={(event) => updateNumber('drinkWindowStart', event.target.value)} />
            </label>
            <label>
              <span className="field-label">End year<SuggestedMark show={suggestedFields.has('drinkWindowEnd')} /></span>
              <input className={`field mt-2 ${suggestedClass('drinkWindowEnd')}`} type="number" value={numberValue(form.drinkWindowEnd)} onChange={(event) => updateNumber('drinkWindowEnd', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Best drink by<SuggestedMark show={suggestedFields.has('bestDrinkBy')} /></span>
              <input className={`field mt-2 ${suggestedClass('bestDrinkBy')}`} type="number" value={numberValue(form.bestDrinkBy)} onChange={(event) => updateNumber('bestDrinkBy', event.target.value)} />
            </label>
          </div>
        </FormSection>

        <FormSection
          id="storage"
          activeSection={activeMobileSection}
          kicker="Location"
          title="Storage location"
          description="Make the physical bottle easy to find later."
          onActivate={setActiveMobileSection}
        >
          <div className="grid gap-4 sm:grid-cols-3">
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
        </FormSection>

        <FormSection
          id="notes"
          activeSection={activeMobileSection}
          kicker="Journal"
          title="Notes and pairing"
          description="Finish with tasting notes, pairings, rating, and AI cellar context."
          onActivate={setActiveMobileSection}
        >
          <div className="grid gap-4">
            <label>
              <span className="field-label">Tasting notes<SuggestedMark show={suggestedFields.has('tastingNotes')} /></span>
              <textarea className={`field mt-2 min-h-24 ${suggestedClass('tastingNotes')}`} value={form.tastingNotes} onChange={(event) => update('tastingNotes', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Food pairing notes<SuggestedMark show={suggestedFields.has('foodPairingNotes')} /></span>
              <textarea className={`field mt-2 min-h-20 ${suggestedClass('foodPairingNotes')}`} value={form.foodPairingNotes} onChange={(event) => update('foodPairingNotes', event.target.value)} />
            </label>
            <label>
              <span className="field-label">Personal rating</span>
              <div className="mt-2 flex max-w-md items-center gap-4 rounded-md border border-ink/15 bg-white px-3 py-3 shadow-sm sm:py-2">
                <input
                  className="min-h-10 flex-1 accent-vine"
                  type="range"
                  min="50"
                  max="100"
                  value={form.personalRating ?? 90}
                  onChange={(event) => updateNumber('personalRating', event.target.value)}
                />
                <input
                  className="min-h-10 w-20 rounded-md border border-ink/15 px-2 py-1 text-base font-bold text-ink sm:text-sm"
                  type="number"
                  min="50"
                  max="100"
                  value={numberValue(form.personalRating)}
                  onChange={(event) => updateNumber('personalRating', event.target.value)}
                />
              </div>
            </label>
            <label>
              <span className="field-label">AI advice<SuggestedMark show={suggestedFields.has('aiAdvice')} /></span>
              <textarea className={`field mt-2 min-h-20 ${suggestedClass('aiAdvice')}`} value={form.aiAdvice} onChange={(event) => update('aiAdvice', event.target.value)} />
            </label>
          </div>
        </FormSection>

        <div className="sticky bottom-0 z-20 -mx-4 flex flex-col-reverse gap-3 border-t border-ink/10 bg-porcelain/95 p-4 shadow-[0_-16px_38px_rgba(42,31,33,0.09)] backdrop-blur sm:mx-0 sm:flex-row sm:justify-end sm:rounded-lg sm:border sm:border-ink/10 lg:static lg:rounded-none lg:border-x-0 lg:border-b-0 lg:bg-transparent lg:px-0 lg:shadow-none lg:backdrop-blur-0">
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
