import { FoodProfile, dishCanHandleTannin, dishIsComfortFood, dishIsPatioFriendly, dishWantsAcidity, dishWantsBubbles, mapQueryToFoodProfile } from './foodAttributeMapper';
import { WineFlavorFamily, WinePairingTendency, WineProfile, WineReadinessTag, WineStyleFamily, WineTextureTrait } from './wineAttributeMapper';

export type ProfileTemperatureBand = 'cold' | 'cool' | 'mild' | 'warm' | 'hot';
export type ProfileWeatherCondition = 'rainy' | 'clear' | 'cloudy' | 'windy' | 'snow' | 'neutral';

export interface ProfileWeatherScore {
  temperatureFit: number;
  conditionFit: number;
  traitBoost: number;
  total: number;
  reasons: string[];
}

export interface ProfileSearchBoost {
  score: number;
  reasons: string[];
}

export type ProfileSummaryContext = 'search' | 'tonight' | 'ready_now' | 'drink_soon' | 'peak' | 'past_peak' | 'general';

const STYLE_LABELS: Record<WineStyleFamily, string> = {
  bold_red: 'bold red',
  medium_red: 'medium red',
  light_red: 'light red',
  crisp_white: 'crisp white',
  rich_white: 'rich white',
  rose: 'rosé',
  sparkling: 'sparkling',
  dessert: 'dessert',
  fortified: 'fortified',
  orange: 'orange',
  other: 'wine',
};

function includesAny(source: string, terms: string[]) {
  return terms.some((term) => source.includes(term));
}

function addReason(reasons: string[], reason: string) {
  if (reason && !reasons.includes(reason)) reasons.push(reason);
}

