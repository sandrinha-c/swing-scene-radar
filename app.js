/* ===========================
   Swing Scene Radar - App Logic
   =========================== */

// Global data object (will be populated from JSON files)
let data = {
  communities: []
};

// Current filter state
let currentType = 'all';

// DOM element references
const citySearch = document.getElementById("citySearch");
const searchSuggestions = document.getElementById("searchSuggestions");
const styleFilter = document.getElementById("styleFilter");
const locationFilter = document.getElementById("locationFilter");
const dateFrom = document.getElementById("dateFrom");
const dateTo = document.getElementById("dateTo");
const typeToggle = document.getElementById("typeToggle");
const resetFilters = document.getElementById("resetFilters");
const mainList = document.getElementById("mainList");
const resultsSummary = document.getElementById("resultsSummary");

// Autocomplete state
let highlightedIndex = -1;

/* ===========================
   DATA LOADING
   =========================== */

async function loadData() {
  try {
    showLoadingState();

    // Load communities.json (single source of truth)
    const response = await fetch('data/communities.json');

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const communitiesData = await response.json();
    data.communities = communitiesData.communities || [];

    // Load verification status from localStorage
    loadVerifiedStatus();

    // Initial render
    render();
  } catch (error) {
    console.error('Error loading data:', error);
    showErrorState('Failed to load data. Please refresh the page or check your connection.');
  }
}

/* ===========================
   UI STATE MANAGEMENT
   =========================== */

function showLoadingState() {
  if (mainList) mainList.innerHTML = '<div class="loading">Loading...</div>';
}

function showErrorState(message) {
  if (mainList) mainList.innerHTML = `<div class="error">${message}</div>`;
}

/* ===========================
   VERIFICATION HELPERS
   =========================== */

// Load verified status from localStorage
function loadVerifiedStatus() {
  try {
    const verified = JSON.parse(localStorage.getItem('verifiedCommunities') || '{}');
    // Apply to data
    data.communities.forEach(c => {
      if (verified[c.username]) {
        c.verified = true;
      }
    });
  } catch (e) {
    console.error('Error loading verified status:', e);
  }
}

// Save verified status to localStorage
function saveVerifiedStatus(username, isVerified) {
  try {
    const verified = JSON.parse(localStorage.getItem('verifiedCommunities') || '{}');
    if (isVerified) {
      verified[username] = true;
    } else {
      delete verified[username];
    }
    localStorage.setItem('verifiedCommunities', JSON.stringify(verified));
  } catch (e) {
    console.error('Error saving verified status:', e);
  }
}

// Toggle verified status (called from button onclick)
function toggleVerified(username) {
  const community = data.communities.find(c => c.username === username);
  if (community) {
    community.verified = !community.verified;
    saveVerifiedStatus(username, community.verified);
    render();
  }
}

/* ===========================
   FILTER HELPERS
   =========================== */

const matchesStyle = (styles, value) => {
  if (value === "all") return true;
  if (!styles || !Array.isArray(styles)) return false;
  return styles.some(s => s.toLowerCase().includes(value));
};

// Location filter matching
const matchesLocation = (country, value) => {
  if (value === "all") return true;
  if (!country) return false;

  const countryLower = country.toLowerCase();

  // Handle "other" categories
  const asiaCountries = ['taiwan', 'japan', 'south korea', 'korea', 'china'];
  const europeCountries = ['germany', 'france', 'united kingdom', 'uk', 'sweden', 'italy', 'spain', 'netherlands'];
  const americasCountries = ['usa', 'united states', 'canada'];

  if (value === 'asia-other') {
    return !asiaCountries.includes(countryLower) &&
           ['singapore', 'hong kong', 'thailand', 'malaysia', 'indonesia', 'vietnam', 'philippines', 'india'].some(c => countryLower.includes(c));
  }
  if (value === 'europe-other') {
    return !europeCountries.includes(countryLower) &&
           ['austria', 'belgium', 'czech', 'denmark', 'finland', 'greece', 'hungary', 'ireland', 'norway', 'poland', 'portugal', 'russia', 'switzerland', 'ukraine'].some(c => countryLower.includes(c));
  }
  if (value === 'americas-other') {
    return !americasCountries.includes(countryLower) &&
           ['brazil', 'argentina', 'mexico', 'chile', 'colombia', 'peru'].some(c => countryLower.includes(c));
  }
  if (value === 'other') {
    // Anything not in the main regions
    const allKnown = [...asiaCountries, ...europeCountries, ...americasCountries, 'australia', 'new zealand'];
    return !allKnown.some(c => countryLower.includes(c));
  }

  // Direct match
  return countryLower.includes(value.toLowerCase());
};

