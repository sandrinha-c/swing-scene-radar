/**
 * Canonical enum definitions for Swing Scene Radar
 *
 * Single source of truth for all enumerated values.
 * Import these instead of defining locally.
 */

const { z } = require('zod');

// ============================================
// ENTITY TYPES
// ============================================

/**
 * All valid entity types in the system.
 * - community: Local school/studio with regular classes + socials
 * - festival: Primarily organizes annual/weekend events
 * - hybrid: Both runs regular classes AND organizes festivals
 * - instructor: Famous teacher who travels
 * - venue: Physical space hosting multiple communities' events
 * - vendor: Shoes, clothes, accessories sellers
 * - band: Live music acts
 * - dj: Solo DJs who travel to festivals
 * - media: Video channels, photographers
 * - association: Regional dance councils/organizations
 */
const ENTITY_TYPES = [
  'community',
  'festival',
  'hybrid',
  'instructor',
  'venue',
  'vendor',
  'band',
  'dj',
  'media',
  'association'
];

const EntityTypeEnum = z.enum(ENTITY_TYPES);

// ============================================
// EVENT TYPES
// ============================================

/**
 * Valid event types for scraped events.
 * - social: Regular dance social/party
 * - class: Dance class/lesson
 * - workshop: One-time or weekend workshop
 * - party: Dance party (similar to social)
 * - festival: Multi-day festival event
 * - trial: Trial/intro class
 * - other: Anything else
 */
const EVENT_TYPES = [
  'social',
  'class',
  'workshop',
  'party',
  'festival',
  'trial',
  'other'
];

const EventTypeEnum = z.enum(EVENT_TYPES);

// ============================================
// DANCE STYLES
// ============================================

/**
 * Valid dance style codes.
 * Note: 'bal' and 'balboa' are both valid (bal is shorthand).
 */
const STYLE_CODES = [
  'lindy',
  'bal',
  'balboa',
  'blues',
  'solo',
  'shag',
  'charleston',
  'wcs'
];

const StyleEnum = z.enum(STYLE_CODES);

// ============================================
// CONFIDENCE LEVELS
// ============================================

const CONFIDENCE_LEVELS = ['high', 'medium', 'low'];
const ConfidenceEnum = z.enum(CONFIDENCE_LEVELS);

// ============================================
// CANDIDATE STATUS (for discovery pipeline)
// ============================================

const CANDIDATE_STATUSES = [
  'pending',
  'validated',
  'rejected',
  'added'
];

const CandidateStatusEnum = z.enum(CANDIDATE_STATUSES);

// ============================================
// SUBMISSION TYPES (for future user submissions)
// ============================================

const SUBMISSION_TYPES = [
  'community',
  'festival',
  'claim',
  'correction'
];

const SubmissionTypeEnum = z.enum(SUBMISSION_TYPES);

module.exports = {
  // Arrays (for iteration, display)
  ENTITY_TYPES,
  EVENT_TYPES,
  STYLE_CODES,
  CONFIDENCE_LEVELS,
  CANDIDATE_STATUSES,
  SUBMISSION_TYPES,

  // Zod enums (for validation)
  EntityTypeEnum,
  EventTypeEnum,
  StyleEnum,
  ConfidenceEnum,
  CandidateStatusEnum,
  SubmissionTypeEnum
};
