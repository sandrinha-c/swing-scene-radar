/* ===========================
   Frontend Schemas - ES Module version

   Re-exports from canonical /schema folder.
   All schema definitions live in /schema as the single source of truth.
   =========================== */

// Re-export everything from canonical schema
export {
  // Enum arrays
  ENTITY_TYPES,
  EVENT_TYPES,
  STYLE_CODES,
  CONFIDENCE_LEVELS,

  // Normalize functions
  normalizeEvent,
  normalizeScraped,
  normalizeCommunity,
  normalizeCommunities
} from '../schema/index.mjs';

// Legacy aliases for backward compatibility
export { EVENT_TYPES as VALID_EVENT_TYPES } from '../schema/index.mjs';
export { ENTITY_TYPES as VALID_ENTITY_TYPES } from '../schema/index.mjs';
export { STYLE_CODES as VALID_STYLES } from '../schema/index.mjs';
