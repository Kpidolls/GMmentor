const greekToLatinSingleChar: Record<string, string> = {
  α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th',
  ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p',
  ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o',
};

const greekToLatinPairs: Array<[string, string]> = [
  ['αι', 'ai'],
  ['ει', 'ei'],
  ['οι', 'oi'],
  ['ου', 'ou'],
  ['αυ', 'av'],
  ['ευ', 'ev'],
  ['γγ', 'ng'],
  ['γκ', 'gk'],
  ['μπ', 'mp'],
  ['ντ', 'nt'],
  ['τσ', 'ts'],
  ['τζ', 'tz'],
];

function removeGreekAccents(value: string): string {
  return value
    .replace(/ά/g, 'α')
    .replace(/έ/g, 'ε')
    .replace(/ή/g, 'η')
    .replace(/ί/g, 'ι')
    .replace(/ό/g, 'ο')
    .replace(/ύ/g, 'υ')
    .replace(/ώ/g, 'ω')
    .replace(/ϊ/g, 'ι')
    .replace(/ΐ/g, 'ι')
    .replace(/ϋ/g, 'υ')
    .replace(/ΰ/g, 'υ');
}

export function transliterateGreekToLatin(value: string): string {
  let normalized = removeGreekAccents(value.toLowerCase());

  for (const [pair, latin] of greekToLatinPairs) {
    normalized = normalized.replace(new RegExp(pair, 'g'), latin);
  }

  return Array.from(normalized)
    .map((char) => greekToLatinSingleChar[char] ?? char)
    .join('');
}

export function normalizeForLookup(value: string): string {
  return transliterateGreekToLatin(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function slugifyIntent(value: string): string {
  const normalized = normalizeForLookup(value);
  return normalized || 'item';
}

export function stripHashSuffixFromSlug(slug: string): string {
  return slug.replace(/-[0-9a-f]{4,8}$/i, '');
}
