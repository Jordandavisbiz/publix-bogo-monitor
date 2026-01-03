import { scrapeBogoDeals } from './scraper.js';

async function debug() {
  const products = await scrapeBogoDeals();

  console.log(`\nTotal products: ${products.length}`);
  console.log(`\nProducts WITH images: ${products.filter(p => p.image).length}`);
  console.log(`Products WITH prices: ${products.filter(p => p.price).length}`);

  console.log('\n=== First 10 Products (showing all data) ===');
  products.slice(0, 10).forEach((p, i) => {
    console.log(`\n${i + 1}. ${p.name}`);
    console.log(`   Image: ${p.image ? p.image.substring(0, 80) + '...' : 'NONE'}`);
    console.log(`   Price: ${p.price || 'NONE'}`);
  });
}

debug().catch(console.error);
