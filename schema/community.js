/**
 * Community schema - the main entity in the system
 *
 * Represents communities, festivals, hybrids, and other entity types.
 */

const { z } = require('zod');
const { EntityTypeEnum, StyleEnum, EntitySourceEnum } = require('./enums');
const { ScrapedSchema, normalizeScraped } = require('./scraped');

// Date format: YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ============================================
// SUB-SCHEMAS
// ============================================

/**
 * Festival dates for annual events.
 */
const FestivalDatesSchema = z.object({
  startDate: z.string().regex(DATE_REGEX).optional(),
  endDate: z.string().regex(DATE_REGEX).optional()
}).optional();

/**
 * Festival info for hybrid entities (community that also hosts a festival).
 */
const FestivalInfoSchema = z.object({
  name: z.string().optional(),
  website: z.string().url().optional()
}).optional();

// ============================================
// MAIN COMMUNITY SCHEMA
// ============================================

/**
 * Schema for a community/festival/hybrid entity.
 *
 * Required fields (minimal): name, city, country
 * EntityType defaults to 'community' if missing or invalid.
 * All other fields are optional.
 */
const CommunitySchema = z.object({
  // Required fields
  name: z.string().min(1, 'Name is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),

  // Identity (technically optional but usually present)
  username: z.string().optional(),
  entityType: EntityTypeEnum.catch('community').default('community'),

  // Contact & links (nullable to handle legacy null values)
  instagram: z.string().url().nullable().optional(),
  website: z.string().url().nullable().optional(),
  linktree: z.string().url().nullable().optional(),
  email: z.string().email().nullable().optional(),
  social: z.string().nullable().optional(),

  // Metadata
  styles: z.array(StyleEnum).default([]),
  notes: z.string().optional(),
  region: z.string().optional(),
  source: EntitySourceEnum.optional(), // How entity was discovered (seed, swingplanit, graph)
  followers: z.number().optional(),

  // Festivals hosted by this entity (for hybrid entities)
  festivals: z.array(z.string()).optional(),
  festivalWebsite: z.string().url().optional(), // SwingPlanIt source URL

  // Festival-specific fields
  startDate: z.string().regex(DATE_REGEX).optional(),
  endDate: z.string().regex(DATE_REGEX).optional(),
  dates: z.string().optional(), // Pre-formatted date string for display
  festivalDates: FestivalDatesSchema,
  festival: FestivalInfoSchema,

  // Scraped data
  scraped: ScrapedSchema
}).passthrough(); // Allow unknown fields to pass through

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse a community strictly - throws on invalid data.
 * @param {unknown} data
 * @returns {z.infer<typeof CommunitySchema>}
 */
function parseCommunity(data) {
  return CommunitySchema.parse(data);
}

/**
 * Parse a community safely - returns success/error result.
 * @param {unknown} data
 * @returns {z.SafeParseReturnType}
 */
function safeParseCommunity(data) {
  return CommunitySchema.safeParse(data);
}

/**
 * Normalize a community - fills defaults, never throws.
 * Useful for displaying data that might be incomplete.
 * @param {unknown} data
 * @returns {object}
 */
function normalizeCommunity(data) {
  const input = data && typeof data === 'object' ? data : {};

  const entityType = EntityTypeEnum.safeParse(input.entityType).success
    ? input.entityType
    : 'community';

  const styles = Array.isArray(input.styles)
    ? input.styles.filter(s => StyleEnum.safeParse(s).success)
    : [];

  return {
    name: input.name || 'Unknown',
    city: input.city || 'Unknown',
    country: input.country || 'Unknown',
    username: input.username,
    entityType,
    instagram: input.instagram,
    website: input.website,
    linktree: input.linktree,
    email: input.email,
    social: input.social,
    styles,
    notes: input.notes,
    region: input.region,
    source: input.source,
    followers: typeof input.followers === 'number' ? input.followers : undefined,
    festivals: Array.isArray(input.festivals) ? input.festivals : undefined,
    festivalWebsite: input.festivalWebsite,
    startDate: input.startDate,
    endDate: input.endDate,
    dates: input.dates,
    festivalDates: input.festivalDates,
    festival: input.festival || input.festivalInfo,  // Accept both naming conventions
    scraped: normalizeScraped(input.scraped)
  };
}

/**
 * Normalize an array of communities.
 * @param {unknown[]} communities
 * @returns {object[]}
 */
function normalizeCommunities(communities) {
  if (!Array.isArray(communities)) return [];
  return communities.map(normalizeCommunity);
}

module.exports = {
  FestivalDatesSchema,
  FestivalInfoSchema,
  CommunitySchema,
  parseCommunity,
  safeParseCommunity,
  normalizeCommunity,
  normalizeCommunities
};
