# 🎭 Playwright Agent Lab

> Projeto de automação E2E construído inteiramente com IA + MCP (Model Context Protocol) do Playwright, demonstrando como escalar testes com arquitetura profissional.

[![Playwright Tests](https://github.com/lucascorrea/playwright-agent-lab/actions/workflows/playwright.yml/badge.svg)](https://github.com/lucascorrea/playwright-agent-lab/actions/workflows/playwright.yml)

## 🎯 O que este projeto demonstra

Este repositório é um **portfólio de QA Automation** que prova domínio em:

- **Automação com IA** — Testes gerados e refinados com assistência de agentes de IA (Kiro + MCP Playwright)
- **Page Object Model (POM)** — Arquitetura escalável para centenas de testes sem dívida técnica
- **CI/CD com GitHub Actions** — Pipeline automatizado com matrix strategy para 3 browsers em paralelo
- **Meilisearch E-commerce** — Suite de testes contra um site real de busca com filtros, ordenação e paginação

## 🏗️ Arquitetura

```
playwright-agent-lab/
├── pages/
│   └── search.page.ts          # Page Object — encapsula toda interação com o site
├── tests/
│   └── ecommerce-meilisearch.spec.ts  # 14 cenários de teste E2E
├── .github/workflows/
│   └── playwright.yml          # CI com matrix (chromium, firefox, webkit)
├── .kiro/settings/
│   └── mcp.json                # Configuração do MCP Playwright
├── playwright.config.ts        # Config multi-browser com traces
└── package.json
```

## 🧪 Cenários de Teste

| # | Cenário | Funcionalidade testada |
|---|---------|----------------------|
| 1 | Busca por produto | Pesquisa retorna resultados relevantes com preços |
| 2 | Typo tolerance | Meilisearch corrige erros de digitação ("shoees" → shoes) |
| 3 | Produto inexistente | Zero resultados exibidos corretamente |
| 4 | Busca instantânea | Resultados atualizam em tempo real ao mudar o termo |
| 5 | Filtro por gênero | Faceta "Boys" reduz contagem de resultados |
| 6 | Filtro por categoria | "Footwear" filtra apenas calçados |
| 7 | Múltiplos filtros | Combinação progressiva refina resultados |
| 8 | Remoção de filtro | Desmarcar restaura resultados anteriores |
| 9 | Ordenação crescente | Preços ordenados de menor para maior |
| 10 | Ordenação decrescente | Preços ordenados de maior para menor |
| 11 | Paginação | "Show more" carrega mais produtos |
| 12 | Busca + filtro | Faceta refina busca textual |
| 13 | Tempo de resposta | Counter exibe latência em milissegundos |
| 14 | Card de produto | Marca, nome e preço visíveis em cada card |

**Total: 42 execuções** (14 cenários × 3 browsers)

## 🚀 Como rodar

```bash
# Instalar dependências
npm ci

# Instalar browsers do Playwright
npx playwright install --with-deps

# Rodar todos os testes (3 browsers)
npx playwright test

# Rodar apenas Chromium
npx playwright test --project=chromium

# Ver relatório HTML
npx playwright show-report
```

## ⚙️ CI/CD — GitHub Actions

O workflow roda automaticamente a cada **push** ou **PR** para `main`/`master`:

- **Matrix Strategy** — 3 jobs paralelos (Chromium, Firefox, WebKit)
- **Artefatos salvos** — Relatório HTML + Traces disponíveis na aba Actions
- **Traces para debug** — Capturados em toda falha (`retain-on-failure`)

## 🤖 MCP do Playwright

O projeto está configurado para usar o [Playwright MCP Server](https://github.com/playwright-community/mcp) como ferramenta de exploração e codegen:

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

Isso permite que agentes de IA naveguem pelo site em tempo real, identifiquem locators e gerem código de teste automaticamente.

## 📐 Page Object Model

A classe `SearchPage` encapsula toda a complexidade de interação:

```typescript
// Uso limpo no teste
const searchPage = new SearchPage(page);
await searchPage.navigate();
await searchPage.searchFor('puma shoes');
await searchPage.selectFacet('Women');
await searchPage.sortBy('Price: Low to High');
await searchPage.expectResultsToContain('puma');
```

**Benefícios:**
- Testes leem como documentação de negócio
- Se o HTML mudar, só o Page Object precisa de ajuste
- Novos cenários reutilizam métodos existentes

## 🛠️ Stack

- **Playwright** `^1.61.0` — Framework de testes E2E
- **TypeScript** — Tipagem forte com IntelliSense
- **Kiro IDE** — Ambiente com agentes de IA
- **MCP (Model Context Protocol)** — Integração IA ↔ Browser
- **GitHub Actions** — CI/CD automatizado

## 📝 Licença

ISC
