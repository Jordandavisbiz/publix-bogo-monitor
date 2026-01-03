# Publix BOGO Monitor

Automatically monitor Publix Buy One Get One (BOGO) deals and receive daily email notifications when your favorite products are on sale.

## Features

- Scrapes Publix BOGO deals daily
- Filters deals based on your favorite products
- Sends email notifications with matching deals
- Runs on a schedule (default: 9 AM daily)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Email Settings

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

Edit `.env` and add your email settings:

#### For Gmail:

1. Use your Gmail address as `EMAIL_USER`
2. For `EMAIL_PASSWORD`, you need an **App Password** (not your regular Gmail password):
   - Go to https://myaccount.google.com/apppasswords
   - Sign in to your Google account
   - Create a new app password for "Mail"
   - Copy the 16-character password and paste it in `.env`

Example `.env` file:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_TO=yourname@gmail.com

FAVORITE_PRODUCTS=chicken,ice cream,coffee,bread,cheese,chips

SCHEDULE=0 9 * * *
```

### 3. Customize Your Favorite Products

Edit the `FAVORITE_PRODUCTS` line in `.env` with comma-separated keywords:

```env
FAVORITE_PRODUCTS=chicken,ice cream,coffee,bread,cheese,pizza,chips,soda
```

The app will match products containing any of these keywords.

### 4. Adjust Schedule (Optional)

The `SCHEDULE` uses cron format:

- `0 9 * * *` - 9 AM daily (default)
- `0 8 * * *` - 8 AM daily
- `0 20 * * *` - 8 PM daily
- `0 9 * * 1` - 9 AM every Monday

## Running the App

### Test the scraper first:

```bash
npm test
```

This will scrape the current BOGO deals and display them in the console.

### Run a one-time check with email:

```bash
npm start -- --once
```

This will scrape deals, filter for your favorites, and send an email.

### Start the scheduled monitor:

```bash
npm start
```

This will run continuously and check for deals according to your schedule.

## Deployment Options

### Option 1: Run on Your Computer

Keep the app running on your local machine. Works great if your computer is usually on.

### Option 2: Deploy to Cloud

Deploy to a cloud service for 24/7 monitoring:

- **Railway.app** (Free tier available)
- **Heroku** (Free tier available)
- **DigitalOcean** ($5/month)
- **AWS EC2** (Free tier for 1 year)

For cloud deployment, you'll need to add your `.env` variables to the platform's environment settings.

## Troubleshooting

### "Invalid login" error

Make sure you're using an App Password for Gmail, not your regular password.

### No products found

The Publix website structure may have changed. Check the console output and you may need to update the scraper selectors.

### Email not sending

1. Verify your email credentials in `.env`
2. Check that your email service allows "less secure app access" or app passwords
3. Try running with `npm start -- --once` to see error messages

## Notes

- The scraper uses Puppeteer which launches a headless Chrome browser
- First run may take a minute as it downloads Chrome browser
- BOGO deals typically update weekly (usually Wednesday/Thursday)
