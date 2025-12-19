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
│   ├── parse-external.js      # Parse external links with LLM
│   ├── parse-with-llm.js      # Parse IG posts with LLM
│   ├── normalize/             # Output normalization module
│   ├── dedupe-merge/          # Event deduplication
│   ├── pipeline/              # Job runner + audit logging
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
