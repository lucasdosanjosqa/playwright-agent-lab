import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object para o site ecommerce.meilisearch.com
 *
 * Encapsula todas as interações com a página de busca:
 * pesquisa instantânea, filtros por faceta, ordenação e paginação.
 */
export class SearchPage {
  readonly page: Page;
  readonly url = 'https://ecommerce.meilisearch.com/';

  // ─── Locators ──────────────────────────────────────────────────────────────
  readonly cookieAcceptButton: Locator;
  readonly searchInput: Locator;
  readonly resultsCounter: Locator;
  readonly showMoreButton: Locator;
  readonly addToCartButton: Locator;
  readonly cartTrigger: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cookieAcceptButton = page.getByRole('button', { name: /accept all/i }).first();
    this.searchInput = page.getByRole('searchbox', { name: 'Search...' }).first();
    this.resultsCounter = page.getByText(/\d+ results? found/i);
    this.showMoreButton = page.getByText(/show more results/i);
    this.addToCartButton = page.getByRole('button', { name: /add to (cart|bag)/i }).first();
    this.cartTrigger = page
      .locator('[aria-label*="cart" i], [aria-label*="bag" i], a[href*="cart"]')
      .first();
    this.sortDropdown = page.locator('select, [role="listbox"], [class*="sort"]').first();
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  /** Navega para o site e fecha o cookie banner se presente. */
  async navigate(): Promise<void> {
    await this.page.goto(this.url);
    await this.dismissCookieBanner();
  }

  /** Fecha o banner de cookies caso apareça. */
  async dismissCookieBanner(): Promise<void> {
    try {
      await this.cookieAcceptButton.waitFor({ state: 'visible', timeout: 8000 });
      await this.cookieAcceptButton.click();
      await this.cookieAcceptButton.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    } catch {
      // Banner pode não aparecer — seguir normalmente
    }
  }

  // ─── Search ────────────────────────────────────────────────────────────────

  /** Realiza uma busca e aguarda os resultados carregarem. */
  async searchFor(query: string): Promise<void> {
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await this.searchInput.click();
    await this.searchInput.fill(query);
    await expect(this.resultsCounter).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(1000);
  }

