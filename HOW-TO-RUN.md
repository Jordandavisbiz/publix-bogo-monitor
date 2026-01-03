# How to Run Your Publix BOGO Monitor

## Quick Commands

### Run Once (Get Email Immediately)
```bash
cd /Users/davisjr01/publix-bogo-monitor
npm start -- --once
```
Scrapes deals, filters for your favorites, sends email, then stops.

---

### Start Background Service (Runs Daily at 9 AM)
```bash
cd /Users/davisjr01/publix-bogo-monitor
./start.sh
```
Runs in the background. You can close the terminal and it keeps running.

### Stop Background Service
```bash
cd /Users/davisjr01/publix-bogo-monitor
./stop.sh
```

### Check If It's Running
```bash
ps aux | grep publix-bogo-monitor
```

### View Logs
```bash
cd /Users/davisjr01/publix-bogo-monitor
tail -f app.log
```

---

## Option 1: Manual Run (Whenever You Want)

Just run the "once" command above whenever you want to check for deals.

**Best for:** Checking deals on-demand (Wednesdays when BOGO updates, etc.)

---

## Option 2: Keep Terminal Open

```bash
cd /Users/davisjr01/publix-bogo-monitor
npm start
```

**Pros:** Simple, you can see what's happening
**Cons:** Terminal must stay open, stops when you close it or restart computer

---

## Option 3: Background Script (Recommended for Mac)

### Start
```bash
./start.sh
```

### Stop
```bash
./stop.sh
```

**Pros:** Runs in background, can close terminal
**Cons:** Stops when you restart your computer

---

## Option 4: Run on Startup (Mac - LaunchAgent)

Create a file at `~/Library/LaunchAgents/com.publix.bogo.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.publix.bogo</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/npm</string>
        <string>start</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/davisjr01/publix-bogo-monitor</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/davisjr01/publix-bogo-monitor/app.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/davisjr01/publix-bogo-monitor/error.log</string>
</dict>
</plist>
```

Then run:
```bash
launchctl load ~/Library/LaunchAgents/com.publix.bogo.plist
```

**Pros:** Automatically starts when you log in, restarts if it crashes
**Cons:** More complex to set up

To stop:
```bash
launchctl unload ~/Library/LaunchAgents/com.publix.bogo.plist
```

---

## Recommended Setup

**For testing:** Use `npm start -- --once` to test whenever you want

**For daily automation:**
1. Use `./start.sh` to start it running
2. It will email you daily at 9 AM
3. Use `./stop.sh` if you want to stop it
4. Restart your computer? Just run `./start.sh` again

---

## Changing Your Favorites

Edit the `.env` file:
```bash
nano .env
```

Change this line:
```
FAVORITE_PRODUCTS=chicken,ice cream,coffee,bread,cheese,chips
```

No need to restart - changes apply on next run.

---

## Changing the Schedule

Edit `.env` and change `SCHEDULE`:

```
SCHEDULE=0 9 * * *    # 9 AM daily (default)
SCHEDULE=0 8 * * *    # 8 AM daily
SCHEDULE=0 20 * * *   # 8 PM daily
SCHEDULE=0 9 * * 3    # 9 AM every Wednesday
```

Cron format: `minute hour day month weekday`

---

## Troubleshooting

**Not receiving emails?**
- Check your `.env` file has correct email credentials
- Run `npm start -- --once` and check for errors
- Check spam folder

**Can't start?**
- Make sure you're in the right directory: `cd /Users/davisjr01/publix-bogo-monitor`
- Check if it's already running: `ps aux | grep publix`

**App stopped working after restart?**
- Run `./start.sh` again
- Or set up LaunchAgent (Option 4) to auto-start
