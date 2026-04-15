import { buildSommelierRecommendation } from '../services/sommelierReasoningEngine';
import { NaturalLanguageSearchMatch, Wine } from '../types/wine';

export function getSearchMatchLabel(match: NaturalLanguageSearchMatch) {
  if (match.keywordScore > 0.08 && match.semanticScore > 0.58) return 'Exact + AI match';
  if (match.keywordScore > 0.08) return 'Exact match';
  if (match.readinessBoost > 0) return 'Drink-window match';
  return 'AI meaning match';
}

export function getSearchMatchChips(match: NaturalLanguageSearchMatch, wine: Wine, query = '') {
  const recommendation = buildSommelierRecommendation({
    wine,
    match,
    query,
    context: 'search',
  });

  const chips = [
    ...recommendation.reasoning.supportChips,
    match.keywordScore > 0.08 ? 'Exact cellar text' : '',
    match.semanticScore > 0.58 ? 'AI suggestion' : '',
  ].filter(Boolean);

  return Array.from(new Set(chips)).slice(0, 3);
}

export function getBestMatchNote(wine: Wine, match?: NaturalLanguageSearchMatch, query = '') {
  return buildSommelierRecommendation({
    wine,
    match,
    query,
    context: 'search',
  });
}

export function getBestMatchSummary(wine: Wine, match?: NaturalLanguageSearchMatch, query = '') {
  return getBestMatchNote(wine, match, query).body;
}
