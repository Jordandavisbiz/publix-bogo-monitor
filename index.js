import cron from 'node-cron';
import dotenv from 'dotenv';
import { scrapeBogoDeals } from './scraper.js';
import { filterFavoriteProducts, formatProductsForEmail } from './filter.js';
import { sendEmail } from './emailer.js';

dotenv.config();

async function checkBogoDeals() {
  console.log(`\n=== Running BOGO Check at ${new Date().toLocaleString()} ===`);

  try {
    // 1. Scrape BOGO deals
    console.log('Step 1: Scraping BOGO deals...');
    const allProducts = await scrapeBogoDeals();

    // 2. Filter for favorites
    console.log('Step 2: Filtering for favorite products...');
    const favoriteKeywords = (process.env.FAVORITE_PRODUCTS || '')
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    console.log(`Looking for: ${favoriteKeywords.join(', ')}`);

    const matchingProducts = filterFavoriteProducts(allProducts, favoriteKeywords);
    console.log(`Found ${matchingProducts.length} matching products`);

    // 3. Send email notification
    console.log('Step 3: Sending email notification...');
    const emailConfig = {
      service: process.env.EMAIL_SERVICE || 'gmail',
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER
    };

    if (!emailConfig.user || !emailConfig.password) {
      console.error('ERROR: Email credentials not configured in .env file');
      return;
    }

    const subject = matchingProducts.length > 0
      ? `Publix BOGO Alert: ${matchingProducts.length} matching deals found!`
      : 'Publix BOGO: No matching deals today';

    const htmlContent = formatProductsForEmail(matchingProducts, favoriteKeywords);

    await sendEmail(subject, htmlContent, emailConfig);

    console.log('=== Check Complete ===\n');
  } catch (error) {
    console.error('Error during BOGO check:', error);

    // Try to send error notification
    try {
      const emailConfig = {
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER
      };

      if (emailConfig.user && emailConfig.password) {
        await sendEmail(
          'Publix BOGO Monitor - Error',
          `<p>An error occurred while checking BOGO deals:</p><pre>${error.message}</pre>`,
          emailConfig
        );
      }
    } catch (emailError) {
      console.error('Failed to send error notification:', emailError);
    }
  }
}

// Check if running in scheduled mode or one-time mode
const args = process.argv.slice(2);

if (args.includes('--once')) {
  // Run once and exit
  console.log('Running in one-time mode...');
  checkBogoDeals().then(() => {
    console.log('Done!');
    process.exit(0);
  });
} else {
  // Run on schedule
  const schedule = process.env.SCHEDULE || '0 9 * * *';
  console.log(`Starting Publix BOGO Monitor...`);
  console.log(`Schedule: ${schedule} (cron format)`);
  console.log(`Checking for: ${process.env.FAVORITE_PRODUCTS || 'all products'}`);
  console.log(`Email notifications to: ${process.env.EMAIL_TO || process.env.EMAIL_USER}`);
  console.log('\nPress Ctrl+C to stop\n');

  // Run immediately on start
  console.log('Running initial check...');
  checkBogoDeals();

  // Then schedule regular checks
  cron.schedule(schedule, () => {
    checkBogoDeals();
  });
}
