export interface WineAutofillRequest {
  producer: string;
  wine_name: string;
  vintage: number;
}

export function buildWineAutofillPrompt(input: WineAutofillRequest) {
  return `You are a careful, conservative sommelier helping autofill a personal cellar form.

Input:
- producer: ${input.producer}
- wine_name: ${input.wine_name}
- vintage: ${input.vintage}

Return structured JSON only. Infer likely wine metadata from producer, label/name, vintage, appellation cues, and common wine knowledge.

Rules:
- Be helpful but cautious.
- Do not fabricate precision.
- Use null for unknown fields.
- Broad likely estimates are better than overconfident specifics.
- If a field is inferred, still return your best broad estimate when useful.
- Use conservative drink-window guidance unless confidence is high.
- Do not present uncertain guesses as guaranteed facts.
- Include confidence from 0 to 1.
- Put any low-confidence or inferred fields in uncertain_fields.
- In known_vs_inferred_summary, explain which values came from user input and which were inferred.`;
}

export const wineAutofillJsonSchema = {
  name: 'wine_autofill',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'producer',
      'wine_name',
      'vintage',
      'appellation',
      'region',
      'country',
      'varietal',
      'style_category',
      'color',
      'body',
      'acidity',
      'tannin',
      'drink_window_start_year',
      'drink_window_end_year',
      'best_drink_by_year',
      'estimated_peak_year',
      'tasting_notes',
      'food_pairing_notes',
      'cellar_note',
      'confidence',
      'uncertain_fields',
      'known_vs_inferred_summary',
    ],
    properties: {
      producer: { type: ['string', 'null'] },
      wine_name: { type: ['string', 'null'] },
      vintage: { type: ['number', 'null'] },
      appellation: { type: ['string', 'null'] },
      region: { type: ['string', 'null'] },
      country: { type: ['string', 'null'] },
      varietal: { type: ['string', 'null'] },
      style_category: { type: ['string', 'null'], enum: ['red', 'white', 'rose', 'sparkling', 'dessert', 'fortified', 'orange', null] },
      color: { type: ['string', 'null'] },
      body: { type: ['string', 'null'] },
      acidity: { type: ['string', 'null'] },
      tannin: { type: ['string', 'null'] },
      drink_window_start_year: { type: ['number', 'null'] },
      drink_window_end_year: { type: ['number', 'null'] },
      best_drink_by_year: { type: ['number', 'null'] },
      estimated_peak_year: { type: ['number', 'null'] },
      tasting_notes: { type: ['string', 'null'] },
      food_pairing_notes: { type: ['string', 'null'] },
      cellar_note: { type: ['string', 'null'] },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      uncertain_fields: { type: 'array', items: { type: 'string' } },
      known_vs_inferred_summary: { type: ['string', 'null'] },
    },
  },
} as const;
