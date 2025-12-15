/* ===========================
   Components - Pure HTML Renderers
   =========================== */

import { formatLocation, formatDateRange, formatEventDate } from './formatters.js';

// Event type emoji mapping
const TYPE_EMOJI = {
  social: '💃',
  class: '📚',
  workshop: '🎓',
  festival: '🎉',
  trial: '🎯',
  other: '📅'
};

/**
 * Render entity type badges
 * @param {string} entityType - Entity type (community/festival/hybrid/etc)
 * @returns {string} HTML string
 */
export function renderEntityBadges(entityType) {
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

/**
 * Render a single event item
 * @param {Object} event - Event object with date, type, title, sourceUrl
 * @returns {string} HTML string
 */
function renderEvent(event) {
  const shortDate = formatEventDate(event.date);
  const emoji = TYPE_EMOJI[event.type] || TYPE_EMOJI.other;

  if (event.sourceUrl) {
    return `<a href="${event.sourceUrl}" target="_blank" rel="noopener" class="event-link">${emoji} ${shortDate} ${event.title}</a>`;
  }
  return `<span class="event-link">${emoji} ${shortDate} ${event.title}</span>`;
}

/**
 * Render upcoming events section
 * @param {Array} events - Array of upcoming events
 * @param {string} entityType - Entity type
 * @param {string} dates - Pre-formatted festival dates string
 * @param {string} website - Website URL
 * @param {string} instagram - Instagram URL
 * @param {string} social - Social/schedule description fallback
 * @returns {string} HTML string
 */
export function renderUpcomingEvents(events, entityType, dates, website, instagram, social) {
  // Scraped events take priority
  if (events && events.length > 0) {
    const eventItems = events.slice(0, 4).map(e => `<li>${renderEvent(e)}</li>`).join('');
    return `
      <div class="upcoming-events">
        <strong>Upcoming:</strong>
        <ul class="event-list">
          ${eventItems}
        </ul>
      </div>`;
  }

  // Festival dates display
  if (dates && entityType === 'festival') {
    const festivalLink = website || instagram || '';
    const dateLink = festivalLink
      ? `<a href="${festivalLink}" target="_blank" rel="noopener" class="event-link">🎉 ${dates}</a>`
      : `<span class="event-link">🎉 ${dates}</span>`;
    return `
      <div class="upcoming-events">
        <strong>Upcoming:</strong>
        <ul class="event-list">
          <li>${dateLink}</li>
        </ul>
      </div>`;
  }

  // Fallback for communities without events
  if (entityType !== 'festival') {
    const fallback = social || 'Check Instagram for schedule';
    return `<p class="meta"><strong>Social:</strong> ${fallback}</p>`;
  }

  return '';
}

/**
 * Render festival host info for hybrid entries
 * @param {Object} festival - Festival object { name, website }
 * @param {Object} festivalDates - Festival dates { startDate, endDate }
 * @returns {string} HTML string
 */
export function renderFestivalHost(festival, festivalDates) {
  if (!festival) return '';

  const dateStr = festivalDates
    ? ` <span class="festival-dates">(${formatDateRange(festivalDates.startDate, festivalDates.endDate)})</span>`
    : '';

  const nameHtml = festival.website
    ? `<a href="${festival.website}" target="_blank" rel="noopener">${festival.name}</a>`
    : festival.name;

  return `<p class="meta festival-host">🎪 Also hosts: ${nameHtml}${dateStr}</p>`;
}

/**
 * Render community/festival card
 * @param {Object} c - Community object
 * @returns {string} HTML string
 */
export function renderCard(c) {
  const location = formatLocation(c.city, c.country);
  const styles = c.styles || [];
  const entityBadges = renderEntityBadges(c.entityType);
  const upcomingEvents = c.scraped?.upcomingEvents || [];

  const upcomingSection = renderUpcomingEvents(
    upcomingEvents,
    c.entityType,
    c.dates,
    c.website,
    c.instagram,
    c.social
  );

  const festivalHostSection = renderFestivalHost(c.festival, c.festivalDates);

  const stylesRow = styles.length
    ? `<div class="tag-row">${styles.map(s => `<span class="tag">${s}</span>`).join('')}</div>`
    : '';

  const notesSection = c.notes
    ? `<p class="meta" style="margin-top:8px;">${c.notes}</p>`
    : '';

  return `
    <article class="card" data-username="${c.username}">
      <div class="card-header">
        <h3>${c.name || 'Unknown'}</h3>
        ${entityBadges ? `<div class="entity-badges">${entityBadges}</div>` : ''}
      </div>
      <div class="meta">
        <span><strong>${location}</strong></span>
      </div>
      ${upcomingSection}
      ${stylesRow}
      ${notesSection}
      ${festivalHostSection}
      <div class="tag-row" style="margin-top:8px;">
        ${c.instagram ? `<a class="inline-link" href="${c.instagram}" target="_blank" rel="noopener">Instagram</a>` : ''}
        ${c.website ? `<a class="inline-link" href="${c.website}" target="_blank" rel="noopener">Website</a>` : ''}
        ${c.linktree ? `<a class="inline-link" href="${c.linktree}" target="_blank" rel="noopener">Links</a>` : ''}
        <button class="verify-btn ${c.verified ? 'verified' : ''}" data-username="${c.username}">${c.verified ? 'Verified' : 'Mark Verified'}</button>
      </div>
    </article>
  `;
}

/**
 * Render search suggestion item
 * @param {Object} c - Community object
 * @param {number} index - Suggestion index
 * @returns {string} HTML string
 */
export function renderSuggestion(c, index) {
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
}
