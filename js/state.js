/* ===========================
   State - Single Source of Truth
   =========================== */

/**
 * Application state object
 * All UI state lives here, not in the DOM
 */
const state = {
  // Data
  communities: [],

  // Filters
  filters: {
    query: '',
    style: 'all',
    location: 'all',
    dateFrom: '',
    dateTo: '',
    type: 'all'
  },

  // Autocomplete UI state
  autocomplete: {
    highlightedIndex: -1
  }
};

/**
 * Get current state (read-only copy)
 * @returns {Object} Current state
 */
export function getState() {
  return state;
}

/**
 * Update filters
 * @param {Object} updates - Partial filter updates
 */
export function updateFilters(updates) {
  Object.assign(state.filters, updates);
}

/**
 * Reset all filters to defaults
 */
export function resetFilters() {
  state.filters = {
    query: '',
    style: 'all',
    location: 'all',
    dateFrom: '',
    dateTo: '',
    type: 'all'
  };
  state.autocomplete.highlightedIndex = -1;
}

/**
 * Set communities data
 * @param {Array} communities - Communities array
 */
export function setCommunities(communities) {
  state.communities = communities;
}

/**
 * Update communities (e.g., after toggle verified)
 * @param {Function} updateFn - Function that takes communities and returns updated communities
 */
export function updateCommunities(updateFn) {
  state.communities = updateFn(state.communities);
}

/**
 * Set autocomplete highlighted index
 * @param {number} index - Highlighted index (-1 for none)
 */
export function setHighlightedIndex(index) {
  state.autocomplete.highlightedIndex = index;
}

/**
 * Get autocomplete highlighted index
 * @returns {number}
 */
export function getHighlightedIndex() {
  return state.autocomplete.highlightedIndex;
}
