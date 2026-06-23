export interface User {
  id: string;
  username: string;
  email: string;
  created_at: Date;
}

// Character data type matches frontend character.ts
export interface CharacterData {
  id: string;
  name: string;
  player: string;
  chronicle: string;
  nature: string;
  demeanor: string;
  essence: string;
  tradition: string;
  cabal: string;
  concept: string;
  attributes: Record<string, number>;
  abilities: Record<string, number>;
  spheres: Record<string, number>;
  affinity?: string;
  backgrounds: Record<string, number>;
  arete: number;
  willpower: number;
  willpowerCurrent: number;
  quintessence: number;
  quintessenceMax: number;
  paradox: number;
  health: Record<string, boolean>;
  experience: number;
  experienceTotal: number;
  merits: string[];
  flaws: string[];
  equipment: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  user_id: string;
  name: string;
  data: CharacterData;
  created_at: Date;
  updated_at: Date;
}

export interface GameSession {
  id: string;
  user_id: string;
  character_id: string;
  title: string;
  summary: string;
  created_at: Date;
  updated_at: Date;
}

export interface SessionMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
}

export interface SessionCheckpoint {
  id: string;
  session_id: string;
  summary: string;
  created_at: Date;
}

// Extend Express Request
import { Request } from 'express';
export interface AuthenticatedRequest extends Request {
  user?: User;
}
