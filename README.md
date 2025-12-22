# Swing Scene Radar

> Find swing dance events and communities worldwide without scrolling Instagram.

A directory of swing dance events, weekly socials, and communities organized by city. Filter by location, date, and dance style to find Lindy Hop, Balboa, Blues, and Solo Jazz events.

## Features

- **Fast filtering** - Search by city, venue, or event name
- **Time filters** - View upcoming events by date range
- **Style filters** - Focus on specific dance styles (Lindy, Balboa, Blues, Solo Jazz)
- **Community + Festival directory** - Find weekly socials and festival events
- **Mobile responsive** - Works on all devices

## Quick Start

### View Locally

```bash
# Clone and serve
git clone https://github.com/YOUR_USERNAME/swing-scene-radar.git
cd swing-scene-radar
npx serve -l 3000
```

Visit `http://localhost:3000` in your browser.

### Refresh Event Data

```bash
cd backend
npm install

# Preview what would be scraped (no API calls)
node refresh-all.js --dry-run

# Run actual refresh
node refresh-all.js
```

Requires `DEEPINFRA_API_KEY` in environment for LLM parsing.

## Project Structure

```
CommunityWebsite/
├── index.html                 # Main page
├── styles.css                 # Styling
├── js/                        # Frontend ES modules
│   ├── state.js               # App state (single source of truth)
│   ├── logic.js               # Pure filter/sort functions
│   ├── filters.js             # Filter matching utilities
│   ├── components.js          # HTML renderers
│   ├── formatters.js          # Date/location formatting
│   ├── dataService.js         # Data fetching
│   └── ui/events.js           # DOM handlers + render loop
├── data/
│   └── communities.json       # Community/festival data with events
├── backend/
│   ├── refresh-all.js         # Main scraping orchestrator
│   ├── process-scraped.js     # Enrich scraped data with OCR + LLM
│   ├── test-scrape-one.js     # Scrape single IG profile (screenshot + bio)
│   ├── investigate-festivals.js # One-time festival → hybrid detection
│   ├── test-llm-classify.js   # OCR + LLM classification testing
│   ├── parse-with-llm.js      # Parse IG posts with LLM (legacy)
│   ├── lib/ocr.js             # OCR extraction + classification
│   ├── normalize/             # Output normalization module
│   ├── dedupe-merge/          # Event deduplication
│   ├── pipeline/              # Job runner + audit logging
│   ├── sync/                  # Data sync utilities
│   │   └── to-frontend.js     # Export SQLite → communities.json
│   └── storage/               # Data persistence layer
├── scripts/
│   └── smoke.js               # CI smoke test
├── .husky/
│   ├── pre-commit             # Validates communities.json
│   └── pre-push               # Blocks push if untracked files in backend/js/
└── CLAUDE.md                  # Full project documentation
```

## Commands

```bash
# Validate data
npm run validate

# Run tests
npm test

# Smoke test (validates critical imports)
npm run smoke

# Refresh events (requires DEEPINFRA_API_KEY)
node backend/refresh-all.js --dry-run    # Preview
node backend/refresh-all.js              # Execute
```

## Backend Scripts

### Core Pipeline

| Script | Purpose |
|--------|---------|
| `refresh-all.js` | Main orchestrator - decides what to scrape based on schedule |
| `test-scrape-one.js` | Scrape single IG profile → screenshot + bio links + external HTML |
| `process-scraped.js` | Enrich scraped data: OCR classification + LLM parsing |
| `sync/to-frontend.js` | Export SQLite → `data/communities.json` |

### Classification

| Script | Purpose |
|--------|---------|
| `lib/ocr.js` | OCR extraction (tesseract.js) + keyword/LLM classification |
| `test-llm-classify.js` | Test OCR + LLM classification on screenshots |
| `investigate-festivals.js` | One-time: detect festivals that are actually hybrids |

### Data Quality

| Script | Purpose |
|--------|---------|
| `validate-instagram-handles.js` | Validate handles are swing-related |
| `check-scrape-status.js` | Show scraping status for all entries |
| `cleanup-events.js` | Remove past events from database |

### Legacy (still available)

| Script | Purpose |
|--------|---------|
| `parse-with-llm.js` | Parse IG posts with LLM (original approach) |
| `parse-external.js` | Redirect → `process-scraped.js` |
| `generate-frontend-json.js` | Redirect → `sync/to-frontend.js` |

## Documentation

See [CLAUDE.md](CLAUDE.md) for:
- Scraping approaches and architecture
- LLM parsing setup (DeepInfra)
- Scraping schedule
- Development guidelines

## Automated Refresh

GitHub Actions runs `refresh-all.js` every 3 days with a random delay (anti-detection). See [.github/workflows/refresh-events.yml](.github/workflows/refresh-events.yml).

## License

MIT License
