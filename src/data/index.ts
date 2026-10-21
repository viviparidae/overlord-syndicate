/**
 * Data - Pure JSON game data definitions
 * No TypeScript logic embedded here
 */

export interface Item {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  secret: string;
}

export const Items: Item[] = [];

export const NPCs: NPC[] = [];
