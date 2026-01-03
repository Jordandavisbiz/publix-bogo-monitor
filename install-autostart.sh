#!/bin/bash
echo "Installing Publix BOGO Monitor to start automatically on boot..."

# Load the LaunchAgent
launchctl load ~/Library/LaunchAgents/com.publix.bogo.plist

if [ $? -eq 0 ]; then
    echo "✅ Success! The app will now:"
    echo "  - Start automatically when you log in"
    echo "  - Restart automatically if it crashes"
    echo "  - Email you daily at 9 AM"
    echo ""
    echo "Logs are saved to:"
    echo "  - Output: /Users/davisjr01/publix-bogo-monitor/app.log"
    echo "  - Errors: /Users/davisjr01/publix-bogo-monitor/error.log"
    echo ""
    echo "To check status: ./status.sh"
    echo "To uninstall: ./uninstall-autostart.sh"
else
    echo "❌ Error loading LaunchAgent"
    echo "The app may already be installed."
    echo "Try running: ./uninstall-autostart.sh first"
fi
