import { describe, expect, it } from 'vitest';
import { createEmptyCharacter } from './characterUtils';
import {
  addXP,
  calculateAbilityXPCost,
  calculateAttributeXPCost,
  calculateBackgroundXPCost,
  canAffordXP,
  spendXP,
} from './xpUtils';

describe('xpUtils', () => {
  it('calculates attribute XP using new rating × 4', () => {
    const result = calculateAttributeXPCost(2);
    expect(result.cost).toBe(12);
  });

  it('calculates ability XP for new and existing abilities', () => {
    expect(calculateAbilityXPCost(0).cost).toBe(3);
    expect(calculateAbilityXPCost(2).cost).toBe(6);
  });

  it('calculates background XP for new and existing backgrounds', () => {
    expect(calculateBackgroundXPCost(0).cost).toBe(5);
    expect(calculateBackgroundXPCost(2).cost).toBe(3);
  });

  it('adds and spends XP correctly', () => {
    const character = createEmptyCharacter();
    const withXp = addXP(character, 10);
    expect(withXp.experience).toBe(10);
    expect(withXp.experienceTotal).toBe(10);
    expect(canAffordXP(withXp, 8)).toBe(true);
    expect(spendXP(withXp, 8).experience).toBe(2);
  });

  it('throws when spending more XP than available', () => {
    const character = createEmptyCharacter();
    expect(() => spendXP(character, 1)).toThrow('Not enough experience points');
  });
});
