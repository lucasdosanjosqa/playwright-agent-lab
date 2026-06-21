# 🎭 Playwright Agent Lab

> End-to-end test automation project built entirely with AI + Playwright MCP (Model Context Protocol), showcasing how to scale tests with a professional architecture.

[![Playwright Tests](https://github.com/lucasdosanjosqa/playwright-agent-lab/actions/workflows/playwright.yml/badge.svg)](https://github.com/lucasdosanjosqa/playwright-agent-lab/actions/workflows/playwright.yml)

## 🎯 What this project demonstrates

This repository is a **QA Automation portfolio** proving proficiency in:

- **AI-driven automation** — Tests generated and refined with AI agents (Kiro + Playwright MCP)
- **Page Object Model (POM)** — Scalable architecture for hundreds of tests without technical debt
- **CI/CD with GitHub Actions** — Automated pipeline with matrix strategy across 3 browsers in parallel
- **Real-world testing** — Full test suite against a live Meilisearch e-commerce demo with filters, sorting, and pagination

## 🏗️ Architecture

```
playwright-agent-lab/
├── pages/
│   └── search.page.ts          # Page Object — encapsulates all site interactions
├── tests/
│   └── ecommerce-meilisearch.spec.ts  # 14 E2E test scenarios
├── .github/workflows/
│   └── playwright.yml          # CI with matrix (chromium, firefox, webkit)
├── .kiro/settings/
│   └── mcp.json                # Playwright MCP configuration
├── playwright.config.ts        # Multi-browser config with traces
└── package.json
```

## 🧪 Test Scenarios

| # | Scenario | Functionality tested |
|---|----------|---------------------|
| 1 | Product search | Search returns relevant results with prices |
| 2 | Typo tolerance | Meilisearch corrects typos ("shoees" → shoes) |
| 3 | Non-existent product | Zero results displayed correctly |
| 4 | Instant search | Results update in real-time as the query changes |
| 5 | Gender filter | "Boys" facet reduces result count |
| 6 | Category filter | "Footwear" filters only shoe-related items |
| 7 | Multiple filters | Progressive combination refines results |
| 8 | Filter removal | Unchecking restores previous results |
| 9 | Sort ascending | Prices ordered from lowest to highest |
| 10 | Sort descending | Prices ordered from highest to lowest |
| 11 | Pagination | "Show more" loads additional products |
| 12 | Search + filter | Facet refines text-based search |
| 13 | Response time | Counter displays latency in milliseconds |
| 14 | Product card | Brand, name, and price visible on each card |

**Total: 42 test executions** (14 scenarios × 3 browsers)

## 🚀 How to run

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run all tests (3 browsers)
npx playwright test

# Run Chromium only
npx playwright test --project=chromium

# View HTML report
npx playwright show-report
```

## ⚙️ CI/CD — GitHub Actions

The workflow runs automatically on every **push** or **PR** to `main`/`master`:

- **Matrix Strategy** — 3 parallel jobs (Chromium, Firefox, WebKit)
- **Artifacts saved** — HTML Report + Traces available in the Actions tab
- **Traces for debugging** — Captured on every failure (`retain-on-failure`)

## 🤖 Playwright MCP

The project is configured to use the [Playwright MCP Server](https://github.com/playwright-community/mcp) as an exploration and codegen tool:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest", "--browser=chromium", "--viewport-size=1366x768"]
    }
  }
}
```

This allows AI agents to navigate the site in real-time, identify locators, and generate test code automatically.

## 📐 Page Object Model

The `SearchPage` class encapsulates all interaction complexity:

```typescript
// Clean usage in tests
const searchPage = new SearchPage(page);
await searchPage.navigate();
await searchPage.searchFor('puma shoes');
await searchPage.selectFacet('Women');
await searchPage.sortBy('Price: Low to High');
await searchPage.expectResultsToContain('puma');
```

**Benefits:**
- Tests read like business documentation
- If the HTML changes, only the Page Object needs updating
- New scenarios reuse existing methods

## 🛠️ Tech Stack

- **Playwright** `^1.61.0` — E2E testing framework
- **TypeScript** — Strong typing with IntelliSense
- **Kiro IDE** — AI-powered development environment
- **MCP (Model Context Protocol)** — AI ↔ Browser integration
- **GitHub Actions** — Automated CI/CD

## 📝 License

ISC