// Date range filter matching
const matchesDateRange = (startDate, fromDate, toDate) => {
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
};

// Entity type matching
const matchesType = (entry, value) => {
  if (value === "all") return true;

  const entityType = entry.entityType;

  // "new" filter: show hybrids (newly discovered communities) and unverified entries
  if (value === "new") {
    return entityType === "hybrid" || entry.verified === false;
  }

  if (!entityType) return value === "community"; // Default to community

  if (value === "community") {
    return entityType === "community" || entityType === "hybrid";
  }
  if (value === "festival") {
    return entityType === "festival" || entityType === "hybrid";
  }
  return true;
};

/* ===========================
   ENTITY TYPE HELPERS
   =========================== */

// Get display badges for entity type
function getEntityBadges(entityType) {
  const badges = {
    community: '<span class="entity-badge community">Community</span>',
    festival: '<span class="entity-badge festival">Festival</span>',
    hybrid: '<span class="entity-badge community">Community</span><span class="entity-badge festival">Festival</span>',
    instructor: '<span class="entity-badge instructor">Instructor</span>',
    band: '<span class="entity-badge band">Band</span>',
    dj: '<span class="entity-badge dj">DJ</span>',
    venue: '<span class="entity-badge venue">Venue</span>',
    vendor: '<span class="entity-badge vendor">Vendor</span>',
    media: '<span class="entity-badge media">Media</span>',
    association: '<span class="entity-badge association">Association</span>'
  };
  return badges[entityType] || '';
}

// Format location string (city, country)
function formatLocation(city, country) {
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return 'Unknown';
}

