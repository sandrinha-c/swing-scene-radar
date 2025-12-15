/* ===========================
   UI Events - State, Listeners, Render
   =========================== */

import { fetchCommunities, applyVerifiedStatus, toggleVerified } from '../dataService.js';
import { matchesStyle, matchesLocation, matchesDateRange, matchesType, countByType, getTypeLabel } from '../filters.js';
import { renderCard, renderSuggestion } from '../components.js';

// Application state
let communities = [];
let currentType = 'all';
let highlightedIndex = -1;

// DOM element references
const citySearch = document.getElementById('citySearch');
const searchSuggestions = document.getElementById('searchSuggestions');
const styleFilter = document.getElementById('styleFilter');
const locationFilter = document.getElementById('locationFilter');
const dateFrom = document.getElementById('dateFrom');
const dateTo = document.getElementById('dateTo');
const typeToggle = document.getElementById('typeToggle');
const resetFilters = document.getElementById('resetFilters');
const mainList = document.getElementById('mainList');
const resultsSummary = document.getElementById('resultsSummary');

/* ===========================
   DATA LOADING
   =========================== */

async function loadData() {
  try {
    showLoadingState();
    const data = await fetchCommunities();
    communities = applyVerifiedStatus(data);
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
  if (mainList) mainList.innerHTML = '<div class="loading">Loading...</div>';
}

function showErrorState(message) {
  if (mainList) mainList.innerHTML = `<div class="error">${message}</div>`;
}

/* ===========================
   RENDERING
   =========================== */

function render() {
  const term = citySearch ? citySearch.value.trim().toLowerCase() : '';
  const style = styleFilter ? styleFilter.value : 'all';
  const location = locationFilter ? locationFilter.value : 'all';
  const fromDate = dateFrom ? dateFrom.value : '';
  const toDate = dateTo ? dateTo.value : '';
  const hasDateFilter = fromDate || toDate;

  // Filter communities
  let filtered = communities.filter(c => {
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
      matchesDateRange(c.startDate, fromDate, toDate) &&
      matchesType(c, currentType);
  });

  // Sort: festivals by startDate (soonest first), communities by city
  filtered.sort((a, b) => {
    if (hasDateFilter || currentType === 'festival') {
      const dateA = a.startDate ? new Date(a.startDate) : new Date('9999-12-31');
      const dateB = b.startDate ? new Date(b.startDate) : new Date('9999-12-31');
      return dateA - dateB;
    }
    return (a.city || 'ZZZ').localeCompare(b.city || 'ZZZ');
  });

  // Update results summary
  updateResultsSummary(filtered.length);

  // Render main list
  if (mainList) {
    mainList.innerHTML = filtered.length
      ? filtered.map(c => renderCard(c)).join('')
      : '<div class="empty">No results match your search.</div>';
  }
}

function updateResultsSummary(shown) {
  if (!resultsSummary) return;

  const typeTotal = countByType(communities, currentType);
  const typeText = getTypeLabel(currentType);

  if (shown === typeTotal) {
    resultsSummary.innerHTML = `Showing <strong>${shown}</strong> ${typeText}`;
  } else {
    resultsSummary.innerHTML = `Showing <strong>${shown}</strong> of ${typeTotal} ${typeText}`;
  }
}

/* ===========================
   SEARCH AUTOCOMPLETE
   =========================== */

function updateSuggestions() {
  if (!searchSuggestions || !citySearch) return;

  const term = citySearch.value.trim().toLowerCase();

  if (term.length < 1) {
    hideSuggestions();
    return;
  }

  const matches = communities.filter(c => {
    const nameText = (c.name || '').toLowerCase();
    const cityText = (c.city || '').toLowerCase();
    const countryText = (c.country || '').toLowerCase();
    return nameText.includes(term) || cityText.includes(term) || countryText.includes(term);
  }).slice(0, 8);

  if (matches.length === 0) {
    hideSuggestions();
    return;
  }

  searchSuggestions.innerHTML = matches.map((c, index) => renderSuggestion(c, index)).join('');
  searchSuggestions.classList.add('active');
  highlightedIndex = -1;
}

function hideSuggestions() {
  if (searchSuggestions) {
    searchSuggestions.classList.remove('active');
    searchSuggestions.innerHTML = '';
  }
  highlightedIndex = -1;
}

function selectSuggestion(name) {
  if (citySearch) {
    citySearch.value = name;
  }
  hideSuggestions();
  render();
}

function handleSuggestionKeydown(e) {
  if (!searchSuggestions || !searchSuggestions.classList.contains('active')) return;

  const items = searchSuggestions.querySelectorAll('li');
  if (items.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
    updateHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedIndex = Math.max(highlightedIndex - 1, 0);
    updateHighlight(items);
  } else if (e.key === 'Enter' && highlightedIndex >= 0) {
    e.preventDefault();
    const selected = items[highlightedIndex];
    if (selected) {
      selectSuggestion(selected.dataset.name);
    }
  } else if (e.key === 'Escape') {
    hideSuggestions();
  }
}

function updateHighlight(items) {
  items.forEach((item, index) => {
    item.classList.toggle('highlighted', index === highlightedIndex);
  });
}

/* ===========================
   VERIFIED TOGGLE HANDLER
   =========================== */

function handleVerifyClick(username) {
  communities = toggleVerified(communities, username);
  render();
}

/* ===========================
   EVENT LISTENERS
   =========================== */

// Type toggle buttons
if (typeToggle) {
  typeToggle.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-btn')) {
      typeToggle.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentType = e.target.dataset.value;
      render();
    }
  });
}

// Search autocomplete listeners
if (citySearch) {
  citySearch.addEventListener('input', () => {
    updateSuggestions();
    render();
  });
  citySearch.addEventListener('keydown', handleSuggestionKeydown);
  citySearch.addEventListener('blur', () => {
    setTimeout(hideSuggestions, 150);
  });
}

// Click on suggestion
if (searchSuggestions) {
  searchSuggestions.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (li) {
      selectSuggestion(li.dataset.name);
    }
  });
}

// Other filter listeners
[styleFilter, locationFilter, dateFrom, dateTo].filter(el => el).forEach(el => {
  el.addEventListener('input', render);
  el.addEventListener('change', render);
});

// Reset button
if (resetFilters) {
  resetFilters.addEventListener('click', () => {
    if (citySearch) citySearch.value = '';
    if (styleFilter) styleFilter.value = 'all';
    if (locationFilter) locationFilter.value = 'all';
    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';

    currentType = 'all';
    if (typeToggle) {
      typeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === 'all');
      });
    }

    render();
  });
}

// Delegated click handler for verify buttons (no inline onclick)
if (mainList) {
  mainList.addEventListener('click', (e) => {
    const verifyBtn = e.target.closest('.verify-btn');
    if (verifyBtn) {
      const username = verifyBtn.dataset.username;
      if (username) {
        handleVerifyClick(username);
      }
    }
  });
}

/* ===========================
   INITIALIZATION
   =========================== */

document.addEventListener('DOMContentLoaded', loadData);
