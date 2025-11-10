import type { Essence } from '../types/character';

export const TRADITIONS = [
  'Akashic Brotherhood',
  'Celestial Chorus',
  'Cult of Ecstasy',
  'Dreamspeakers',
  'Euthanatos',
  'Order of Hermes',
  'Sons of Ether',
  'Verbena',
  'Virtual Adepts',
  'Hollow Ones',
  'Orphan',
];

export const ESSENCES: Essence[] = [
  'Dynamic',
  'Pattern',
  'Primordial',
  'Questing',
];

export const NATURES = [
  'Architect',
  'Autocrat',
  'Bon Vivant',
  'Bravo',
  'Caregiver',
  'Celebrant',
  'Competitor',
  'Conformist',
  'Conniver',
  'Critic',
  'Curmudgeon',
  'Deviant',
  'Director',
  'Enigma',
  'Eye of the Storm',
  'Fanatic',
  'Gallant',
  'Guru',
  'Idealist',
  'Judge',
  'Loner',
  'Martyr',
  'Masochist',
  'Monster',
  'Pedagogue',
  'Penitent',
  'Perfectionist',
  'Rebel',
  'Rogue',
  'Scientist',
  'Survivor',
  'Thrill-Seeker',
  'Traditionalist',
  'Trickster',
  'Visionary',
];

export const DEMEANORS = NATURES; // Same list as Natures

export const ATTRIBUTE_CATEGORIES = {
  physical: ['strength', 'dexterity', 'stamina'],
  social: ['charisma', 'manipulation', 'appearance'],
  mental: ['perception', 'intelligence', 'wits'],
} as const;

export const ABILITY_CATEGORIES = {
  talents: [
    'alertness',
    'athletics',
    'awareness',
    'brawl',
    'empathy',
    'expression',
    'intimidation',
    'leadership',
    'streetwise',
    'subterfuge',
  ],
  skills: [
    'crafts',
    'drive',
    'etiquette',
    'firearms',
    'meditation',
    'melee',
    'research',
    'stealth',
    'survival',
    'technology',
  ],
  knowledges: [
    'academics',
    'computer',
    'cosmology',
    'enigmas',
    'investigation',
    'law',
    'medicine',
    'occult',
    'politics',
    'science',
  ],
} as const;

export const SPHERE_NAMES = [
  'correspondence',
  'entropy',
  'forces',
  'life',
  'matter',
  'mind',
  'prime',
  'spirit',
  'time',
] as const;

export const BACKGROUND_NAMES = [
  'allies',
  'arcane',
  'avatar',
  'contacts',
  'destiny',
  'dream',
  'influence',
  'mentor',
  'node',
  'resources',
  'sanctum',
  'wonder',
] as const;

// Character creation point allocations
export const CREATION_POINTS = {
  attributes: {
    primary: 7,
    secondary: 5,
    tertiary: 3,
  },
  abilities: {
    primary: 13,
    secondary: 9,
    tertiary: 5,
  },
  backgrounds: 7,
  spheres: 6, // Distributed among spheres, with affinity sphere starting at 1
  willpower: 5,
  arete: 1,
  quintessence: 0, // Avatar rating
  freebiePoints: 15,
};

// Freebie point costs
export const FREEBIE_COSTS = {
  attribute: 5,
  ability: 2,
  sphere: 7,
  background: 1,
  arete: 4,
  willpower: 1,
  quintessence: 1, // Max quintessence
};