// Format date range for festival display (e.g., "Apr 16-19, 2026")
function formatDateRange(startDate, endDate) {
  if (!startDate) return '';
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = months[start.getMonth()];
  const startDay = start.getDate();
  const startYear = start.getFullYear();

  if (!end || startDate === endDate) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  const endMonth = months[end.getMonth()];
  const endDay = end.getDate();
  const endYear = end.getFullYear();

  // Same month and year
  if (start.getMonth() === end.getMonth() && startYear === endYear) {
    return `${startMonth} ${startDay}-${endDay}, ${startYear}`;
  }
  // Same year, different months
  if (startYear === endYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }
  // Different years
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
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
  let filtered = data.communities.filter(c => {
    const cityText = (c.city || '').toLowerCase();
    const countryText = (c.country || '').toLowerCase();
    const nameText = (c.name || '').toLowerCase();

    const matchesTerm = term === "" ||
      cityText.includes(term) ||
      countryText.includes(term) ||
      nameText.includes(term);

    const matchesStyleFilter = matchesStyle(c.styles, style);
    const matchesLocationFilter = matchesLocation(c.country, location);
    const matchesDateFilter = matchesDateRange(c.startDate, fromDate, toDate);
    const matchesTypeFilter = matchesType(c, currentType);

    return matchesTerm && matchesStyleFilter && matchesLocationFilter && matchesDateFilter && matchesTypeFilter;
  });

  // Sort: festivals by startDate (soonest first), communities by city
  filtered.sort((a, b) => {
    // If filtering by date or festivals, sort by date
    if (hasDateFilter || currentType === 'festival') {
      const dateA = a.startDate ? new Date(a.startDate) : new Date('9999-12-31');
      const dateB = b.startDate ? new Date(b.startDate) : new Date('9999-12-31');
      return dateA - dateB;
    }
    // Otherwise sort by city name
    return (a.city || 'ZZZ').localeCompare(b.city || 'ZZZ');
  });

  // Update results summary
  updateResultsSummary(filtered.length);

  // Render main list
  if (mainList) {
    mainList.innerHTML = filtered.length ? filtered.map(c => {
      const location = formatLocation(c.city, c.country);
      const styles = c.styles || [];
      const entityBadges = getEntityBadges(c.entityType);

      // Use manual social field as fallback message
      const social = c.social || 'Check Instagram for schedule';
      const upcomingEvents = c.scraped?.upcomingEvents || [];

      // Format event for display
      const formatEvent = (event) => {
        const date = new Date(event.date);
        const shortDate = `${date.getMonth()+1}/${date.getDate()}`;
        const typeEmoji = {
          social: '💃',
          class: '📚',
          workshop: '🎓',
          festival: '🎉',
          trial: '🎯',
          other: '📅'
        }[event.type] || '📅';
        if (event.sourceUrl) {
          return `<a href="${event.sourceUrl}" target="_blank" rel="noopener" class="event-link">${typeEmoji} ${shortDate} ${event.title}</a>`;
        }
        return `<span class="event-link">${typeEmoji} ${shortDate} ${event.title}</span>`;
      };

      // Festival dates (for festivals from SwingPlanIt)
      const festivalDates = c.dates || '';
      const festivalLink = c.website || c.instagram || '';

      // Build upcoming section - either scraped events OR festival dates
      let upcomingSection = '';
      if (upcomingEvents.length) {
        upcomingSection = `
          <div class="upcoming-events">
            <strong>Upcoming:</strong>
            <ul class="event-list">
              ${upcomingEvents.slice(0, 4).map(e => `<li>${formatEvent(e)}</li>`).join('')}
            </ul>
          </div>`;
      } else if (festivalDates && c.entityType === 'festival') {
        // Show festival dates in same style as upcoming events
        const dateLink = festivalLink
          ? `<a href="${festivalLink}" target="_blank" rel="noopener" class="event-link">🎉 ${festivalDates}</a>`
          : `<span class="event-link">🎉 ${festivalDates}</span>`;
        upcomingSection = `
          <div class="upcoming-events">
            <strong>Upcoming:</strong>
            <ul class="event-list">
              <li>${dateLink}</li>
            </ul>
          </div>`;
      } else if (c.entityType !== 'festival') {
        upcomingSection = `<p class="meta"><strong>Social:</strong> ${social}</p>`;
      }

      return `
      <article class="card">
        <div class="card-header">
          <h3>${c.name || 'Unknown'}</h3>
          ${entityBadges ? `<div class="entity-badges">${entityBadges}</div>` : ''}
        </div>
        <div class="meta">
          <span><strong>${location}</strong></span>
        </div>
        ${upcomingSection}
        ${styles.length ? `<div class="tag-row">${styles.map(s => `<span class="tag">${s}</span>`).join("")}</div>` : ''}
        ${c.notes ? `<p class="meta" style="margin-top:8px;">${c.notes}</p>` : ''}
        ${c.festival ? `<p class="meta festival-host">🎪 Also hosts: <a href="${c.festival.website}" target="_blank" rel="noopener">${c.festival.name}</a>${c.festivalDates ? ` <span class="festival-dates">(${formatDateRange(c.festivalDates.startDate, c.festivalDates.endDate)})</span>` : ''}</p>` : ''}
        <div class="tag-row" style="margin-top:8px;">
          ${c.instagram ? `<a class="inline-link" href="${c.instagram}" target="_blank" rel="noopener">Instagram</a>` : ''}
          ${c.website ? `<a class="inline-link" href="${c.website}" target="_blank" rel="noopener">Website</a>` : ''}
          ${c.linktree ? `<a class="inline-link" href="${c.linktree}" target="_blank" rel="noopener">Links</a>` : ''}
          <button class="verify-btn ${c.verified ? 'verified' : ''}" data-username="${c.username}" onclick="toggleVerified('${c.username}')">${c.verified ? 'Verified' : 'Mark Verified'}</button>
        </div>
      </article>
    `}).join("") : `<div class="empty">No results match your search.</div>`;
  }
}

