import dotenv from 'dotenv';
import { scrapeBogoDeals } from './scraper.js';
import { filterFavoriteProducts } from './filter.js';

dotenv.config();

async function testFilter() {
  console.log('Scraping BOGO deals...');
  const allProducts = await scrapeBogoDeals();
  console.log(`Total products found: ${allProducts.length}`);

  const favoriteKeywords = (process.env.FAVORITE_PRODUCTS || '')
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  console.log(`\nYour favorite keywords: ${favoriteKeywords.join(', ')}`);

  const matchingProducts = filterFavoriteProducts(allProducts, favoriteKeywords);
  console.log(`\nMatching products: ${matchingProducts.length}\n`);

  // Show breakdown by keyword
  favoriteKeywords.forEach(keyword => {
    const matches = allProducts.filter(p => {
      const searchText = `${p.name} ${p.description} ${p.fullText}`.toLowerCase();
      return searchText.includes(keyword.toLowerCase());
    });
    console.log(`${keyword}: ${matches.length} matches`);

    // Show first 3 examples
    matches.slice(0, 3).forEach(m => {
      console.log(`  - ${m.name}`);
    });
  });

  console.log(`\n=== First 10 Matching Products ===`);
  matchingProducts.slice(0, 10).forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
  });
}

testFilter().catch(console.error);
