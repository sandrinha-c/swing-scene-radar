/* ===========================
   Data Service - Fetch & Persistence
   =========================== */

import { normalizeCommunities } from './schemas.js';

const STORAGE_KEY = 'verifiedCommunities';

/**
 * Fetch communities from JSON file
 * @returns {Promise<Array>} Array of normalized community objects
 */
export async function fetchCommunities() {
  const response = await fetch('data/communities.json');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();
  return normalizeCommunities(data.communities || []);
}

/**
 * Load verified status from localStorage
 * @returns {Object} Map of username -> true for verified communities
 */
export function loadVerifiedStatus() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) {
    console.error('Error loading verified status:', e);
    return {};
  }
}

/**
 * Apply verified status to communities array
 * @param {Array} communities - Array of community objects
 * @returns {Array} Communities with verified flag applied
 */
export function applyVerifiedStatus(communities) {
  const verified = loadVerifiedStatus();
  return communities.map(c => ({
    ...c,
    verified: verified[c.username] ?? c.verified ?? false
  }));
}

/**
 * Toggle verified status for a community
 * @param {Array} communities - Current communities array
 * @param {string} username - Username to toggle
 * @returns {Array} Updated communities array with toggled status
 */
export function toggleVerified(communities, username) {
  const verified = loadVerifiedStatus();
  const isCurrentlyVerified = verified[username] || false;

  // Update localStorage
  try {
    if (isCurrentlyVerified) {
      delete verified[username];
    } else {
      verified[username] = true;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(verified));
  } catch (e) {
    console.error('Error saving verified status:', e);
  }

  // Return updated communities array
  return communities.map(c =>
    c.username === username
      ? { ...c, verified: !isCurrentlyVerified }
      : c
  );
}
