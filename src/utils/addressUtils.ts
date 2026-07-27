const PLUS_CODE_PREFIX = /^\s*[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}\s*,?\s*/i;

export function sanitizeAddressForDisplay(address?: string): string {
  const raw = typeof address === 'string' ? address.trim() : '';
  if (!raw) {
    return '';
  }

  if (!PLUS_CODE_PREFIX.test(raw)) {
    return raw;
  }

  const cleaned = raw.replace(PLUS_CODE_PREFIX, '').trim().replace(/^,\s*/, '');
  return cleaned;
}
