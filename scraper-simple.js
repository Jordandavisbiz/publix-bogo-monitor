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

    console.log('Navigating to Publix BOGO page...');
    await page.goto('https://www.publix.com/savings/weekly-ad/bogo', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Scroll to load lazy-loaded content
    await page.evaluate(async () => {
      for (let i = 0; i < 10; i++) {
        window.scrollBy(0, window.innerHeight);
        await new Promise(r => setTimeout(r, 500));
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract all text and links
    const products = await page.evaluate(() => {
      const items = new Map();  // Use map to auto-dedupe by name

      // Find all links with product detail URLs
      const links = Array.from(document.querySelectorAll('a'));

      links.forEach(link => {
        const href = link.href || '';

        // Only look at product detail links
        if (!href.includes('/pd/')) return;

        // Get text content
        const text = link.innerText || '';
        if (text.length < 5) return;

        // Get product name (usually first line)
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const name = lines[0];

        if (!name || name.length < 4) return;

        // Skip navigation items
        if (name.includes('Weekly') ||
            name.includes('Coupon') ||
            name.includes('Sign') ||
            name === 'BOGO') return;

        // Get full text for searching
        const fullText = text.replace(/\n/g, ' ');

        items.set(name, {
          name: name,
          description: fullText,
          fullText: fullText,
          price: ''  // Price extraction can be added later
        });
      });

      return Array.from(items.values());
    });

    console.log(`Found ${products.length} unique products`);
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
      console.log('\n=== Sample Products ===');
      products.slice(0, 20).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
      });
    })
    .catch(error => {
      console.error('Failed:', error);
      process.exit(1);
    });
}
