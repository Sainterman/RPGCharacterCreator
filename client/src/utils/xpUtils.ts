import type { Character } from '../types/character';
import { DEFAULT_XP_COSTS } from '../types/character';

export interface XPCostCalculation {
  cost: number;
  description: string;
}

export function calculateAttributeXPCost(currentValue: number): XPCostCalculation {
  const newValue = currentValue + 1;
  const cost = newValue * DEFAULT_XP_COSTS.attribute;
  return {
    cost,
    description: `Increase attribute from ${currentValue} to ${newValue} (${newValue} × ${DEFAULT_XP_COSTS.attribute})`,
  };
}

export function calculateAbilityXPCost(currentValue: number): XPCostCalculation {
  if (currentValue === 0) {
    return {
      cost: DEFAULT_XP_COSTS.newAbility,
      description: `Learn new ability (flat ${DEFAULT_XP_COSTS.newAbility} XP)`,
    };
  }
  
  const newValue = currentValue + 1;
  const cost = newValue * DEFAULT_XP_COSTS.ability;
  return {
    cost,
    description: `Increase ability from ${currentValue} to ${newValue} (${newValue} × ${DEFAULT_XP_COSTS.ability})`,
  };
}

export function calculateSphereXPCost(currentValue: number): XPCostCalculation {
  const newValue = currentValue + 1;
  const cost = newValue * DEFAULT_XP_COSTS.sphere;
  return {
    cost,
    description: `Increase sphere from ${currentValue} to ${newValue} (${newValue} × ${DEFAULT_XP_COSTS.sphere})`,
  };
}

export function calculateAreteXPCost(currentValue: number): XPCostCalculation {
  const newValue = currentValue + 1;
  const cost = newValue * DEFAULT_XP_COSTS.arete;
  return {
    cost,
    description: `Increase Arete from ${currentValue} to ${newValue} (${newValue} × ${DEFAULT_XP_COSTS.arete})`,
  };
}

export function calculateWillpowerXPCost(): XPCostCalculation {
  return {
    cost: DEFAULT_XP_COSTS.willpower,
    description: `Increase permanent Willpower (flat ${DEFAULT_XP_COSTS.willpower} XP)`,
  };
}

export function calculateBackgroundXPCost(currentValue: number): XPCostCalculation {
  if (currentValue === 0) {
    return {
      cost: DEFAULT_XP_COSTS.newBackground,
      description: `Acquire new background (flat ${DEFAULT_XP_COSTS.newBackground} XP)`,
    };
  }
  
  return {
    cost: DEFAULT_XP_COSTS.backgroundIncrease,
    description: `Increase background from ${currentValue} to ${currentValue + 1} (flat ${DEFAULT_XP_COSTS.backgroundIncrease} XP)`,
  };
}

export function canAffordXP(character: Character, cost: number): boolean {
  return character.experience >= cost;
}

export function spendXP(character: Character, cost: number): Character {
  if (!canAffordXP(character, cost)) {
    throw new Error('Not enough experience points');
  }
  
  return {
    ...character,
    experience: character.experience - cost,
  };
}

export function addXP(character: Character, amount: number): Character {
  return {
    ...character,
    experience: character.experience + amount,
    experienceTotal: character.experienceTotal + amount,
  };
}
