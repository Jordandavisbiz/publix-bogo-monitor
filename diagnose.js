import puppeteer from 'puppeteer';

async function diagnose() {
  const browser = await puppeteer.launch({
    headless: false,  // Run with visible browser
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Opening Publix BOGO page in visible browser...');
  console.log('This will stay open for 30 seconds so you can see what loads');

  await page.goto('https://www.publix.com/savings/weekly-ad/bogo', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // Wait 30 seconds
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Get page content
  const content = await page.content();
  const text = await page.evaluate(() => document.body.innerText);

  console.log('\n=== Page Title ===');
  console.log(await page.title());

  console.log('\n=== Product Links Found ===');
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/pd/"]')).map(a => ({
      href: a.href,
      text: a.innerText?.substring(0, 100)
    }));
  });

  console.log(`Found ${links.length} product links`);
  links.slice(0, 10).forEach((link, i) => {
    console.log(`${i + 1}. ${link.text}`);
  });

  await browser.close();
}

diagnose().catch(console.error);
