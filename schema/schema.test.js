/**
 * Schema tests - validates the canonical schema layer
 *
 * Run with: npm test
 *
 * Note: Uses vitest globals (describe, it, expect injected automatically)
 */

// Import schema using CommonJS require (schema is CJS)
const {
  // Enums
  ENTITY_TYPES,
  EVENT_TYPES,
  STYLE_CODES,

  // Parse functions
  parseCommunity,
  parseEvent,

  // Safe parse functions
  safeParseCommunity,
  safeParseEvent,

  // Normalize functions
  normalizeCommunity,
  normalizeEvent,
  normalizeScraped,
  normalizeCommunities,

  // File validation
  validateCommunitiesFile
} = require('./index.js');

// ============================================
// ENUM TESTS
// ============================================

describe('Enums', () => {
  it('exports expected entity types', () => {
    expect(ENTITY_TYPES).toContain('community');
    expect(ENTITY_TYPES).toContain('festival');
    expect(ENTITY_TYPES).toContain('hybrid');
    expect(ENTITY_TYPES.length).toBeGreaterThanOrEqual(10);
  });

  it('exports expected event types', () => {
    expect(EVENT_TYPES).toContain('social');
    expect(EVENT_TYPES).toContain('class');
    expect(EVENT_TYPES).toContain('festival');
    expect(EVENT_TYPES).toContain('workshop');
  });

  it('exports expected style codes', () => {
    expect(STYLE_CODES).toContain('lindy');
    expect(STYLE_CODES).toContain('blues');
    expect(STYLE_CODES).toContain('balboa');
  });
});

// ============================================
// EVENT TESTS
// ============================================

describe('Event Schema', () => {
  it('parses valid event', () => {
    const event = parseEvent({
      date: '2025-12-25',
      title: 'Christmas Social',
      type: 'social',
      sourceUrl: 'https://example.com/event'
    });
    expect(event.date).toBe('2025-12-25');
    expect(event.title).toBe('Christmas Social');
    expect(event.type).toBe('social');
  });

  it('throws on missing date', () => {
    expect(() => parseEvent({ title: 'No Date' })).toThrow();
  });

  it('throws on invalid date format', () => {
    expect(() => parseEvent({
      date: '12/25/2025',
      title: 'Bad Format'
    })).toThrow();
  });

  it('safeParseEvent returns success=false for invalid', () => {
    const result = safeParseEvent({ title: 'No Date' });
    expect(result.success).toBe(false);
  });

  it('normalizeEvent fills defaults', () => {
    const event = normalizeEvent({});
    expect(event.date).toBe('1970-01-01');
    expect(event.title).toBe('Unknown Event');
    expect(event.type).toBe('other');
  });

  it('normalizeEvent preserves valid type', () => {
    const event = normalizeEvent({ type: 'festival', date: '2025-01-01' });
    expect(event.type).toBe('festival');
    expect(event.date).toBe('2025-01-01');
  });
});

// ============================================
// COMMUNITY TESTS
// ============================================

