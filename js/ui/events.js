/* ===========================
   UI Events - State-Driven Rendering
   =========================== */

import { fetchCommunities, applyVerifiedStatus, toggleVerified } from '../dataService.js';
import { countByType, getTypeLabel } from '../filters.js';
import { getFilteredCommunities, getSuggestions } from '../logic.js';
import { renderCard, renderSuggestion } from '../components.js';
import {
  getState,
  updateFilters,
  resetFilters,
  setCommunities,
  updateCommunities,
  setHighlightedIndex,
  getHighlightedIndex
} from '../state.js';

// DOM element references (cached once at startup)
const elements = {
  citySearch: document.getElementById('citySearch'),
  searchSuggestions: document.getElementById('searchSuggestions'),
  styleFilter: document.getElementById('styleFilter'),
  locationFilter: document.getElementById('locationFilter'),
  dateFrom: document.getElementById('dateFrom'),
  dateTo: document.getElementById('dateTo'),
  typeToggle: document.getElementById('typeToggle'),
  resetFilters: document.getElementById('resetFilters'),
  mainList: document.getElementById('mainList'),
  resultsSummary: document.getElementById('resultsSummary')
};

/* ===========================
   DATA LOADING
   =========================== */

async function loadData() {
  try {
    showLoadingState();
    const data = await fetchCommunities();
    setCommunities(applyVerifiedStatus(data));
    render();
  } catch (error) {
    console.error('Error loading data:', error);
    showErrorState('Failed to load data. Please refresh the page or check your connection.');
  }
}

/* ===========================
   UI STATE
   =========================== */

function showLoadingState() {
  if (elements.mainList) {
    elements.mainList.innerHTML = '<div class="loading">Loading...</div>';
  }
}

function showErrorState(message) {
  if (elements.mainList) {
    elements.mainList.innerHTML = `<div class="error">${message}</div>`;
  }
}

/* ===========================
   RENDERING (State-Driven)
   =========================== */

/**
 * Main render function
 * Reads ONLY from state, never from DOM
 */
function render() {
  const state = getState();
  const { communities, filters } = state;

  // Get filtered and sorted communities using pure logic
  const filtered = getFilteredCommunities(communities, filters);

  // Update results summary
  updateResultsSummary(filtered.length, communities, filters.type);

  // Render main list
  if (elements.mainList) {
    elements.mainList.innerHTML = filtered.length
      ? filtered.map(c => renderCard(c)).join('')
      : '<div class="empty">No results match your search.</div>';
  }
}

/**
 * Update results summary text
 * @param {number} shown - Number of results shown
 * @param {Array} communities - All communities
 * @param {string} type - Current type filter
 */
function updateResultsSummary(shown, communities, type) {
  if (!elements.resultsSummary) return;

  const typeTotal = countByType(communities, type);
  const typeText = getTypeLabel(type);

  if (shown === typeTotal) {
    elements.resultsSummary.innerHTML = `Showing <strong>${shown}</strong> ${typeText}`;
  } else {
    elements.resultsSummary.innerHTML = `Showing <strong>${shown}</strong> of ${typeTotal} ${typeText}`;
  }
}

/* ===========================
   SEARCH AUTOCOMPLETE
   =========================== */

function updateSuggestions() {
  if (!elements.searchSuggestions || !elements.citySearch) return;

  const state = getState();
  const suggestions = getSuggestions(state.communities, state.filters.query);

  if (suggestions.length === 0) {
    hideSuggestions();
    return;
  }

  elements.searchSuggestions.innerHTML = suggestions.map((c, index) => renderSuggestion(c, index)).join('');
  elements.searchSuggestions.classList.add('active');
  setHighlightedIndex(-1);
}

function hideSuggestions() {
  if (elements.searchSuggestions) {
    elements.searchSuggestions.classList.remove('active');
    elements.searchSuggestions.innerHTML = '';
  }
  setHighlightedIndex(-1);
}

function selectSuggestion(name) {
  updateFilters({ query: name });
  syncFilterToDOM('query', name);
  hideSuggestions();
  render();
}

