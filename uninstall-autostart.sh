#!/bin/bash
echo "Uninstalling Publix BOGO Monitor auto-start..."

# Unload the LaunchAgent
launchctl unload ~/Library/LaunchAgents/com.publix.bogo.plist 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Auto-start disabled"
    echo "The app will no longer start automatically on boot."
    echo ""
    echo "To run manually: npm start -- --once"
    echo "To reinstall auto-start: ./install-autostart.sh"
else
    echo "⚠️  LaunchAgent was not loaded (app may not have been running)"
    echo "Auto-start is now disabled anyway."
fi
