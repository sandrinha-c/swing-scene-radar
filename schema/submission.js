/**
 * Submission schema - for future user submissions
 *
 * Placeholder for when we accept community/festival submissions.
 */

const { z } = require('zod');
const { SubmissionTypeEnum } = require('./enums');

/**
 * Schema for a user submission.
 */
const SubmissionSchema = z.object({
  // Required
  submittedAt: z.string(),
  type: SubmissionTypeEnum,

  // Submitter info
  submitterEmail: z.string().email().optional(),
  submitterName: z.string().optional(),

  // Payload (varies by type)
  payload: z.unknown().optional(),

  // Review status
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  reviewedAt: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewNotes: z.string().optional()
}).passthrough();

/**
 * Parse a submission strictly.
 * @param {unknown} data
 * @returns {z.infer<typeof SubmissionSchema>}
 */
function parseSubmission(data) {
  return SubmissionSchema.parse(data);
}

/**
 * Parse a submission safely.
 * @param {unknown} data
 * @returns {z.SafeParseReturnType}
 */
function safeParseSubmission(data) {
  return SubmissionSchema.safeParse(data);
}

module.exports = {
  SubmissionSchema,
  parseSubmission,
  safeParseSubmission
};
