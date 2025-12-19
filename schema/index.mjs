/**
 * ESM entry point for frontend use
 *
 * This re-exports from the CommonJS index.js using dynamic import.
 * For browser environments without Node.js require().
 */

// ============================================
// ENUM ARRAYS (inline for ESM compatibility)
// ============================================

export const ENTITY_TYPES = [
  'community',
  'festival',
  'hybrid',
  'instructor',
  'venue',
  'vendor',
  'band',
  'dj',
  'media',
  'association'
];

export const EVENT_TYPES = [
  'social',
  'class',
  'workshop',
  'party',
  'festival',
  'trial',
  'other'
];

export const STYLE_CODES = [
  'lindy',
  'bal',
  'balboa',
  'blues',
  'solo',
  'shag',
  'charleston',
  'wcs'
];

export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'];

// ============================================
// VALIDATION HELPERS (pure JS, no Zod dependency)
// ============================================

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Normalize an event - fills defaults, never throws.
 * @param {unknown} data
 * @returns {object}
 */
export function normalizeEvent(data) {
  const input = data && typeof data === 'object' ? data : {};

  const date = typeof input.date === 'string' && DATE_REGEX.test(input.date)
    ? input.date
    : '1970-01-01';

  const type = EVENT_TYPES.includes(input.type) ? input.type : 'other';

  return {
    date,
    title: input.title || 'Unknown Event',
    type,
    sourceUrl: typeof input.sourceUrl === 'string' ? input.sourceUrl : undefined
  };
}

/**
 * Normalize scraped data - fills defaults, never throws.
 * @param {unknown} data
 * @returns {object}
 */
export function normalizeScraped(data) {
  const input = data && typeof data === 'object' ? data : {};

  return {
    lastScraped: input.lastScraped,
    confidence: CONFIDENCE_LEVELS.includes(input.confidence)
      ? input.confidence
      : undefined,
    regularSchedule: input.regularSchedule,
    scheduleDetected: input.scheduleDetected,
    scheduleDescription: input.scheduleDescription,
    upcomingEvents: Array.isArray(input.upcomingEvents)
      ? input.upcomingEvents.map(normalizeEvent)
      : [],
    upcomingDates: Array.isArray(input.upcomingDates)
      ? input.upcomingDates
      : []
  };
}

/**
 * Normalize a community - fills defaults, never throws.
 * @param {unknown} data
 * @returns {object}
 */
export function normalizeCommunity(data) {
  const input = data && typeof data === 'object' ? data : {};

  const entityType = ENTITY_TYPES.includes(input.entityType)
    ? input.entityType
    : 'community';

  const styles = Array.isArray(input.styles)
    ? input.styles.filter(s => STYLE_CODES.includes(s))
    : [];

  return {
    name: input.name || 'Unknown',
    city: input.city || 'Unknown',
    country: input.country || 'Unknown',
    username: input.username,
    entityType,
    verified: Boolean(input.verified),
    instagram: input.instagram,
    website: input.website,
    linktree: input.linktree,
    email: input.email,
    social: input.social,
    styles,
    notes: input.notes,
    region: input.region,
    source: input.source,
    followers: typeof input.followers === 'number' ? input.followers : undefined,
    startDate: input.startDate,
    endDate: input.endDate,
    dates: input.dates,
    festivalDates: input.festivalDates,
    festival: input.festival,
    scraped: normalizeScraped(input.scraped)
  };
}

/**
 * Normalize an array of communities.
 * @param {unknown[]} communities
 * @returns {object[]}
 */
export function normalizeCommunities(communities) {
  if (!Array.isArray(communities)) return [];
  return communities.map(normalizeCommunity);
}

