export type WineStyle =
  | 'red'
  | 'white'
  | 'rose'
  | 'sparkling'
  | 'dessert'
  | 'fortified'
  | 'orange';

export type WineStatus = 'unopened' | 'opened' | 'consumed';

export type DrinkabilityStatus =
  | 'Too young'
  | 'Approaching window'
  | 'Ready to drink'
  | 'Peak window'
  | 'Nearing end of peak'
  | 'Past peak';

export interface TastingLogEntry {
  id: string;
  tastingDate: string;
  notes: string;
  rating?: number;
  decanted: boolean;
  pairings?: string;
  occasion?: string;
}

export interface StorageLocation {
  id?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  box?: string;
  fridge?: string;
  notes?: string;
  displayName: string;
}

export interface Wine {
  id: string;
  name: string;
  producer: string;
  vintage: number;
  appellation: string;
  region: string;
  country: string;
  varietal: string;
  style: WineStyle;
  bottleSize: string;
  quantity: number;
  purchaseDate: string;
  purchasePrice: number;
  marketValue: number;
  alcoholPercent?: number;
  drinkWindowStart: number;
  drinkWindowEnd: number;
  bestDrinkBy: number;
  storageLocation: StorageLocation;
  acquisitionSource: string;
  status: WineStatus;
  tastingNotes: string;
  personalRating?: number;
  foodPairingNotes: string;
  aiAdvice: string;
  imageUrl?: string;
  tastingLog: TastingLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface WineFormData extends Omit<Wine, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export interface WineFilters {
  query: string;
  style: WineStyle | 'all';
  country: string;
  region: string;
  status: WineStatus | 'all';
  rating: string;
  vintage: string;
  drinkability: DrinkabilityStatus | 'all';
  storage: string;
}

export type WineSortKey =
  | 'vintage'
  | 'producer'
  | 'quantity'
  | 'purchasePrice'
  | 'bestDrinkBy'
  | 'personalRating'
  | 'name';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: WineSortKey;
  direction: SortDirection;
}

export interface AIAdviceResult {
  suggestedDrinkWindowStart: number;
  suggestedDrinkWindowEnd: number;
  recommendedBestDrinkYear: number;
  agingPotential: string;
  tastingExpectations: string;
  foodPairingIdeas: string;
  cellarNotesSummary: string;
  conciseGuidance: string;
}

export type WineAutofillField<T> = {
  value: T | null;
  source: 'known' | 'inferred' | 'unknown';
  note?: string;
};

export interface WineAutofillInput {
  producer: string;
  wineName: string;
  vintage: number;
}

export interface WineAutofillResult {
  producer: WineAutofillField<string>;
  wineName: WineAutofillField<string>;
  vintage: WineAutofillField<number>;
  appellation: WineAutofillField<string>;
  region: WineAutofillField<string>;
  country: WineAutofillField<string>;
  varietal: WineAutofillField<string>;
  styleCategory: WineAutofillField<WineStyle>;
  color: WineAutofillField<string>;
  body: WineAutofillField<string>;
  acidity: WineAutofillField<string>;
  tannin: WineAutofillField<string>;
  drinkWindowStartYear: WineAutofillField<number>;
  drinkWindowEndYear: WineAutofillField<number>;
  bestDrinkByYear: WineAutofillField<number>;
  estimatedPeakYear: WineAutofillField<number>;
  tastingNotes: WineAutofillField<string>;
  foodPairingNotes: WineAutofillField<string>;
  cellarNote: WineAutofillField<string>;
  confidence: number;
  uncertainFields: string[];
  knownVsInferredSummary: string;
}

export interface NaturalLanguageSearchMatch {
  id: string;
  score: number;
  semanticScore: number;
  keywordScore: number;
  readinessBoost: number;
  qualityBoost: number;
  reason: string;
}

export interface NaturalLanguageSearchResult {
  query: string;
  matches: NaturalLanguageSearchMatch[];
}
