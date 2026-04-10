import { Wine } from '../types/wine';
import { createId } from './id';

const csvHeaders = [
  'name',
  'producer',
  'vintage',
  'appellation',
  'region',
  'country',
  'varietal',
  'style',
  'bottleSize',
  'quantity',
  'purchaseDate',
  'purchasePrice',
  'marketValue',
  'alcoholPercent',
  'drinkWindowStart',
  'drinkWindowEnd',
  'bestDrinkBy',
  'storageLocation',
  'acquisitionSource',
  'status',
  'tastingNotes',
  'personalRating',
  'foodPairingNotes',
  'aiAdvice',
  'imageUrl',
] as const;

type CsvHeader = (typeof csvHeaders)[number];

export interface CSVImportResult {
  wines: Wine[];
  errors: string[];
}

function escapeCsv(value: unknown): string {
  const text = value === undefined || value === null ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function exportWinesToCSV(wines: Wine[]): string {
  const rows = wines.map((wine) => {
    const row: Record<CsvHeader, unknown> = {
      name: wine.name,
      producer: wine.producer,
      vintage: wine.vintage,
      appellation: wine.appellation,
      region: wine.region,
      country: wine.country,
      varietal: wine.varietal,
      style: wine.style,
      bottleSize: wine.bottleSize,
      quantity: wine.quantity,
      purchaseDate: wine.purchaseDate,
      purchasePrice: wine.purchasePrice,
      marketValue: wine.marketValue,
      alcoholPercent: wine.alcoholPercent,
      drinkWindowStart: wine.drinkWindowStart,
      drinkWindowEnd: wine.drinkWindowEnd,
      bestDrinkBy: wine.bestDrinkBy,
      storageLocation: wine.storageLocation.displayName,
      acquisitionSource: wine.acquisitionSource,
      status: wine.status,
      tastingNotes: wine.tastingNotes,
      personalRating: wine.personalRating,
      foodPairingNotes: wine.foodPairingNotes,
      aiAdvice: wine.aiAdvice,
      imageUrl: wine.imageUrl,
    };

    return csvHeaders.map((header) => escapeCsv(row[header])).join(',');
  });

  return [csvHeaders.join(','), ...rows].join('\n');
}

export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && next === '"' && inQuotes) {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(cell.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
}

function toNumber(value: string | undefined, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function importWinesFromCSV(text: string): CSVImportResult {
  const rows = parseCsv(text);
  const errors: string[] = [];
  const now = new Date().toISOString();

  if (rows.length < 2) {
    return { wines: [], errors: ['CSV must include a header row and at least one wine row.'] };
  }

  const headers = rows[0].map((header) => header.trim());
  const getValue = (row: string[], header: string) => {
    const index = headers.indexOf(header);
    return index >= 0 ? row[index] ?? '' : '';
  };

  const wines = rows.slice(1).flatMap((row, index) => {
    const rowNumber = index + 2;
    const name = getValue(row, 'name');
    const producer = getValue(row, 'producer');
    const vintage = toNumber(getValue(row, 'vintage'));
    const quantity = Math.max(0, toNumber(getValue(row, 'quantity'), 1));

    if (!name || !producer || !vintage) {
      errors.push(`Row ${rowNumber}: name, producer, and vintage are required.`);
      return [];
    }

    const drinkWindowStart = toNumber(getValue(row, 'drinkWindowStart'), new Date().getFullYear());
    const drinkWindowEnd = toNumber(getValue(row, 'drinkWindowEnd'), drinkWindowStart + 8);
    const storageLocation = getValue(row, 'storageLocation') || 'Unassigned';

    const wine: Wine = {
      id: createId('wine'),
      name,
      producer,
      vintage,
      appellation: getValue(row, 'appellation'),
      region: getValue(row, 'region'),
      country: getValue(row, 'country'),
      varietal: getValue(row, 'varietal'),
      style: (getValue(row, 'style') as Wine['style']) || 'red',
      bottleSize: getValue(row, 'bottleSize') || '750 ml',
      quantity,
      purchaseDate: getValue(row, 'purchaseDate'),
      purchasePrice: toNumber(getValue(row, 'purchasePrice')),
      marketValue: toNumber(getValue(row, 'marketValue')),
      alcoholPercent: toNumber(getValue(row, 'alcoholPercent')) || undefined,
      drinkWindowStart,
      drinkWindowEnd,
      bestDrinkBy: toNumber(getValue(row, 'bestDrinkBy'), drinkWindowEnd),
      storageLocation: { displayName: storageLocation },
      acquisitionSource: getValue(row, 'acquisitionSource'),
      status: (getValue(row, 'status') as Wine['status']) || 'unopened',
      tastingNotes: getValue(row, 'tastingNotes'),
      personalRating: toNumber(getValue(row, 'personalRating')) || undefined,
      foodPairingNotes: getValue(row, 'foodPairingNotes'),
      aiAdvice: getValue(row, 'aiAdvice'),
      imageUrl: getValue(row, 'imageUrl'),
      tastingLog: [],
      createdAt: now,
      updatedAt: now,
    };

    return [wine];
  });

  return { wines, errors };
}
