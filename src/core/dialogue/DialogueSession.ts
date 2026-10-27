import { findNearestNpc } from "./proximity";

export interface DialogueSessionState {
  id: string;
  isOpen: boolean;
  currentNpcId: string | null;
}

export function createDialogueSession(): DialogueSessionState {
  return { id: "dialogue_session_1", isOpen: false, currentNpcId: null };
}

export function openDialogue(
  session: DialogueSessionState,
  npcs: readonly { id: string; x: number }[],
  playerX: number,
  range: number = 64,
): DialogueSessionState {
  const nearestId = findNearestNpc(playerX, npcs, range);
  session.isOpen = nearestId !== null;
  session.currentNpcId = nearestId;
  return session;
}

export function closeDialogue(session: DialogueSessionState): DialogueSessionState {
  session.isOpen = false;
  session.currentNpcId = null;
  return session;
}