  /** Limpa o campo de busca. */
  async clearSearch(): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill('');
    await this.page.waitForTimeout(1000);
  }

  // ─── Filters ───────────────────────────────────────────────────────────────

  /** Seleciona um filtro de faceta (Gender, Category, etc.) pelo label visível. */
  async selectFacet(facetValue: string): Promise<void> {
    const facetCheckbox = this.page
      .locator('label, [role="checkbox"], button')
      .filter({ hasText: new RegExp(`^\\s*${facetValue}`, 'i') })
      .first();
    await facetCheckbox.waitFor({ state: 'visible', timeout: 5000 });
    await facetCheckbox.click();
    // Aguardar resultados atualizarem
    await this.page.waitForTimeout(1500);
  }

  /** Remove um filtro de faceta clicando nele novamente. */
  async deselectFacet(facetValue: string): Promise<void> {
    await this.selectFacet(facetValue);
  }

  // ─── Sorting ───────────────────────────────────────────────────────────────

  /** Seleciona uma opção de ordenação. Aceita: "Price: Low to High" ou "Price: High to Low". */
  async sortBy(option: string): Promise<void> {
    // O select de sort tem classe "pr-5 input" e é o último <select> na página
    const select = this.page.locator('select.input');
    await select.waitFor({ state: 'visible', timeout: 5000 });

    // Mapear label legível para value do <select>
    let value: string;
    if (/low to high/i.test(option)) {
      value = 'fashion-products:price:asc';
    } else if (/high to low/i.test(option)) {
      value = 'fashion-products:price:desc';
    } else {
      value = 'fashion-products';
    }

    await select.selectOption(value);
    await this.page.waitForTimeout(2000);
  }

  // ─── Pagination ────────────────────────────────────────────────────────────

  /** Clica em "Show more results" para carregar mais produtos. */
  async loadMoreResults(): Promise<void> {
    await this.showMoreButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.showMoreButton.click();
    await this.page.waitForTimeout(2000);
  }

  // ─── Product Interaction ───────────────────────────────────────────────────

  /** Retorna o primeiro link de produto que contenha o texto informado. */
  getProductLink(text: string | RegExp): Locator {
    const pattern = typeof text === 'string' ? new RegExp(text, 'i') : text;
    return this.page.locator('a').filter({ hasText: pattern }).first();
  }

  /** Clica no primeiro produto e aguarda a navegação. Retorna true se encontrou. */
  async openProduct(text: string | RegExp): Promise<boolean> {
    const link = this.getProductLink(text);
    const isVisible = await link.isVisible({ timeout: 3000 }).catch(() => false);
    if (!isVisible) return false;

    await link.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
    return true;
  }

  /** Tenta adicionar o produto atual ao carrinho. Retorna true se bem-sucedido. */
  async addToCart(): Promise<boolean> {
    const isVisible = await this.addToCartButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) return false;

    await this.addToCartButton.click();
    await this.page.waitForTimeout(1500);
    return true;
  }

  /** Abre o carrinho/resumo da compra. */
  async openCart(): Promise<boolean> {
    const isVisible = await this.cartTrigger.isVisible({ timeout: 3000 }).catch(() => false);
    if (!isVisible) return false;

    await this.cartTrigger.click();
    await this.page.waitForTimeout(1500);
    return true;
  }

  /** Volta à página anterior. */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ─── Data Extraction ───────────────────────────────────────────────────────

  /** Extrai o número de resultados do contador. */
  async getResultsCount(): Promise<number> {
    const text = await this.resultsCounter.textContent();
    const match = text?.match(/(\d+)\s*results?/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  /** Extrai os preços visíveis dos cards de produto como array de números. */
  async getVisiblePrices(): Promise<number[]> {
    // Os preços de produto usam classe "body-l mb-2", enquanto o slider usa "body-m"
    const priceElements = this.page.locator('p.mb-2');
    const count = await priceElements.count();
    const prices: number[] = [];

    for (let i = 0; i < Math.min(count, 20); i++) {
      const text = await priceElements.nth(i).textContent();
      const match = text?.match(/\$\s*(\d+\.\d{2})/);
      if (match) prices.push(parseFloat(match[1]));
    }
    return prices;
  }

  /** Conta o número de cards de produto visíveis na página. */
  async getVisibleProductCount(): Promise<number> {
    // Os produtos têm imagens com alt text ou estão em cards com preço
    const products = this.page.locator('img[alt]').filter({ hasNot: this.page.locator('[class*="logo"]') });
    return products.count();
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  /** Verifica que resultados contêm o texto esperado. */
  async expectResultsToContain(text: string | RegExp): Promise<void> {
    const pattern = typeof text === 'string' ? new RegExp(text, 'i') : text;
    await expect(this.page.locator('body')).toContainText(pattern, { timeout: 5000 });
  }

  /** Verifica que resultados exibem preços no formato $XX.XX */
  async expectResultsToShowPrices(): Promise<void> {
    await expect(this.page.locator('body')).toContainText(/\$\s*\d+\.\d{2}/, { timeout: 5000 });
  }

  /** Verifica que o contador de resultados está visível. */
  async expectResultsCounterVisible(): Promise<void> {
    await expect(this.resultsCounter).toBeVisible({ timeout: 5000 });
  }

  /** Verifica que o número de resultados é menor que o valor informado. */
  async expectResultsCountLessThan(max: number): Promise<void> {
    const count = await this.getResultsCount();
    expect(count).toBeLessThan(max);
  }

  /** Verifica que o número de resultados é maior que zero. */
  async expectResultsCountGreaterThan(min: number): Promise<void> {
    const count = await this.getResultsCount();
    expect(count).toBeGreaterThan(min);
  }
}
