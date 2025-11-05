// utils/normalizers.ts
export function normalizeInstructions(raw: unknown): string[] {
  // raw может прийти как string или как array
  if (!raw) return [];

  let parsed: unknown = raw;

  // Если пришла строка, попробуем JSON.parse,
  // иначе считаем, что это уже массив
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      // fallback: обернём в массив
      parsed = [raw];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed
      .map(step => String(step).trim())
      .filter(Boolean);
  }

  return [String(parsed).trim()];
}
