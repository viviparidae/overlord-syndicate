// scripts/build-atlas-json.mjs
// キャラクターシートから Phaser 用の atlas JSON を生成する。
// 入力: public/assets/characters/charWorkshopIDemo/20250303demoCharXX.png
// 出力: public/assets/characters/charWorkshopIDemo/20250303demoCharXX.json
// フォーマット: Phaser load.atlas 用の JSON hash format
// グリッド: 4 columns × 3 rows, 各セル 72×64
// フレーム名: walk_down_0..2, walk_left_0..2, walk_right_0..2, walk_up_0..2

import fs from "node:fs";
import path from "node:path";
import { decodePng } from "/workspaces/overlord-syndicate/scripts/lib/png.mjs";

const CHARACTERS_DIR = "/workspaces/overlord-syndicate/public/assets/characters";
const SHEET_WIDTH = 288;
const SHEET_HEIGHT = 192;
const CELL_W = 72;
const CELL_H = 64;
const COLS = 4;
const ROWS = 3;

// フレーム名のマッピング: (col, row) -> name
// col 0 = down, col 1 = left, col 2 = right, col 3 = up
// row 0 = frame 0, row 1 = frame 1, row 2 = frame 2
const FRAME_NAMES = [
  ["walk_down_0", "walk_left_0", "walk_right_0", "walk_up_0"],
  ["walk_down_1", "walk_left_1", "walk_right_1", "walk_up_1"],
  ["walk_down_2", "walk_left_2", "walk_right_2", "walk_up_2"],
];

function createAtlasFrame(x, y) {
  return { x, y, w: CELL_W, h: CELL_H };
}

function generateAtlas(sheetName, pngPath) {
  const img = decodePng(fs.readFileSync(pngPath));
  if (img.width !== SHEET_WIDTH || img.height !== SHEET_HEIGHT) {
    throw new Error(
      `${sheetName}: unexpected size ${img.width}x${img.height}, expected ${SHEET_WIDTH}x${SHEET_HEIGHT}`,
    );
  }

  const frames = {};
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const name = FRAME_NAMES[row][col];
      const x = col * CELL_W;
      const y = row * CELL_H;
      frames[name] = { frame: createAtlasFrame(x, y) };
    }
  }

  const atlas = { frames };
  const jsonPath = pngPath.replace(/\.png$/, ".json");
  fs.writeFileSync(jsonPath, JSON.stringify(atlas, null, 2));
  console.log(`Generated ${jsonPath}`);
}

// キャラクターシートのリスト
const charSheets = ["20250303demoChar00", "20250303demoChar01", "20250303demoChar02"];

for (const sheet of charSheets) {
  const pngPath = path.join(CHARACTERS_DIR, "charWorkshopIDemo", `${sheet}.png`);
  if (fs.existsSync(pngPath)) {
    generateAtlas(sheet, pngPath);
  } else {
    console.log(`${sheet}: PNG not found, skipping`);
  }
}

console.log("Done generating atlas JSONs");