function handleSuggestionKeydown(e) {
  if (!elements.searchSuggestions || !elements.searchSuggestions.classList.contains('active')) return;

  const items = elements.searchSuggestions.querySelectorAll('li');
  if (items.length === 0) return;

  const currentIndex = getHighlightedIndex();

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const newIndex = Math.min(currentIndex + 1, items.length - 1);
    setHighlightedIndex(newIndex);
    updateHighlight(items, newIndex);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const newIndex = Math.max(currentIndex - 1, 0);
    setHighlightedIndex(newIndex);
    updateHighlight(items, newIndex);
  } else if (e.key === 'Enter' && currentIndex >= 0) {
    e.preventDefault();
    const selected = items[currentIndex];
    if (selected) {
      selectSuggestion(selected.dataset.name);
    }
  } else if (e.key === 'Escape') {
    hideSuggestions();
  }
}

function updateHighlight(items, highlightedIndex) {
  items.forEach((item, index) => {
    item.classList.toggle('highlighted', index === highlightedIndex);
  });
}

/* ===========================
   STATE <-> DOM SYNC
   =========================== */

/**
 * Sync a filter value back to its DOM element
 * Used when state changes programmatically (e.g., selecting suggestion)
 */
function syncFilterToDOM(filterName, value) {
  switch (filterName) {
    case 'query':
      if (elements.citySearch) elements.citySearch.value = value;
      break;
    case 'style':
      if (elements.styleFilter) elements.styleFilter.value = value;
      break;
    case 'location':
      if (elements.locationFilter) elements.locationFilter.value = value;
      break;
    case 'dateFrom':
      if (elements.dateFrom) elements.dateFrom.value = value;
      break;
    case 'dateTo':
      if (elements.dateTo) elements.dateTo.value = value;
      break;
    case 'type':
      if (elements.typeToggle) {
        elements.typeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.value === value);
        });
      }
      break;
  }
}

/**
 * Sync all filters to DOM (used after reset)
 */
function syncAllFiltersToDOM() {
  const state = getState();
  syncFilterToDOM('query', state.filters.query);
  syncFilterToDOM('style', state.filters.style);
  syncFilterToDOM('location', state.filters.location);
  syncFilterToDOM('dateFrom', state.filters.dateFrom);
  syncFilterToDOM('dateTo', state.filters.dateTo);
  syncFilterToDOM('type', state.filters.type);
}

/* ===========================
   EVENT LISTENERS
   =========================== */

// Type toggle buttons
if (elements.typeToggle) {
  elements.typeToggle.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-btn')) {
      elements.typeToggle.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      updateFilters({ type: e.target.dataset.value });
      render();
    }
  });
}

// Search input
if (elements.citySearch) {
  elements.citySearch.addEventListener('input', (e) => {
    updateFilters({ query: e.target.value });
    updateSuggestions();
    render();
  });
  elements.citySearch.addEventListener('keydown', handleSuggestionKeydown);
  elements.citySearch.addEventListener('blur', () => {
    setTimeout(hideSuggestions, 150);
  });
}

// Click on suggestion
if (elements.searchSuggestions) {
  elements.searchSuggestions.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (li) {
      selectSuggestion(li.dataset.name);
    }
  });
}

// Style filter
if (elements.styleFilter) {
  elements.styleFilter.addEventListener('change', (e) => {
    updateFilters({ style: e.target.value });
    render();
  });
}

// Location filter
if (elements.locationFilter) {
  elements.locationFilter.addEventListener('change', (e) => {
    updateFilters({ location: e.target.value });
    render();
  });
}

// Date filters
if (elements.dateFrom) {
  elements.dateFrom.addEventListener('change', (e) => {
    updateFilters({ dateFrom: e.target.value });
    render();
  });
}

if (elements.dateTo) {
  elements.dateTo.addEventListener('change', (e) => {
    updateFilters({ dateTo: e.target.value });
    render();
  });
}

// Reset button
if (elements.resetFilters) {
  elements.resetFilters.addEventListener('click', () => {
    resetFilters();
    syncAllFiltersToDOM();
    render();
  });
}

// Delegated click handler for verify buttons (event delegation, no inline onclick)
if (elements.mainList) {
  elements.mainList.addEventListener('click', (e) => {
    const verifyBtn = e.target.closest('.verify-btn');
    if (verifyBtn) {
      const username = verifyBtn.dataset.username;
      if (username) {
        updateCommunities(communities => toggleVerified(communities, username));
        render();
      }
    }
  });
}

/* ===========================
   INITIALIZATION
   =========================== */

document.addEventListener('DOMContentLoaded', loadData);
