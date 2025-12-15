/* ===========================
   Frontend Schemas - ES Module version
   Mirrors backend/lib/schemas.js for browser use
   =========================== */

// Valid enum values (matching backend/lib/schemas.js)
const VALID_EVENT_TYPES = ['social', 'class', 'workshop', 'party', 'festival', 'trial', 'other'];
const VALID_ENTITY_TYPES = ['community', 'festival', 'hybrid', 'instructor', 'venue', 'vendor', 'band', 'dj', 'media', 'association'];
const VALID_STYLES = ['lindy', 'bal', 'balboa', 'blues', 'solo', 'shag', 'charleston', 'wcs'];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Normalize an event (fills defaults, never throws)
 * @param {unknown} data - Raw event data
 * @returns {Object} Normalized event
 */
export function normalizeEvent(data) {
  const input = data && typeof data === 'object' ? data : {};

  const date = typeof input.date === 'string' && DATE_REGEX.test(input.date)
    ? input.date
    : '1970-01-01'; // Placeholder - will be filtered as past

  const type = VALID_EVENT_TYPES.includes(input.type) ? input.type : 'other';

  return {
    date,
    title: input.title || 'Unknown Event',
    type,
    sourceUrl: typeof input.sourceUrl === 'string' ? input.sourceUrl : undefined
  };
}

/**
 * Normalize a community (fills defaults, never throws)
 * @param {unknown} data - Raw community data
 * @returns {Object} Normalized community
 */
export function normalizeCommunity(data) {
  const input = data && typeof data === 'object' ? data : {};

  const entityType = VALID_ENTITY_TYPES.includes(input.entityType)
    ? input.entityType
    : 'community';

  const styles = Array.isArray(input.styles)
    ? input.styles.filter(s => VALID_STYLES.includes(s))
    : [];

  const scraped = input.scraped && typeof input.scraped === 'object'
    ? input.scraped
    : {};

  const upcomingEvents = Array.isArray(scraped.upcomingEvents)
    ? scraped.upcomingEvents.map(normalizeEvent)
    : [];

  return {
    username: input.username || 'unknown',
    name: input.name || 'Unknown',
    city: input.city || 'Unknown',
    country: input.country || 'Unknown',
    entityType,
    verified: Boolean(input.verified),
    styles,
    social: input.social,
    notes: input.notes,
    instagram: input.instagram,
    website: input.website,
    linktree: input.linktree,
    startDate: input.startDate,
    dates: input.dates,
    festivalDates: input.festivalDates,
    festival: input.festival,
    scraped: {
      lastScraped: scraped.lastScraped,
      confidence: scraped.confidence,
      scheduleDetected: scraped.scheduleDetected,
      scheduleDescription: scraped.scheduleDescription,
      upcomingEvents,
      upcomingDates: Array.isArray(scraped.upcomingDates) ? scraped.upcomingDates : []
    }
  };
}

/**
 * Normalize an array of communities
 * @param {unknown[]} communities - Raw communities array
 * @returns {Object[]} Normalized communities
 */
export function normalizeCommunities(communities) {
  if (!Array.isArray(communities)) return [];
  return communities.map(normalizeCommunity);
}
