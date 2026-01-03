import puppeteer from 'puppeteer';

export async function scrapeBogoDeals() {
  console.log('Launching browser...');

  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  };

  // Use custom Chromium path if specified (optional)
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    console.log(`Using custom Chromium at: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
  } else {
    console.log('Using Puppeteer bundled Chromium');
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();

    // Intercept API calls to capture product data
    const apiResponses = [];
    await page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/') || url.includes('bogo') || url.includes('offer') || url.includes('deal')) {
        try {
          const data = await response.json();
          apiResponses.push(data);
        } catch (e) {
          // Not JSON, ignore
        }
      }
    });

    // Set viewport and user agent to avoid bot detection
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Navigating to Publix BOGO page...');
    await page.goto('https://www.publix.com/savings/weekly-ad/bogo', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if we need to select a store
    console.log('Checking for store selector...');
    const hasStoreButton = await page.$('button').then(el => el !== null);

    if (hasStoreButton) {
      // Click first available store or search button
      try {
        await page.click('button').catch(() => {});
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.log('No store selection needed');
      }
    }

    // Wait for products to load
    console.log('Waiting for products to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Scroll to trigger lazy loading
    console.log('Scrolling to load all products...');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });

    // Wait after scrolling
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract product information using broader selectors
    const products = await page.evaluate(() => {
      const items = [];
      const seenProducts = new Set();

      // Try multiple selector strategies to catch products
      const selectors = [
        '[class*="product"]',
        '[class*="item"]',
        '[class*="card"]',
        '[data-testid*="product"]',
        'article'
      ];

      let elements = [];
      for (const selector of selectors) {
        elements = document.querySelectorAll(selector);
        if (elements.length > 0) break;
      }

      elements.forEach(element => {
        const text = element.innerText || element.textContent || '';

        // Look for product name first
        const nameEl = element.querySelector('h1, h2, h3, h4, h5, h6, strong, [class*="title"], [class*="name"], [class*="brand"]');
        let name = nameEl ? nameEl.innerText.trim() : '';

        // If no name found in heading, try first meaningful line of text
        if (!name && text) {
          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
          name = lines[0] || '';
        }


        // Look for price (multiple patterns)
        const priceEl = element.querySelector('[class*="price"], [class*="Price"], [class*="cost"]');
        let price = priceEl ? priceEl.innerText.trim() : '';

        // Look for description
        const descEl = element.querySelector('p, [class*="description"], [class*="desc"]');
        const description = descEl ? descEl.innerText.trim() : '';

        // If no price element found, try to extract from text
        if (!price && text) {
          // Look for patterns like "$10.99 lb", "$5.99", "2 for $5", etc.
          const priceMatch = text.match(/\$\d+\.\d{2}(?:\s*(?:lb|ea|each|oz|for))?/);
          if (priceMatch) {
            price = priceMatch[0];
          }
        }

        // Skip navigation, menus, and generic items
        const skipTerms = [
          'Weekly ad', 'Digital coupon', 'Sign up', 'Log in', 'Shopping list',
          'Order Sushi', 'Order Subs', 'Catering', 'Delivery', 'Savings',
          'Order ahead', 'Gift Cards', 'BOGO', 'Bakery', 'Deli', 'Floral',
          'Meat', 'Produce', 'Seafood', 'Beer & Wine', 'Dairy', 'Frozen',
          'Grocery', 'Health', 'Baby', 'Beauty', 'Housewares', 'Non-Foods',
          'Pet', 'Flyer View', 'List View', 'Filters'
        ];

        const shouldSkip = skipTerms.some(term => name.includes(term));

        if (name &&
            name.length > 3 &&
            !shouldSkip &&
            !seenProducts.has(name.toLowerCase())) {

          seenProducts.add(name.toLowerCase());

          items.push({
            name: name,
            price: price,
            description: description || text.substring(0, 200),
            fullText: text
          });
        }
      });

      return items;
    });

    console.log(`Found ${products.length} products`);

    if (products.length === 0) {
      // Fallback: get all text content
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('No products found with selectors. Page content preview:');
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

// Test the scraper when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeBogoDeals()
    .then(products => {
      console.log('\n=== BOGO Deals Found ===');
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        if (product.price) console.log(`   Price: ${product.price}`);
        if (product.description && product.description !== product.name) {
          console.log(`   ${product.description}`);
        }
      });
    })
    .catch(error => {
      console.error('Failed to scrape:', error);
      process.exit(1);
    });
}
