/* ===========================
   Filters - Predicates & Counts
   =========================== */

// Country groupings for location filter
const ASIA_COUNTRIES = ['taiwan', 'japan', 'south korea', 'korea', 'china'];
const ASIA_OTHER = ['singapore', 'hong kong', 'thailand', 'malaysia', 'indonesia', 'vietnam', 'philippines', 'india'];
const EUROPE_COUNTRIES = ['germany', 'france', 'united kingdom', 'uk', 'sweden', 'italy', 'spain', 'netherlands'];
const EUROPE_OTHER = ['austria', 'belgium', 'czech', 'denmark', 'finland', 'greece', 'hungary', 'ireland', 'norway', 'poland', 'portugal', 'russia', 'switzerland', 'ukraine'];
const AMERICAS_COUNTRIES = ['usa', 'united states', 'canada'];
const AMERICAS_OTHER = ['brazil', 'argentina', 'mexico', 'chile', 'colombia', 'peru'];

/**
 * Check if community styles match filter value
 * @param {Array} styles - Community's dance styles
 * @param {string} value - Filter value
 * @returns {boolean}
 */
export function matchesStyle(styles, value) {
  if (value === 'all') return true;
  if (!styles || !Array.isArray(styles)) return false;
  const val = value.toLowerCase();
  return styles.some(s => s.toLowerCase().includes(val));
}

/**
 * Check if community location matches filter value
 * @param {string} country - Community's country
 * @param {string} value - Filter value
 * @returns {boolean}
 */
export function matchesLocation(country, value) {
  if (value === 'all') return true;
  if (!country) return false;

  const countryLower = country.toLowerCase();

  // Handle "other" categories
  if (value === 'asia-other') {
    return !ASIA_COUNTRIES.includes(countryLower) &&
           ASIA_OTHER.some(c => countryLower.includes(c));
  }
  if (value === 'europe-other') {
    return !EUROPE_COUNTRIES.includes(countryLower) &&
           EUROPE_OTHER.some(c => countryLower.includes(c));
  }
  if (value === 'americas-other') {
    return !AMERICAS_COUNTRIES.includes(countryLower) &&
           AMERICAS_OTHER.some(c => countryLower.includes(c));
  }
  if (value === 'other') {
    const allKnown = [...ASIA_COUNTRIES, ...EUROPE_COUNTRIES, ...AMERICAS_COUNTRIES, 'australia', 'new zealand'];
    return !allKnown.some(c => countryLower.includes(c));
  }

  // Direct match
  return countryLower.includes(value.toLowerCase());
}

/**
 * Check if community's start date falls within date range
 * @param {string} startDate - Community's start date (YYYY-MM-DD)
 * @param {string} fromDate - Filter from date
 * @param {string} toDate - Filter to date
 * @returns {boolean}
 */
export function matchesDateRange(startDate, fromDate, toDate) {
  // If no date range specified, show all
  if (!fromDate && !toDate) return true;

  // Communities without dates only show when no date filter is applied
  if (!startDate) return false;

  const eventDate = new Date(startDate);

  // Check if date is valid
  if (isNaN(eventDate.getTime())) return false;

  // Check against range
  if (fromDate && toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return eventDate >= from && eventDate <= to;
  }
  if (fromDate) {
    const from = new Date(fromDate);
    return eventDate >= from;
  }
  if (toDate) {
    const to = new Date(toDate);
    return eventDate <= to;
  }

  return true;
}

/**
 * Check if entry matches type filter (all/community/festival/new)
 * @param {Object} entry - Community/festival entry
 * @param {string} value - Filter value
 * @returns {boolean}
 */
export function matchesType(entry, value) {
  if (value === 'all') return true;

  const entityType = entry.entityType;

  if (!entityType) return value === 'community'; // Default to community

  if (value === 'community') {
    return entityType === 'community' || entityType === 'hybrid';
  }
  if (value === 'festival') {
    return entityType === 'festival' || entityType === 'hybrid';
  }
  return true;
}

/**
 * Count entries matching a type filter
 * Uses the same matchesType predicate to ensure consistency
 * @param {Array} communities - All communities
 * @param {string} type - Type filter value
 * @returns {number}
 */
export function countByType(communities, type) {
  return communities.filter(c => matchesType(c, type)).length;
}

/**
 * Get label text for type filter
 * @param {string} type - Type filter value
 * @returns {string}
 */
export function getTypeLabel(type) {
  const labels = {
    all: 'results',
    community: 'communities',
    festival: 'festivals',
    new: 'new entries'
  };
  return labels[type] || 'results';
}
