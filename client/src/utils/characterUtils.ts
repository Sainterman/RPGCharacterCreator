import type { Character } from '../types/character';

export function createEmptyCharacter(): Character {
  return {
    id: crypto.randomUUID(),
    name: '',
    player: '',
    chronicle: '',
    nature: '',
    demeanor: '',
    essence: 'Dynamic',
    tradition: '',
    cabal: '',
    concept: '',
    attributes: {
      strength: 1,
      dexterity: 1,
      stamina: 1,
      charisma: 1,
      manipulation: 1,
      appearance: 1,
      perception: 1,
      intelligence: 1,
      wits: 1,
    },
    abilities: {
      alertness: 0,
      athletics: 0,
      awareness: 0,
      brawl: 0,
      empathy: 0,
      expression: 0,
      intimidation: 0,
      leadership: 0,
      streetwise: 0,
      subterfuge: 0,
      crafts: 0,
      drive: 0,
      etiquette: 0,
      firearms: 0,
      meditation: 0,
      melee: 0,
      research: 0,
      stealth: 0,
      survival: 0,
      technology: 0,
      academics: 0,
      computer: 0,
      cosmology: 0,
      enigmas: 0,
      investigation: 0,
      law: 0,
      medicine: 0,
      occult: 0,
      politics: 0,
      science: 0,
    },
    spheres: {
      correspondence: 0,
      entropy: 0,
      forces: 0,
      life: 0,
      matter: 0,
      mind: 0,
      prime: 0,
      spirit: 0,
      time: 0,
    },
    backgrounds: {
      allies: 0,
      arcane: 0,
      avatar: 0,
      contacts: 0,
      destiny: 0,
      dream: 0,
      influence: 0,
      mentor: 0,
      node: 0,
      resources: 0,
      sanctum: 0,
      wonder: 0,
    },
    arete: 1,
    willpower: 5,
    willpowerCurrent: 5,
    quintessence: 0,
    quintessenceMax: 0,
    paradox: 0,
    health: {
      bruised: false,
      hurt: false,
      injured: false,
      wounded: false,
      mauled: false,
      crippled: false,
      incapacitated: false,
    },
    experience: 0,
    experienceTotal: 0,
    merits: [],
    flaws: [],
    equipment: [],
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function saveCharacter(character: Character): void {
  const characters = getCharacters();
  const existingIndex = characters.findIndex(c => c.id === character.id);
  
  character.updatedAt = new Date();
  
  if (existingIndex >= 0) {
    characters[existingIndex] = character;
  } else {
    characters.push(character);
  }
  
  localStorage.setItem('mage_characters', JSON.stringify(characters));
}

export function getCharacters(): Character[] {
  const stored = localStorage.getItem('mage_characters');
  if (!stored) return [];
  
  try {
    const characters = JSON.parse(stored) as Character[];
    // Convert date strings back to Date objects
    return characters.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    }));
  } catch {
    return [];
  }
}

export function getCharacter(id: string): Character | null {
  const characters = getCharacters();
  return characters.find(c => c.id === id) || null;
}

export function deleteCharacter(id: string): void {
  const characters = getCharacters();
  const filtered = characters.filter(c => c.id !== id);
  localStorage.setItem('mage_characters', JSON.stringify(filtered));
}
