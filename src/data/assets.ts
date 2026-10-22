export type AssetType = "image" | "atlas" | "spritesheet";

export interface Asset {
  key: string;
  type: AssetType;
  path: string;
  atlas?: string;
  frames?: Record<string, string> & { walk?: string[] };
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

export const ALLOWED_LICENSES: string[] = [
  "CC0-1.0",
  "CC-BY-3.0",
  "CC-BY-4.0",
  "CC-BY-SA-3.0",
  "CC-BY-SA-4.0",
  "OFL-1.1",
];

export const ATTRIBUTION: Record<string, string> = {
  "Tiny RPG CC0 Characters": "tiopalada",
  "Kenney Tiny City": "Kenney",
  "Kenney UI Pack": "Kenney",
  DotGothic16: "Google Fonts",
};
