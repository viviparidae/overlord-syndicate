export interface DialogueEntry {
  id: string;
  speaker: string;
  text: string;
  options?: DialogueOption[];
}

export interface DialogueOption {
  text: string;
  action: string;
  nextId?: string;
}

export interface EventEntry {
  id: string;
  title: string;
  description: string;
  trigger: string;
  effect: {
    resources: { funds?: number; fear?: number; faith?: number; suspect?: number };
    phaseAdvance?: boolean;
  };
}
