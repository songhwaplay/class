export function targetQuestion(label: string) {
  const trimmed = label.trim();
  if (/[?？]$/.test(trimmed)) return trimmed;
  const last = trimmed.at(-1);
  if (!last) return "구하는 값은?";
  const code = last.charCodeAt(0);
  const hasFinalConsonant = code >= 0xac00 && code <= 0xd7a3
    ? (code - 0xac00) % 28 !== 0
    : false;
  return `${trimmed}${hasFinalConsonant ? "은" : "는"}?`;
}
