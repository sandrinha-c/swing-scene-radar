/**
 * Canonical Schema Layer for Swing Scene Radar
 *
 * This is the SINGLE SOURCE OF TRUTH for all data shapes.
 * All backend scripts, frontend code, and validation should import from here.
 *
 * Usage (CommonJS - backend):
 *   const { CommunitySchema, parseCommunity, ENTITY_TYPES } = require('./schema');
 *
 * Usage (ESM - frontend):
 *   import { CommunitySchema, parseCommunity, ENTITY_TYPES } from './schema/index.mjs';
 */

// ============================================
// ENUMS
// ============================================

const {
  ENTITY_TYPES,
  EVENT_TYPES,
  STYLE_CODES,
  CONFIDENCE_LEVELS,
  CANDIDATE_STATUSES,
  SUBMISSION_TYPES,
  EntityTypeEnum,
  EventTypeEnum,
  StyleEnum,
  ConfidenceEnum,
  CandidateStatusEnum,
  SubmissionTypeEnum
} = require('./enums');

// ============================================
// SCHEMAS
// ============================================

const {
  EventSchema,
  parseEvent,
  safeParseEvent,
  normalizeEvent
} = require('./event');

const {
  ScrapedSchema,
  normalizeScraped
} = require('./scraped');

const {
  FestivalDatesSchema,
  FestivalInfoSchema,
  CommunitySchema,
  parseCommunity,
  safeParseCommunity,
  normalizeCommunity,
  normalizeCommunities
} = require('./community');

const {
  ScrapeRunSchema,
  parseScrapeRun,
  safeParseScrapeRun
} = require('./scrapeRun');

const {
  CandidateSchema,
  parseCandidate,
  safeParseCandidate
} = require('./candidate');

const {
  SubmissionSchema,
  parseSubmission,
  safeParseSubmission
} = require('./submission');

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate a communities.json file structure.
 * @param {object} data - Parsed JSON data
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateCommunitiesFile(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] };
  }

  if (!Array.isArray(data.communities)) {
    return { valid: false, errors: ['Missing or invalid "communities" array'] };
  }

  data.communities.forEach((community, index) => {
    const result = safeParseCommunity(community);
    if (!result.success) {
      const name = community?.name || community?.username || `index ${index}`;
      // Zod v4 stores issues in message as JSON string
      const issues = result.error?.issues || JSON.parse(result.error?.message || '[]');
      issues.forEach(err => {
        const path = err.path?.length > 0 ? `.${err.path.join('.')}` : '';
        errors.push(`communities[${index}] (${name})${path}: ${err.message}`);
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Enum arrays (for iteration, UI dropdowns)
  ENTITY_TYPES,
  EVENT_TYPES,
  STYLE_CODES,
  CONFIDENCE_LEVELS,
  CANDIDATE_STATUSES,
  SUBMISSION_TYPES,

  // Zod enum schemas (for validation)
  EntityTypeEnum,
  EventTypeEnum,
  StyleEnum,
  ConfidenceEnum,
  CandidateStatusEnum,
  SubmissionTypeEnum,

  // Main schemas
  EventSchema,
  ScrapedSchema,
  FestivalDatesSchema,
  FestivalInfoSchema,
  CommunitySchema,
  ScrapeRunSchema,
  CandidateSchema,
  SubmissionSchema,

  // Parse functions (throw on error)
  parseEvent,
  parseCommunity,
  parseScrapeRun,
  parseCandidate,
  parseSubmission,

  // Safe parse functions (return result object)
  safeParseEvent,
  safeParseCommunity,
  safeParseScrapeRun,
  safeParseCandidate,
  safeParseSubmission,

  // Normalize functions (fill defaults, never throw)
  normalizeEvent,
  normalizeScraped,
  normalizeCommunity,
  normalizeCommunities,

  // File validation
  validateCommunitiesFile
};
