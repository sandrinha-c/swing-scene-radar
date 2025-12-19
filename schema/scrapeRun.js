/**
 * ScrapeRun schema - metadata for a scraping job execution
 *
 * Used for tracking pipeline runs and costs.
 */

const { z } = require('zod');

/**
 * Schema for a scrape run record.
 */
const ScrapeRunSchema = z.object({
  // Required
  startedAt: z.string(),
  jobName: z.string(),

  // Optional metrics
  endedAt: z.string().optional(),
  durationMs: z.number().optional(),
  cost: z.number().optional(),
  successCount: z.number().optional(),
  errorCount: z.number().optional(),
  skippedCount: z.number().optional(),

  // Error details
  errors: z.array(z.object({
    community: z.string().optional(),
    message: z.string(),
    stack: z.string().optional()
  })).optional()
}).passthrough();

/**
 * Parse a scrape run strictly.
 * @param {unknown} data
 * @returns {z.infer<typeof ScrapeRunSchema>}
 */
function parseScrapeRun(data) {
  return ScrapeRunSchema.parse(data);
}

/**
 * Parse a scrape run safely.
 * @param {unknown} data
 * @returns {z.SafeParseReturnType}
 */
function safeParseScrapeRun(data) {
  return ScrapeRunSchema.safeParse(data);
}

module.exports = {
  ScrapeRunSchema,
  parseScrapeRun,
  safeParseScrapeRun
};
