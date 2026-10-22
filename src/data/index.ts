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

export interface Asset {
  key: string;
  type: string;
  path: string;
  atlas?: string;
  frames?: Record<string, unknown>;
  license: string;
  author: string;
  sourceUrl: string;
  attribution: string | null;
  sha256?: string;
}

export interface AssetsManifest {
  version: number;
  assets: Asset[];
}

export const Items: Item[] = [];

export const NPCs: NPC[] = [];

export const ATTRIBUTION: Record<string, string> = {
  "Tiny RPG CC0 Characters": "tiopalada",
  "Kenney Tiny City": "Kenney",
  "Kenney UI Pack": "Kenney",
  DotGothic16: "Google Fonts",
};
