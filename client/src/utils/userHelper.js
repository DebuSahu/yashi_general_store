/**
 * User and Gmail Name Extraction Helpers
 * Extracts clean human names and first names from user objects or Gmail addresses.
 */

export function getUserFirstName(user) {
  if (!user) return '';

  // 1. If explicit display name is provided, extract only the first name
  if (user.name && typeof user.name === 'string' && user.name.trim()) {
    const trimmed = user.name.trim();
    if (!trimmed.includes('@')) {
      const firstWord = trimmed.split(/\s+/)[0];
      const cleanWord = firstWord.replace(/\d+$/g, '').trim();
      if (cleanWord.length > 0) {
        if (cleanWord.toLowerCase().startsWith('debu')) return 'Debu';
        return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
      }
    }
  }

  // 2. Fetch / extract from Gmail address
  const email = (typeof user === 'string' ? user : user.email) || '';
  if (email && email.includes('@')) {
    const local = email.split('@')[0];
    const firstPart = local.split(/[._\-+]/)[0];
    let candidate = firstPart.replace(/\d+$/g, '').trim();
    if (!candidate) {
      candidate = local.replace(/\d+$/g, '').trim();
    }
    if (candidate) {
      if (candidate.toLowerCase().startsWith('debu')) return 'Debu';
      return candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
    }
  }

  return 'Customer';
}

export function extractFullNameFromEmail(email) {
  if (!email || !email.includes('@')) return 'Customer';
  const local = email.split('@')[0];
  if (local.toLowerCase().startsWith('debu')) return 'Debu Sahu';
  const cleaned = local.replace(/[._\-+]/g, ' ').replace(/\d+/g, '').trim();
  if (!cleaned) return 'Customer';
  return cleaned
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

