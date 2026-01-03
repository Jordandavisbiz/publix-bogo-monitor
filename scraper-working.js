import puppeteer from 'puppeteer';

export async function scrapeBogoDeals() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Navigating to Publix BOGO page...');
    await page.goto('https://www.publix.com/savings/weekly-ad/bogo', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait and scroll to load all content
    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.evaluate(async () => {
      for (let i = 0; i < 10; i++) {
        window.scrollBy(0, window.innerHeight);
        await new Promise(r => setTimeout(r, 300));
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract products - try multiple strategies
    const products = await page.evaluate(() => {
      const items = [];
      const seen = new Set();

      // Strategy 1: Look for all elements that might be product cards
      const allElements = document.querySelectorAll('*');

      allElements.forEach(el => {
        const text = el.innerText || el.textContent || '';

        // Skip if too short or too long
        if (text.length < 20 || text.length > 500) return;

        // Must contain "Buy" or "BOGO" or price indicator
        if (!text.includes('Buy 1 Get 1') &&
            !text.includes('BOGO') &&
            !text.includes('FREE') &&
            !text.length > 30) return;

        // Try to extract product name (usually first substantial line)
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
        if (lines.length === 0) return;

        let productName = lines[0];

        // Skip navigation/header text
        if (productName.includes('Weekly ad') ||
            productName.includes('Digital coupon') ||
            productName.includes('Shopping list') ||
            productName.includes('Sign up') ||
            productName.includes('Log in') ||
            productName.length < 4) return;

        // Deduplicate
        if (seen.has(productName.toLowerCase())) return;
        seen.add(productName.toLowerCase());

        items.push({
          name: productName,
          price: '',
          description: text.substring(0, 200),
          fullText: text
        });
      });

      return items;
    });

    console.log(`Found ${products.length} products`);

    // If we found very few products, show debug info
    if (products.length < 10) {
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('Low product count. Page content preview:');
      console.log(pageText.substring(0, 500));
    }

    return products;

  } catch (error) {
    console.error('Error scraping BOGO deals:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Test when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeBogoDeals()
    .then(products => {
      console.log('\n=== BOGO Deals Found ===');
      products.slice(0, 30).forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        if (product.description && product.description !== product.name) {
          console.log(`   ${product.description.substring(0, 100)}`);
        }
      });
    })
    .catch(error => {
      console.error('Failed to scrape:', error);
      process.exit(1);
    });
}
