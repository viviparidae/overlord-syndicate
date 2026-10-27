export interface DialogueOption {
  text: string;
  action: string;
  nextId?: string;
}

export interface DialogueEntry {
  id: string;
  speaker: string;
  text: string;
  options?: DialogueOption[];
}

export type ResolvedEffect =
  | { kind: "action"; actionId: string }
  | { kind: "scene"; sceneId: string }
  | { kind: "close" };

export function resolveOption(option: DialogueOption): ResolvedEffect {
  // データ側の選択肢を core 側で解決。バランス変更に対応できるよう純粋関数にする。
  if (option.action === "leave") {
    return { kind: "close" };
  }
  if (option.action === "enterShop") {
    return { kind: "scene", sceneId: "shop" };
  }
  if (option.action === "spreadRumorWithWork") {
    // 既存データでは裏工作を表すアクション名。UI 側で terminal にマッピングする。
    // core はアクション名をそのまま返す（UI 側で解釈を持つ）。
    return { kind: "action", actionId: "spreadRumorWithWork" };
  }
  if (
    option.action === "spreadRumor" ||
    option.action === "intimidate" ||
    option.action === "runShop"
  ) {
    return { kind: "action", actionId: option.action };
  }
  // 未知のアクションは安全側に倒して close にする。
  return { kind: "close" };
}
