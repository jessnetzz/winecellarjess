import { buildSommelierRecommendation } from '../services/sommelierReasoningEngine';
import { mapQueryToFoodProfile } from '../services/foodAttributeMapper';
import { mapWineToProfile } from '../services/wineAttributeMapper';
import { getFoodAndWineMatchReason, getProfileContextSummary, getProfileSupportChips, hasMeaningfulFoodSignal } from '../services/wineProfileSelectors';
import { NaturalLanguageSearchMatch, Wine } from '../types/wine';

export function getSearchMatchLabel(match: NaturalLanguageSearchMatch) {
  if (match.keywordScore > 0.08 && match.semanticScore > 0.58) return 'Exact + AI match';
  if (match.keywordScore > 0.08) return 'Exact match';
  if (match.profileBoost > 0.05) return 'Profile match';
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
  const profile = mapWineToProfile(wine);

  const chips = [
    ...recommendation.reasoning.supportChips,
    ...getProfileSupportChips(profile, 2),
    ...(match.profileReasons ?? []),
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

export function getProfileSearchSummary(wine: Wine, query = '') {
  const wineProfile = mapWineToProfile(wine);
  const foodProfile = mapQueryToFoodProfile(query);

  if (query.trim() && hasMeaningfulFoodSignal(foodProfile)) {
    return getFoodAndWineMatchReason(wineProfile, foodProfile);
  }

  return getProfileContextSummary(wineProfile, 'search');
}