// Update results summary text
function updateResultsSummary(shown) {
  if (!resultsSummary) return;

  // Calculate the correct total based on current type filter
  let typeTotal;
  let typeText;

  if (currentType === 'all') {
    typeTotal = data.communities.length;
    typeText = 'results';
  } else if (currentType === 'community') {
    typeTotal = data.communities.filter(c =>
      !c.entityType || c.entityType === 'community' || c.entityType === 'hybrid'
    ).length;
    typeText = 'communities';
  } else if (currentType === 'festival') {
    typeTotal = data.communities.filter(c =>
      c.entityType === 'festival' || c.entityType === 'hybrid'
    ).length;
    typeText = 'festivals';
  } else if (currentType === 'new') {
    typeTotal = data.communities.filter(c =>
      c.entityType === 'hybrid' || c.verified === false
    ).length;
    typeText = 'new entries';
  }

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

  // Hide if empty or too short
  if (term.length < 1) {
    hideSuggestions();
    return;
  }

  // Find matching items
  const matches = data.communities.filter(c => {
    const nameText = (c.name || '').toLowerCase();
    const cityText = (c.city || '').toLowerCase();
    const countryText = (c.country || '').toLowerCase();
    return nameText.includes(term) || cityText.includes(term) || countryText.includes(term);
  }).slice(0, 8); // Limit to 8 suggestions

  if (matches.length === 0) {
    hideSuggestions();
    return;
  }

  // Build suggestion HTML
  searchSuggestions.innerHTML = matches.map((c, index) => {
    const location = formatLocation(c.city, c.country);
    const badgeClass = c.entityType === 'festival' ? 'festival' : 'community';
    const badgeText = c.entityType === 'festival' ? 'Festival' : 'Community';
    return `
      <li data-index="${index}" data-name="${c.name || ''}">
        <span class="suggestion-name">
          ${c.name || 'Unknown'}
          <span class="suggestion-badge ${badgeClass}">${badgeText}</span>
        </span>
        <span class="suggestion-location">${location}</span>
      </li>
    `;
  }).join('');

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
   EVENT LISTENERS
   =========================== */

// Type toggle buttons
if (typeToggle) {
  typeToggle.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-btn')) {
      // Update active state
      typeToggle.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      // Update current type and re-render
      currentType = e.target.dataset.value;
      render();
    }
  });
}

// Search autocomplete listeners
if (citySearch) {
  citySearch.addEventListener("input", () => {
    updateSuggestions();
    render();
  });
  citySearch.addEventListener("keydown", handleSuggestionKeydown);
  citySearch.addEventListener("blur", () => {
    // Delay to allow click on suggestion
    setTimeout(hideSuggestions, 150);
  });
}

// Click on suggestion
if (searchSuggestions) {
  searchSuggestions.addEventListener("click", (e) => {
    const li = e.target.closest('li');
    if (li) {
      selectSuggestion(li.dataset.name);
    }
  });
}

// Attach input listeners to other filters
[styleFilter, locationFilter, dateFrom, dateTo].filter(el => el).forEach(el => {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

// Reset button
if (resetFilters) {
  resetFilters.addEventListener("click", () => {
    if (citySearch) citySearch.value = "";
    if (styleFilter) styleFilter.value = "all";
    if (locationFilter) locationFilter.value = "all";
    if (dateFrom) dateFrom.value = "";
    if (dateTo) dateTo.value = "";

    // Reset type toggle
    currentType = 'all';
    if (typeToggle) {
      typeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === 'all');
      });
    }

    render();
  });
}

/* ===========================
   INITIALIZATION
   =========================== */

// Load data when DOM is ready
document.addEventListener('DOMContentLoaded', loadData);
