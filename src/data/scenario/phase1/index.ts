// Chapter 1 シナリオ統合エクスポート
export * from "./prologue";
export * from "./daily/shopDialogues";
export * from "./daily/npcDialogues";
export * from "./terminal/rumorTexts";
export * from "./terminal/intimidateTexts";
// climax types are defined in each route file, re-export from one
export type { ClimaxRoute, ClimaxScene } from "./climax/exileRoute";
export { exileRoute, exileLog } from "./climax/exileRoute";
export { subordinateRoute, subordinateLog } from "./climax/subordinateRoute";
export { balanceRoute, balanceLog } from "./climax/balanceRoute";
export * from "./epilogue";

// 便利な統合オブジェクト
import { prologue } from "./prologue";
import { shopCustomers, shopEndLog, shopEmptyText } from "./daily/shopDialogues";
import { npcDialogues } from "./daily/npcDialogues";
import { rumorTexts } from "./terminal/rumorTexts";
import { intimidateTexts, intimidateConfirmTemplate, intimidateExecutingText } from "./terminal/intimidateTexts";
import { exileRoute, exileLog } from "./climax/exileRoute";
import { subordinateRoute, subordinateLog } from "./climax/subordinateRoute";
import { balanceRoute, balanceLog } from "./climax/balanceRoute";
import { epilogueScenes, routeSpecificEpilogue } from "./epilogue";

export const phase1Scenario = {
  prologue,
  daily: {
    shopCustomers,
    shopEndLog,
    shopEmptyText,
    npcDialogues,
  },
  terminal: {
    rumorTexts,
    intimidateTexts,
    intimidateConfirmTemplate,
    intimidateExecutingText,
  },
  climax: {
    exileRoute,
    exileLog,
    subordinateRoute,
    subordinateLog,
    balanceRoute,
    balanceLog,
  },
  epilogue: {
    epilogueScenes,
    routeSpecificEpilogue,
  },
};