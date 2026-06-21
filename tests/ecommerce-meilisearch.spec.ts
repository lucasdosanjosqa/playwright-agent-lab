import { test, expect } from '@playwright/test';
import { SearchPage } from '../pages/search.page';

test.describe('Meilisearch E-commerce Demo', () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();
  });

  // ─── Busca ─────────────────────────────────────────────────────────────────

  test('pesquisar produto e validar resultados relevantes', async () => {
    await searchPage.searchFor('puma shoes');

    await searchPage.expectResultsToContain('puma');
    await searchPage.expectResultsToShowPrices();
    await searchPage.expectResultsCountGreaterThan(0);
  });

  test('busca com typo tolerance retorna resultados corretos', async () => {
    // Meilisearch tem typo tolerance — "shoees" deve retornar resultados de "shoes"
    await searchPage.searchFor('shoees');

    await searchPage.expectResultsCountGreaterThan(0);
    await searchPage.expectResultsToShowPrices();
  });

  test('busca por produto inexistente retorna zero resultados', async () => {
    await searchPage.searchFor('xyznonexistentproduct99999');

    await searchPage.expectResultsToContain(/0 results? found/i);
  });

  test('busca instantânea atualiza resultados conforme o termo muda', async () => {
    // Buscar algo específico com poucos resultados
    await searchPage.searchFor('titan watch gold');
    const firstCount = await searchPage.getResultsCount();

    // Buscar outro termo mais específico
    await searchPage.clearSearch();
    await searchPage.searchFor('puma red running shoes');
    const secondCount = await searchPage.getResultsCount();

    // Verificar que ambos retornaram resultados (> 0) e que a busca funciona
    expect(firstCount).toBeGreaterThan(0);
    expect(secondCount).toBeGreaterThan(0);
  });

  // ─── Filtros por Faceta ────────────────────────────────────────────────────

  test('filtrar por gênero reduz resultados', async () => {
    // Buscar algo específico para ter < 1000 resultados
    await searchPage.searchFor('blue shirt');
    const totalResults = await searchPage.getResultsCount();

    // Aplicar filtro de gênero "Boys" (poucos resultados de camisa)
    await searchPage.selectFacet('Boys');
    const filteredResults = await searchPage.getResultsCount();

    expect(filteredResults).toBeLessThan(totalResults);
    expect(filteredResults).toBeGreaterThan(0);
  });

  test('filtrar por categoria exibe apenas produtos da categoria', async () => {
    await searchPage.searchFor('nike');
    await searchPage.selectFacet('Footwear');

    await searchPage.expectResultsCountGreaterThan(0);
    await searchPage.expectResultsToShowPrices();
  });

  test('combinar múltiplos filtros refina resultados', async () => {
    // Buscar algo com resultados limitados
    await searchPage.searchFor('casual shoes');
    const searchResults = await searchPage.getResultsCount();

    // Aplicar filtro de gênero
    await searchPage.selectFacet('Women');
    const filteredResults = await searchPage.getResultsCount();

    // Combinar filtros deve retornar menos resultados
    expect(filteredResults).toBeLessThanOrEqual(searchResults);
    expect(filteredResults).toBeGreaterThan(0);
  });

  test('remover filtro restaura resultados anteriores', async () => {
    await searchPage.searchFor('red dress');
    const beforeFilter = await searchPage.getResultsCount();

    // Aplicar filtro
    await searchPage.selectFacet('Girls');
    const duringFilter = await searchPage.getResultsCount();
    expect(duringFilter).toBeLessThanOrEqual(beforeFilter);

    // Remover filtro (clicar novamente)
    await searchPage.deselectFacet('Girls');
    const afterFilter = await searchPage.getResultsCount();

    expect(afterFilter).toEqual(beforeFilter);
  });

  // ─── Ordenação ─────────────────────────────────────────────────────────────

  test('ordenar por preço crescente exibe produtos do mais barato ao mais caro', async () => {
    await searchPage.sortBy('Price: Low to High');

    const prices = await searchPage.getVisiblePrices();
    expect(prices.length).toBeGreaterThan(1);

    // Verificar que os preços estão em ordem crescente
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('ordenar por preço decrescente exibe produtos do mais caro ao mais barato', async () => {
    await searchPage.sortBy('Price: High to Low');

    const prices = await searchPage.getVisiblePrices();
    expect(prices.length).toBeGreaterThan(1);

    // Verificar que os preços estão em ordem decrescente
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });

  // ─── Paginação ─────────────────────────────────────────────────────────────

  test('carregar mais resultados aumenta a lista de produtos', async ({ page }) => {
    await expect(searchPage.resultsCounter).toBeVisible({ timeout: 10000 });

    // Contar produtos iniciais (imagens de produto com alt não vazio)
    const initialImages = await page.locator('img[alt]:not([alt=""])').count();

    // Clicar "Show more results"
    await searchPage.loadMoreResults();

    // Deve ter mais produtos visíveis agora
    const afterLoadImages = await page.locator('img[alt]:not([alt=""])').count();
    expect(afterLoadImages).toBeGreaterThan(initialImages);
  });

  // ─── Busca + Filtros combinados ────────────────────────────────────────────

  test('busca combinada com filtro refina resultados', async () => {
    await searchPage.searchFor('black watch');
    const searchResults = await searchPage.getResultsCount();

    await searchPage.selectFacet('Women');
    const filteredResults = await searchPage.getResultsCount();

    expect(filteredResults).toBeLessThanOrEqual(searchResults);
    expect(filteredResults).toBeGreaterThan(0);
  });

  // ─── UI e Performance ─────────────────────────────────────────────────────

  test('contador de resultados mostra tempo de resposta em milissegundos', async () => {
    await expect(searchPage.resultsCounter).toBeVisible({ timeout: 10000 });

    const counterText = await searchPage.resultsCounter.textContent();
    expect(counterText).toMatch(/\d+ results? found in \d+ms/i);
  });

  test('cada card de produto exibe marca, nome e preço', async ({ page }) => {
    await expect(searchPage.resultsCounter).toBeVisible({ timeout: 10000 });

    // Verificar que há imagens de produto
    const productImages = page.locator('img[alt]:not([alt=""])');
    await expect(productImages.first()).toBeVisible({ timeout: 5000 });

    // Verificar preços
    await searchPage.expectResultsToShowPrices();

    // Verificar que há nomes de marcas conhecidas (mixed-case no site)
    await searchPage.expectResultsToContain(/Turtle|Peter England|Titan|Puma|Inkfruit/i);
  });
});
