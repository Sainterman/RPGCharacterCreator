import { describe, expect, it } from 'vitest';
import { createEmptyCharacter } from './characterUtils';

describe('createEmptyCharacter', () => {
  it('creates a character with expected Mage defaults', () => {
    const character = createEmptyCharacter();

    expect(character.id).toBeTypeOf('string');
    expect(character.name).toBe('');
    expect(character.essence).toBe('Dynamic');
    expect(character.arete).toBe(1);
    expect(character.willpower).toBe(5);
    expect(character.willpowerCurrent).toBe(5);
    expect(character.experience).toBe(0);
    expect(character.experienceTotal).toBe(0);
    expect(character.attributes.strength).toBe(1);
    expect(character.abilities.alertness).toBe(0);
    expect(character.spheres.forces).toBe(0);
    expect(character.backgrounds.avatar).toBe(0);
    expect(character.createdAt).toBeInstanceOf(Date);
    expect(character.updatedAt).toBeInstanceOf(Date);
  });
});
