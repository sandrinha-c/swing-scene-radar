/**
 * Candidate schema - for discovery pipeline
 *
 * Represents a potential community discovered via graph expansion or LLM.
 */

const { z } = require('zod');
const { CandidateStatusEnum, EntityTypeEnum, StyleEnum } = require('./enums');

/**
 * Schema for a discovery candidate.
 */
const CandidateSchema = z.object({
  // Required
  name: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),

  // Identity
  username: z.string().optional(),
  sourceUrl: z.string().url().optional(),

  // Status in pipeline
  status: CandidateStatusEnum.default('pending'),
  discoveredAt: z.string().optional(),
  validatedAt: z.string().optional(),

  // Validation results
  entityType: EntityTypeEnum.optional(),
  styles: z.array(StyleEnum).optional(),
  confidence: z.number().min(0).max(1).optional(),
  rejectionReason: z.string().optional()
}).passthrough();

/**
 * Parse a candidate strictly.
 * @param {unknown} data
 * @returns {z.infer<typeof CandidateSchema>}
 */
function parseCandidate(data) {
  return CandidateSchema.parse(data);
}

/**
 * Parse a candidate safely.
 * @param {unknown} data
 * @returns {z.SafeParseReturnType}
 */
function safeParseCandidate(data) {
  return CandidateSchema.safeParse(data);
}

module.exports = {
  CandidateSchema,
  parseCandidate,
  safeParseCandidate
};
