# Schema - Canonical Data Contracts

This folder is the **single source of truth** for all data shapes in Swing Scene Radar.

## Usage

### Backend (CommonJS)
```javascript
const {
  CommunitySchema,
  parseCommunity,
  safeParseCommunity,
  ENTITY_TYPES,
  EVENT_TYPES
} = require('../schema');
```

### Frontend (ESM)
```javascript
import {
  normalizeCommunity,
  ENTITY_TYPES,
  EVENT_TYPES
} from '../schema/index.mjs';
```

## Files

| File | Purpose |
|------|---------|
| `enums.js` | All enumerated values (entity types, event types, styles) |
| `event.js` | Schema for scraped events |
| `scraped.js` | Schema for scraped metadata |
| `community.js` | Main schema for communities/festivals/hybrids |
| `scrapeRun.js` | Schema for pipeline execution records |
| `candidate.js` | Schema for discovery pipeline candidates |
| `submission.js` | Schema for future user submissions |
| `index.js` | CommonJS exports (backend) |
| `index.mjs` | ESM exports (frontend) |

## Schemas

### CommunitySchema

**Required fields:**
- `name` - Display name
- `city` - City location
- `country` - Country location

**Optional fields:**
- `username` - Instagram username (without @)
- `entityType` - One of: community, festival, hybrid, instructor, venue, vendor, band, dj, media, association
- `verified` - Boolean
- `styles` - Array of: lindy, bal, balboa, blues, solo, shag, charleston, wcs
- `instagram`, `website`, `linktree`, `email` - Contact URLs
- `scraped` - Scraped data object
- `festivalDates` - { startDate, endDate } for festivals
- Plus others (see community.js)

### EventSchema

**Required fields:**
- `date` - YYYY-MM-DD format
- `title` - Event title

**Optional fields:**
- `type` - One of: social, class, workshop, party, festival, trial, other
- `sourceUrl` - Registration/info URL

## Validation

```bash
# Validate data/communities.json
npm run validate:data

# Run schema tests
npm test
```

## Design Decisions

1. **Minimal required fields** - Only `name`, `city`, `country` are required. Everything else has defaults.
2. **Permissive parsing** - Unknown fields pass through (`.passthrough()`).
3. **Safe defaults** - `entityType` defaults to 'community', event `type` defaults to 'other'.
4. **Dual exports** - CommonJS for backend, ESM for frontend.
5. **No breaking changes** - Existing data passes validation without edits.
