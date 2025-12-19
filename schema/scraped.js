/**
 * Scraped data schema - metadata from scraping pipeline
 */

const { z } = require('zod');
const { ConfidenceEnum } = require('./enums');
const { EventSchema } = require('./event');

/**
 * Schema for scraped data attached to a community.
 * All fields optional with sensible defaults.
 */
const ScrapedSchema = z.object({
  lastScraped: z.string().optional(),
  confidence: ConfidenceEnum.optional(),

  // Schedule detection (legacy - kept for backward compatibility)
  // regularSchedule can be string, object, or null in existing data
  regularSchedule: z.union([z.string(), z.object({}).passthrough()]).nullable().optional(),
  scheduleDetected: z.union([z.boolean(), z.string()]).nullable().optional(),
  scheduleDescription: z.string().nullable().optional(),

  // Events
  upcomingEvents: z.array(EventSchema).default([]),
  upcomingDates: z.array(z.string()).default([])
}).default({
  upcomingEvents: [],
  upcomingDates: []
});

/**
 * Normalize scraped data - fills defaults, never throws.
 * @param {unknown} data
 * @returns {object}
 */
function normalizeScraped(data) {
  const input = data && typeof data === 'object' ? data : {};

  const { normalizeEvent } = require('./event');

  return {
    lastScraped: input.lastScraped,
    confidence: ConfidenceEnum.safeParse(input.confidence).success
      ? input.confidence
      : undefined,
    regularSchedule: input.regularSchedule,
    scheduleDetected: input.scheduleDetected,
    scheduleDescription: input.scheduleDescription,
    upcomingEvents: Array.isArray(input.upcomingEvents)
      ? input.upcomingEvents.map(normalizeEvent)
      : [],
    upcomingDates: Array.isArray(input.upcomingDates)
      ? input.upcomingDates
      : []
  };
}

module.exports = {
  ScrapedSchema,
  normalizeScraped
};
