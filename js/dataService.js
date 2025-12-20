/* ===========================
   Data Service - Fetch & Persistence
   =========================== */

import { normalizeCommunities } from './schemas.js';

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
