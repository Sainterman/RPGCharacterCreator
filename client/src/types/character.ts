// Mage: The Ascension 20th Edition Character Types

export interface Attribute {
  value: number;
}

export interface Attributes {
  // Physical
  strength: number;
  dexterity: number;
  stamina: number;
  // Social
  charisma: number;
  manipulation: number;
  appearance: number;
  // Mental
  perception: number;
  intelligence: number;
  wits: number;
}

export interface Abilities {
  // Talents
  alertness: number;
  athletics: number;
  awareness: number;
  brawl: number;
  empathy: number;
  expression: number;
  intimidation: number;
  leadership: number;
  streetwise: number;
  subterfuge: number;
  // Skills
  crafts: number;
  drive: number;
  etiquette: number;
  firearms: number;
  meditation: number;
  melee: number;
  research: number;
  stealth: number;
  survival: number;
  technology: number;
  // Knowledges
  academics: number;
  computer: number;
  cosmology: number;
  enigmas: number;
  investigation: number;
  law: number;
  medicine: number;
  occult: number;
  politics: number;
  science: number;
}

export interface Spheres {
  correspondence: number;
  entropy: number;
  forces: number;
  life: number;
  matter: number;
  mind: number;
  prime: number;
  spirit: number;
  time: number;
}

export interface Backgrounds {
  allies: number;
  arcane: number;
  avatar: number;
  contacts: number;
  destiny: number;
  dream: number;
  influence: number;
  mentor: number;
  node: number;
  resources: number;
  sanctum: number;
  wonder: number;
}

export type Essence = 'Dynamic' | 'Pattern' | 'Primordial' | 'Questing';
export type Affinity = keyof Spheres;

export interface Character {
  // Basic Info
  id: string;
  name: string;
  player: string;
  chronicle: string;
  nature: string;
  demeanor: string;
  essence: Essence;
  tradition: string;
  cabal: string;
  concept: string;
  
  // Attributes
  attributes: Attributes;
  
  // Abilities
  abilities: Abilities;
  
  // Spheres
  spheres: Spheres;
  affinity?: Affinity;
  
  // Backgrounds
  backgrounds: Backgrounds;
  
  // Advantages
  arete: number;
  willpower: number;
  willpowerCurrent: number;
  quintessence: number;
  quintessenceMax: number;
  paradox: number;
  
  // Health
  health: {
    bruised: boolean;
    hurt: boolean;
    injured: boolean;
    wounded: boolean;
    mauled: boolean;
    crippled: boolean;
    incapacitated: boolean;
  };
  
  // Experience
  experience: number;
  experienceTotal: number;
  
  // Additional Info
  merits: string[];
  flaws: string[];
  equipment: string[];
  notes: string;
  
  // Meta
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceCost {
  attribute: number;
  ability: number;
  newAbility: number;
  sphere: number;
  arete: number;
  willpower: number;
  backgroundIncrease: number;
  newBackground: number;
}

export const DEFAULT_XP_COSTS: ExperienceCost = {
  attribute: 4, // current rating x 4
  ability: 2, // current rating x 2
  newAbility: 3,
  sphere: 7, // current rating x 7
  arete: 8, // current rating x 8
  willpower: 1,
  backgroundIncrease: 3,
  newBackground: 5,
};
