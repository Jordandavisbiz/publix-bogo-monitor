# Deploy to Railway.app

## Step 1: Push to GitHub

1. Go to https://github.com/new
2. Create a new repository (name it `publix-bogo-monitor`)
3. **DO NOT** initialize with README (we already have code)
4. Copy the commands shown and run them:

```bash
cd /Users/davisjr01/publix-bogo-monitor
git remote add origin https://github.com/YOUR-USERNAME/publix-bogo-monitor.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Railway

1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select your `publix-bogo-monitor` repository
4. Railway will automatically detect it's a Node.js app

## Step 3: Add Environment Variables

In Railway dashboard:

1. Click on your deployed service
2. Go to **"Variables"** tab
3. Click **"Raw Editor"**
4. Paste your environment variables:

```
EMAIL_SERVICE=gmail
EMAIL_USER=jordandavisbiz@gmail.com
EMAIL_PASSWORD=shia xvon iqun xstl
EMAIL_TO=jordandavisbiz@gmail.com
FAVORITE_PRODUCTS=Beef,Steak,Waterloo,Sparkling Water,Energy Drink
SCHEDULE=0 7 1,2,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31 * *
```

5. Click **"Update Variables"**

## Step 4: Deploy

Railway will automatically deploy your app. You should see:
- Build logs
- Deploy logs
- Your app running

## Step 5: Verify It's Working

Check the logs in Railway dashboard. You should see:
```
Starting Publix BOGO Monitor...
Schedule: 0 7 1,2,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31 * *
Running initial check...
```

## Important Notes

### Puppeteer on Railway

Railway needs special configuration for Puppeteer. If you see errors about Chrome, you need to add this to your environment variables:

```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### Alternative: Use Nixpacks Buildpack

Railway will automatically use Nixpacks which should handle Puppeteer dependencies.

## Troubleshooting

**Chrome/Puppeteer errors?**
- Add the Puppeteer environment variables above
- Or add a `nixpacks.toml` file (see below)

**App not staying running?**
- Check that it's deployed as a "worker" not a "web service"
- The app should run continuously (not just respond to web requests)

### Optional: nixpacks.toml for Puppeteer Support

Create this file in your project root if you have Puppeteer issues:

```toml
[phases.setup]
nixPkgs = ["nodejs", "chromium"]

[phases.install]
cmds = ["npm ci"]

[start]
cmd = "node index.js"
```

## Cost

- Railway free tier: $5 credit/month
- This app should cost ~$0.50-1.00/month (very low usage)
- Plenty within free tier!

## Stop the Local Version

Once deployed to Railway, stop your local Mac version:

```bash
cd /Users/davisjr01/publix-bogo-monitor
./uninstall-autostart.sh
```

Now your app runs 24/7 in the cloud! ☁️
