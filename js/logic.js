/* ===========================
   Logic - Pure Functions (No DOM)
   =========================== */

import { matchesStyle, matchesLocation, matchesDateRange, matchesType } from './filters.js';

/**
 * Filter communities based on filter state
 * Pure function - no DOM access
 *
 * @param {Array} communities - All communities
 * @param {Object} filters - Filter state object
 * @returns {Array} Filtered communities
 */
export function filterCommunities(communities, filters) {
  const { query, style, location, dateFrom, dateTo, type } = filters;
  const term = (query || '').trim().toLowerCase();

  return communities.filter(c => {
    const cityText = (c.city || '').toLowerCase();
    const countryText = (c.country || '').toLowerCase();
    const nameText = (c.name || '').toLowerCase();

    const matchesTerm = term === '' ||
      cityText.includes(term) ||
      countryText.includes(term) ||
      nameText.includes(term);

    return matchesTerm &&
      matchesStyle(c.styles, style) &&
      matchesLocation(c.country, location) &&
      matchesDateRange(c.startDate, dateFrom, dateTo) &&
      matchesType(c, type);
  });
}

/**
 * Sort communities based on context
 * Pure function - no DOM access
 *
 * @param {Array} communities - Communities to sort
 * @param {Object} filters - Filter state (to determine sort mode)
 * @returns {Array} Sorted communities (new array)
 */
export function sortCommunities(communities, filters) {
  const { dateFrom, dateTo, type } = filters;
  const hasDateFilter = dateFrom || dateTo;

  return [...communities].sort((a, b) => {
    // If filtering by date or festivals, sort by date (soonest first)
    if (hasDateFilter || type === 'festival') {
      const dateA = a.startDate ? new Date(a.startDate) : new Date('9999-12-31');
      const dateB = b.startDate ? new Date(b.startDate) : new Date('9999-12-31');
      return dateA - dateB;
    }
    // Otherwise sort by city name
    return (a.city || 'ZZZ').localeCompare(b.city || 'ZZZ');
  });
}

/**
 * Get search suggestions based on query
 * Pure function - no DOM access
 *
 * @param {Array} communities - All communities
 * @param {string} query - Search query
 * @param {number} limit - Max suggestions (default 8)
 * @returns {Array} Matching communities
 */
export function getSuggestions(communities, query, limit = 8) {
  const term = (query || '').trim().toLowerCase();

  if (term.length < 1) {
    return [];
  }

  return communities.filter(c => {
    const nameText = (c.name || '').toLowerCase();
    const cityText = (c.city || '').toLowerCase();
    const countryText = (c.country || '').toLowerCase();
    return nameText.includes(term) || cityText.includes(term) || countryText.includes(term);
  }).slice(0, limit);
}

/**
 * Apply filter and sort pipeline
 * Convenience function that combines filtering and sorting
 *
 * @param {Array} communities - All communities
 * @param {Object} filters - Filter state object
 * @returns {Array} Filtered and sorted communities
 */
export function getFilteredCommunities(communities, filters) {
  const filtered = filterCommunities(communities, filters);
  return sortCommunities(filtered, filters);
}

/**
 * Filter out past events from an array
 * Defensive filter to ensure stale data doesn't show past events
 *
 * @param {Array} events - Array of event objects with date field (YYYY-MM-DD)
 * @returns {Array} Future events only (today or later)
 */
export function filterFutureEvents(events) {
  if (!events || !Array.isArray(events)) return [];

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return events.filter(e => e.date && e.date >= today);
}