describe('Community Schema', () => {
  const validCommunity = {
    username: 'test_community',
    name: 'Test Community',
    city: 'Test City',
    country: 'Test Country'
  };

  it('parses valid community with minimal fields', () => {
    const community = parseCommunity(validCommunity);
    expect(community.username).toBe('test_community');
    expect(community.name).toBe('Test Community');
    expect(community.verified).toBe(false); // default
  });

  it('parses community with entityType', () => {
    const community = parseCommunity({
      ...validCommunity,
      entityType: 'festival'
    });
    expect(community.entityType).toBe('festival');
  });

  it('parses community with styles', () => {
    const community = parseCommunity({
      ...validCommunity,
      styles: ['lindy', 'blues']
    });
    expect(community.styles).toEqual(['lindy', 'blues']);
  });

  it('throws on missing required fields', () => {
    // name, city, country are required; username is optional
    expect(() => parseCommunity({ name: 'Test' })).toThrow(); // missing city, country
    expect(() => parseCommunity({ city: 'City', country: 'Country' })).toThrow(); // missing name
  });

  it('coerces invalid entityType to default', () => {
    // Schema uses .catch('community') for entityType, so invalid values
    // are replaced with 'community' rather than failing validation
    const community = parseCommunity({
      ...validCommunity,
      entityType: 'invalid_type'
    });
    expect(community.entityType).toBe('community');
  });

  it('safeParseCommunity returns success=false for invalid', () => {
    const result = safeParseCommunity({ name: 'Missing Username' });
    expect(result.success).toBe(false);
  });

  it('normalizeCommunity fills defaults', () => {
    const community = normalizeCommunity({});
    expect(community.name).toBe('Unknown');
    expect(community.city).toBe('Unknown');
    expect(community.country).toBe('Unknown');
    expect(community.entityType).toBe('community');
    expect(community.verified).toBe(false);
    expect(community.styles).toEqual([]);
  });

  it('normalizeCommunity filters invalid styles', () => {
    const community = normalizeCommunity({
      ...validCommunity,
      styles: ['lindy', 'invalid', 'blues', 'tango']
    });
    expect(community.styles).toEqual(['lindy', 'blues']);
  });

  it('normalizeCommunity defaults invalid entityType', () => {
    const community = normalizeCommunity({
      ...validCommunity,
      entityType: 'invalid'
    });
    expect(community.entityType).toBe('community');
  });
});

// ============================================
// SCRAPED DATA TESTS
// ============================================

describe('Scraped Schema', () => {
  it('normalizeScraped fills defaults', () => {
    const scraped = normalizeScraped({});
    expect(scraped.upcomingEvents).toEqual([]);
    expect(scraped.upcomingDates).toEqual([]);
  });

  it('normalizeScraped normalizes events array', () => {
    const scraped = normalizeScraped({
      upcomingEvents: [
        { date: '2025-01-01', title: 'Event 1' },
        { invalid: true }
      ]
    });
    expect(scraped.upcomingEvents).toHaveLength(2);
    expect(scraped.upcomingEvents[0].date).toBe('2025-01-01');
    expect(scraped.upcomingEvents[1].date).toBe('1970-01-01'); // normalized
  });

  it('normalizeScraped filters invalid confidence', () => {
    const scraped = normalizeScraped({ confidence: 'invalid' });
    expect(scraped.confidence).toBeUndefined();

    const validScraped = normalizeScraped({ confidence: 'high' });
    expect(validScraped.confidence).toBe('high');
  });
});

// ============================================
// FILE VALIDATION TESTS
// ============================================

describe('validateCommunitiesFile', () => {
  it('validates valid file structure', () => {
    const result = validateCommunitiesFile({
      communities: [
        {
          username: 'test',
          name: 'Test',
          city: 'City',
          country: 'Country'
        }
      ]
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects missing communities array', () => {
    const result = validateCommunitiesFile({});
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing or invalid "communities" array');
  });

  it('rejects non-object data', () => {
    const result = validateCommunitiesFile(null);
    expect(result.valid).toBe(false);
  });

  it('collects errors from invalid communities', () => {
    // Note: username is optional, but name/city/country are required
    const result = validateCommunitiesFile({
      communities: [
        { city: 'C', country: 'C' }, // missing required name
        { name: 'Has Name' }         // missing required city and country
      ]
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    // Should have errors about missing fields
    expect(result.errors.some(e => e.includes('name') || e.includes('city'))).toBe(true);
  });
});

// ============================================
// NORMALIZATION HELPERS
// ============================================

describe('normalizeCommunities', () => {
  it('normalizes array of communities', () => {
    const communities = normalizeCommunities([
      { username: 'a', name: 'A' },
      { username: 'b', name: 'B' }
    ]);
    expect(communities).toHaveLength(2);
    expect(communities[0].city).toBe('Unknown');
    expect(communities[1].city).toBe('Unknown');
  });

  it('returns empty array for non-array input', () => {
    expect(normalizeCommunities(null)).toEqual([]);
    expect(normalizeCommunities('not array')).toEqual([]);
  });
});