function labelize(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function hasPairing(profile: WineProfile, tendency: WinePairingTendency) {
  return profile.pairingTendencies.includes(tendency);
}

function hasFlavor(profile: WineProfile, flavor: WineFlavorFamily) {
  return profile.flavorFamilies.includes(flavor);
}

function hasTexture(profile: WineProfile, texture: WineTextureTrait) {
  return profile.textureTraits.includes(texture);
}

export function isCozyBottle(profile: WineProfile) {
  return hasPairing(profile, 'cozy_weather_friendly')
    || hasPairing(profile, 'rainy_night_friendly')
    || ['bold_red', 'medium_red', 'rich_white', 'fortified', 'dessert'].includes(profile.styleFamily)
    || hasTexture(profile, 'plush')
    || hasTexture(profile, 'weighty')
    || hasFlavor(profile, 'dark_fruit')
    || hasFlavor(profile, 'spice');
}

export function isPatioBottle(profile: WineProfile) {
  return hasPairing(profile, 'patio_friendly')
    || hasPairing(profile, 'porch_pounder_candidate')
    || ['crisp_white', 'rose', 'sparkling', 'light_red'].includes(profile.styleFamily)
    || hasTexture(profile, 'refreshing')
    || hasTexture(profile, 'crisp');
}

export function isSeafoodFriendly(profile: WineProfile) {
  return hasPairing(profile, 'seafood_friendly') || hasPairing(profile, 'salmon_friendly');
}

export function isBoldRed(profile: WineProfile) {
  return profile.styleFamily === 'bold_red' || profile.tanninLevel === 'high' || profile.tanninLevel === 'medium_plus';
}

export function getWineProfileTags(profile: WineProfile) {
  const tags = [
    STYLE_LABELS[profile.styleFamily],
    profile.readinessTag.replace(/_/g, ' '),
    ...profile.textureTraits.map((trait) => trait.replace(/_/g, ' ')),
    ...profile.flavorFamilies.map((flavor) => flavor.replace(/_/g, ' ')),
    ...profile.pairingTendencies.map((tendency) => tendency.replace(/_/g, ' ')),
  ];

  return Array.from(new Set(tags)).slice(0, 14);
}

export function getProfileSupportChips(profile: WineProfile, limit = 3) {
  const chips: string[] = [];

  if (profile.readinessTag === 'peak_window') chips.push('At peak');
  else if (profile.readinessTag === 'ready_now') chips.push('Ready now');
  else if (profile.readinessTag === 'nearing_end') chips.push('Drink soon');

  if (hasTexture(profile, 'refreshing')) chips.push('Refreshing');
  else if (hasTexture(profile, 'creamy')) chips.push('Creamy texture');
  else if (hasTexture(profile, 'silky')) chips.push('Silky texture');
  else if (hasTexture(profile, 'structured')) chips.push('Structured');

  if (hasFlavor(profile, 'citrus')) chips.push('Citrus lift');
  else if (hasFlavor(profile, 'dark_fruit')) chips.push('Dark fruit');
  else if (hasFlavor(profile, 'red_fruit')) chips.push('Red fruit');
  else if (hasFlavor(profile, 'earthy')) chips.push('Earthy');

  if (hasPairing(profile, 'seafood_friendly')) chips.push('Seafood-friendly');
  else if (hasPairing(profile, 'goat_cheese_friendly')) chips.push('Goat cheese-friendly');
  else if (hasPairing(profile, 'steak_friendly')) chips.push('Steak-friendly');
  else if (hasPairing(profile, 'patio_friendly')) chips.push('Patio-friendly');
  else if (hasPairing(profile, 'dinner_party_friendly')) chips.push('Dinner-party friendly');

  return Array.from(new Set(chips)).slice(0, limit);
}

export function getProfileContextSummary(profile: WineProfile, context: ProfileSummaryContext = 'general') {
  if (context === 'tonight') {
    if (isPatioBottle(profile)) return `A lovely tonight pick: ${profile.readiness}, with enough ${profile.fruitProfile} charm to feel easy and inviting.`;
    if (isCozyBottle(profile)) return `A strong evening bottle: ${profile.readiness}, with the kind of texture and depth that suits a slower night.`;
    return `A thoughtful bottle for tonight: ${profile.readiness}, with ${profile.body} and ${profile.texture} keeping it grounded.`;
  }

  if (context === 'ready_now') {
    return `Feels especially worth opening now — ${profile.readiness}, with enough ${profile.texture} and ${profile.fruitProfile} character to show well at the table.`;
  }

  if (context === 'drink_soon') {
    return `Probably not one to keep waiting on. It still has plenty to give, but the window is asking for your attention.`;
  }

  if (context === 'peak') {
    return `In a particularly lovely place right now, with the profile feeling complete and well put together.`;
  }

  if (context === 'past_peak') {
    return `Worth checking in on sooner rather than later — more curiosity bottle than long-term hold at this point.`;
  }

  if (context === 'search') {
    const strongestPairing = profile.pairingTendencies[0];
    if (strongestPairing) {
      return `The profile reads as ${labelize(strongestPairing).toLowerCase()}, with ${profile.texture} and ${profile.readiness} helping it rise naturally here.`;
    }
  }

  return `This bottle reads as ${STYLE_LABELS[profile.styleFamily]}, with ${profile.texture} and ${profile.readiness} doing most of the interesting work.`;
}

export function getProfileWeatherScore(
  profile: WineProfile,
  temperatureBand: ProfileTemperatureBand,
  condition: ProfileWeatherCondition,
): ProfileWeatherScore {
  const reasons: string[] = [];
  let temperatureFit = 0;
  let conditionFit = 0;
  let traitBoost = 0;

  if (temperatureBand === 'cold') {
    if (isCozyBottle(profile)) {
      temperatureFit += 8;
      addReason(reasons, 'Cozy-weather profile');
    }
    if (['bold_red', 'fortified', 'dessert'].includes(profile.styleFamily)) {
      temperatureFit += 6;
      addReason(reasons, 'Warming style');
    }
  }

  if (temperatureBand === 'cool') {
    if (['light_red', 'medium_red', 'rich_white'].includes(profile.styleFamily)) {
      temperatureFit += 6;
      addReason(reasons, 'Good cool-evening fit');
    }
    if (hasTexture(profile, 'silky')) {
      traitBoost += 2;
      addReason(reasons, 'Silky texture');
    }
  }

  if (temperatureBand === 'mild') {
    if (['light_red', 'medium_red', 'rich_white', 'crisp_white', 'rose'].includes(profile.styleFamily)) {
      temperatureFit += 5;
      addReason(reasons, 'Balanced for a mild evening');
    }
  }

  if (temperatureBand === 'warm') {
    if (isPatioBottle(profile)) {
      temperatureFit += 8;
      addReason(reasons, 'Patio-friendly profile');
    }
    if (['rose', 'crisp_white', 'sparkling'].includes(profile.styleFamily)) {
      temperatureFit += 5;
      addReason(reasons, 'Fresh warm-weather style');
    }
  }

  if (temperatureBand === 'hot') {
    if (['sparkling', 'rose', 'crisp_white'].includes(profile.styleFamily)) {
      temperatureFit += 9;
      addReason(reasons, 'Refreshing in the heat');
    }
    if (hasTexture(profile, 'refreshing') || hasTexture(profile, 'crisp')) {
      traitBoost += 3;
      addReason(reasons, 'Cooling texture');
    }
  }

  if (condition === 'rainy') {
    if (hasPairing(profile, 'rainy_night_friendly') || isCozyBottle(profile)) {
      conditionFit += 6;
      addReason(reasons, 'Rainy-night fit');
    }
  }

  if (condition === 'snow') {
    if (isCozyBottle(profile) || ['bold_red', 'fortified', 'dessert'].includes(profile.styleFamily)) {
      conditionFit += 7;
      addReason(reasons, 'Wintry bottle energy');
    }
  }

  if (condition === 'clear') {
    if (isPatioBottle(profile) || ['rose', 'sparkling', 'crisp_white'].includes(profile.styleFamily)) {
      conditionFit += 5;
      addReason(reasons, 'Bright clear-evening fit');
    }
  }

  if (condition === 'cloudy') {
    if (['rich_white', 'light_red', 'medium_red'].includes(profile.styleFamily)) {
      conditionFit += 4;
      addReason(reasons, 'Soft overcast fit');
    }
  }

  if (condition === 'windy') {
    if (hasTexture(profile, 'crisp') || hasTexture(profile, 'refreshing') || isBoldRed(profile)) {
      conditionFit += 4;
      addReason(reasons, 'Lift and structure for brisk weather');
    }
  }

  if (profile.readinessTag === 'peak_window') {
    traitBoost += 3;
    addReason(reasons, 'At peak');
  } else if (profile.readinessTag === 'ready_now') {
    traitBoost += 2;
    addReason(reasons, 'Ready now');
  } else if (profile.readinessTag === 'too_young') {
    traitBoost -= 3;
  } else if (profile.readinessTag === 'past_peak') {
    traitBoost -= 5;
  }

  return {
    temperatureFit,
    conditionFit,
    traitBoost,
    total: temperatureFit + conditionFit + traitBoost,
    reasons: reasons.slice(0, 4),
  };
}

function readinessBoost(tag: WineReadinessTag) {
  if (tag === 'peak_window') return 0.09;
  if (tag === 'ready_now') return 0.07;
  if (tag === 'nearing_end') return 0.05;
  if (tag === 'too_young') return -0.05;
  if (tag === 'past_peak') return -0.08;
  return 0;
}

export function hasMeaningfulFoodSignal(foodProfile: FoodProfile) {
  return Boolean(
    foodProfile.matchedArchetype
    || foodProfile.categories.some((category) => category !== 'general')
    || foodProfile.occasionCues.length
    || foodProfile.matchedTerms.length >= 2,
  );
}

function queryLabelForFood(foodProfile: FoodProfile) {
  return (foodProfile.matchedArchetype ?? foodProfile.queryText).trim() || 'this dish';
}

export function getFoodAndWineMatchReason(profile: WineProfile, foodProfile: FoodProfile) {
  const dishLabel = queryLabelForFood(foodProfile);
  const style = profile.styleLabel.toLowerCase();

  if (!hasMeaningfulFoodSignal(foodProfile)) {
    return `This bottle rises here because its ${profile.texture}, ${profile.fruitProfile} profile, and ${profile.readiness} make it a flexible match.`;
  }

  if (dishWantsBubbles(foodProfile) && profile.styleFamily === 'sparkling') {
    return `${dishLabel.charAt(0).toUpperCase() + dishLabel.slice(1)} usually likes lift and palate reset, and this ${style} brings exactly that.`;
  }

  if (dishCanHandleTannin(foodProfile) && isBoldRed(profile)) {
    return `${dishLabel.charAt(0).toUpperCase() + dishLabel.slice(1)} can handle a wine with structure, and this ${style} has enough tannin and depth to meet it well.`;
  }

  if (dishWantsAcidity(foodProfile) && (profile.acidityLevel === 'high' || profile.acidityLevel === 'medium_plus')) {
    return `${dishLabel.charAt(0).toUpperCase() + dishLabel.slice(1)} usually wants brightness and lift, and this ${style} has the acidity to keep the pairing lively.`;
  }

  if (foodProfile.pairingNeeds.includes('dislikes_heavy_tannin') && !isBoldRed(profile)) {
    return `${dishLabel.charAt(0).toUpperCase() + dishLabel.slice(1)} is usually happier with gentler structure, and this ${style} stays on the softer, more food-friendly side.`;
  }

  if (foodProfile.pairingNeeds.includes('wants_texture_echo') && (hasTexture(profile, 'creamy') || hasTexture(profile, 'silky') || hasTexture(profile, 'round'))) {
    return `${dishLabel.charAt(0).toUpperCase() + dishLabel.slice(1)} has a strong texture story, and this ${style} answers it with ${profile.texture} and a ${profile.finish}.`;
  }

  if (foodProfile.pairingNeeds.includes('wants_freshness') && (hasTexture(profile, 'refreshing') || hasFlavor(profile, 'citrus') || hasFlavor(profile, 'mineral'))) {
    return `${dishLabel.charAt(0).toUpperCase() + dishLabel.slice(1)} wants a wine with freshness, and this ${style} has the lift to keep everything feeling clean and complete.`;
  }

  if (foodProfile.pairingNeeds.includes('wants_fruit_support') && (hasFlavor(profile, 'red_fruit') || hasFlavor(profile, 'dark_fruit') || hasFlavor(profile, 'orchard_fruit'))) {
    return `${dishLabel.charAt(0).toUpperCase() + dishLabel.slice(1)} benefits from a little fruit generosity, and this ${style} has enough ${profile.fruitProfile} character to help.`;
  }

  return `${dishLabel.charAt(0).toUpperCase() + dishLabel.slice(1)} looks like a natural fit for this bottle: the pairing lands through ${profile.texture}, ${profile.fruitProfile} character, and ${profile.readiness}.`;
}

export function getProfileSearchBoost(query: string, profile: WineProfile): ProfileSearchBoost {
  const normalized = query.toLowerCase();
  const foodProfile = mapQueryToFoodProfile(query);
  let score = 0;
  const reasons: string[] = [];

  if (includesAny(normalized, ['cozy', 'rainy', 'snow', 'cold', 'winter', 'comfort'])) {
    if (isCozyBottle(profile)) {
      score += 0.08;
      addReason(reasons, 'Cozy-weather profile');
    }
    if (hasFlavor(profile, 'dark_fruit') || hasFlavor(profile, 'spice')) {
      score += 0.03;
      addReason(reasons, 'Deeper flavor profile');
    }
  }
  if (dishIsComfortFood(foodProfile) && isCozyBottle(profile)) {
    score += 0.04;
    addReason(reasons, 'Comfort-food fit');
  }

  if (includesAny(normalized, ['patio', 'summer', 'porch', 'picnic', 'easy', 'outside'])) {
    if (isPatioBottle(profile)) {
      score += 0.08;
      addReason(reasons, 'Patio-friendly profile');
    }
    if (hasTexture(profile, 'refreshing') || hasTexture(profile, 'crisp')) {
      score += 0.03;
      addReason(reasons, 'Refreshing structure');
    }
  }
  if (dishIsPatioFriendly(foodProfile) && isPatioBottle(profile)) {
    score += 0.05;
    addReason(reasons, 'Patio dish fit');
  }

  if (includesAny(normalized, ['seafood', 'fish', 'salmon', 'oyster', 'shrimp']) || foodProfile.categories.includes('seafood') || foodProfile.categories.includes('fish') || foodProfile.categories.includes('shellfish')) {
    if (isSeafoodFriendly(profile)) {
      score += 0.09;
      addReason(reasons, 'Seafood-friendly profile');
    }
    if (profile.acidityLevel === 'high' || profile.acidityLevel === 'medium_plus') {
      score += 0.03;
      addReason(reasons, 'Bright acidity');
    }
  }

  if (includesAny(normalized, ['goat cheese', 'cheese', 'chèvre', 'chevre']) || foodProfile.categories.includes('cheese')) {
    if (hasPairing(profile, 'goat_cheese_friendly') || hasPairing(profile, 'cheese_friendly')) {
      score += 0.08;
      addReason(reasons, 'Cheese-friendly profile');
    }
  }

  if (includesAny(normalized, ['steak', 'burger', 'lamb', 'grilled', 'bold', 'rich']) || dishCanHandleTannin(foodProfile)) {
    if (hasPairing(profile, 'steak_friendly') || hasPairing(profile, 'grilled_food_friendly') || isBoldRed(profile)) {
      score += 0.09;
      addReason(reasons, 'Structured for richer food');
    }
  }

  if (includesAny(normalized, ['friends', 'dinner', 'party', 'company', 'special', 'celebration', 'date'])) {
    if (hasPairing(profile, 'dinner_party_friendly') || hasPairing(profile, 'celebration_friendly') || hasPairing(profile, 'crowd_pleaser')) {
      score += 0.06;
      addReason(reasons, 'Good social-bottle fit');
    }
  }
  if (hasMeaningfulFoodSignal(foodProfile)) {
    if (dishWantsBubbles(foodProfile) && profile.styleFamily === 'sparkling') {
      score += 0.08;
      addReason(reasons, 'Bubble-friendly pairing');
    }
    if (dishWantsAcidity(foodProfile) && (profile.acidityLevel === 'high' || profile.acidityLevel === 'medium_plus')) {
      score += 0.05;
      addReason(reasons, 'Bright enough for the dish');
    }
    if (foodProfile.pairingNeeds.includes('dislikes_heavy_tannin') && !isBoldRed(profile)) {
      score += 0.04;
      addReason(reasons, 'Gentler tannin fit');
    }
    if (foodProfile.pairingNeeds.includes('wants_texture_echo') && (hasTexture(profile, 'creamy') || hasTexture(profile, 'silky') || hasPairing(profile, 'mushroom_friendly') || hasPairing(profile, 'creamy_dish_friendly'))) {
      score += 0.05;
      addReason(reasons, 'Texture echo');
    }
    if (foodProfile.pairingNeeds.includes('wants_fruit_support') && (hasFlavor(profile, 'red_fruit') || hasFlavor(profile, 'dark_fruit') || hasFlavor(profile, 'orchard_fruit'))) {
      score += 0.04;
      addReason(reasons, 'Fruit support');
    }
  }

  if (includesAny(normalized, ['ready', 'drink now', 'open tonight', 'tonight', 'peak'])) {
    const boost = readinessBoost(profile.readinessTag);
    score += boost;
    if (boost > 0) addReason(reasons, profile.readinessTag === 'peak_window' ? 'At peak' : 'Ready now');
  }

  if (includesAny(normalized, ['buttery', 'creamy', 'oak', 'oaky'])) {
    if (hasFlavor(profile, 'creamy_buttery') || hasFlavor(profile, 'oak') || hasTexture(profile, 'creamy')) {
      score += 0.08;
      addReason(reasons, 'Creamy, oaked profile');
    }
  }

  if (includesAny(normalized, ['earthy', 'mushroom', 'forest', 'savory'])) {
    if (hasFlavor(profile, 'earthy') || hasFlavor(profile, 'savory') || hasPairing(profile, 'mushroom_friendly')) {
      score += 0.07;
      addReason(reasons, 'Earthy savory profile');
    }
  }

  return {
    score: Number(Math.max(-0.12, Math.min(0.28, score)).toFixed(6)),
    reasons: reasons.slice(0, 4),
  };
}
