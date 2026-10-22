export function extractNumber(text: string | null | undefined): number {
  const raw = text ?? "";
  return parseInt(raw.replace(/\D+/g, ""), 10);
}
