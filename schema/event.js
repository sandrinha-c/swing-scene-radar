/**
 * Event schema - represents a scraped upcoming event
 */

const { z } = require('zod');
const { EventTypeEnum } = require('./enums');

// Date format: YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Schema for a single upcoming event.
 *
 * Required: date, title
 * Optional: type, sourceUrl
 */
const EventSchema = z.object({
  date: z.string().regex(DATE_REGEX, 'Date must be YYYY-MM-DD format'),
  title: z.string().min(1, 'Title is required'),
  type: EventTypeEnum.default('other'),
  sourceUrl: z.string().url().optional()
}).passthrough(); // Allow unknown fields to pass through

/**
 * Parse an event strictly - throws on invalid data.
 * @param {unknown} data
 * @returns {z.infer<typeof EventSchema>}
 */
function parseEvent(data) {
  return EventSchema.parse(data);
}

/**
 * Parse an event safely - returns success/error result.
 * @param {unknown} data
 * @returns {z.SafeParseReturnType}
 */
function safeParseEvent(data) {
  return EventSchema.safeParse(data);
}

/**
 * Normalize an event - fills defaults, never throws.
 * @param {unknown} data
 * @returns {object}
 */
function normalizeEvent(data) {
  const input = data && typeof data === 'object' ? data : {};

  const date = typeof input.date === 'string' && DATE_REGEX.test(input.date)
    ? input.date
    : '1970-01-01'; // Placeholder for invalid dates

  const type = EventTypeEnum.safeParse(input.type).success
    ? input.type
    : 'other';

  return {
    date,
    title: input.title || 'Unknown Event',
    type,
    sourceUrl: typeof input.sourceUrl === 'string' ? input.sourceUrl : undefined
  };
}

module.exports = {
  EventSchema,
  parseEvent,
  safeParseEvent,
  normalizeEvent
};
