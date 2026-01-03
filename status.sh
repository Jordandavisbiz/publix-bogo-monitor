#!/bin/bash
echo "=== Publix BOGO Monitor Status ==="
echo ""

# Check if LaunchAgent is loaded
if launchctl list | grep -q "com.publix.bogo"; then
    echo "✅ Status: RUNNING (auto-start enabled)"
    echo ""

    # Show process info
    echo "Process info:"
    ps aux | grep "[p]ublix-bogo-monitor" | head -1
    echo ""

    # Show recent logs
    echo "Recent activity (last 10 lines):"
    tail -10 /Users/davisjr01/publix-bogo-monitor/app.log 2>/dev/null || echo "  (no logs yet)"
else
    echo "❌ Status: NOT RUNNING"
    echo ""
    echo "To start auto-start: ./install-autostart.sh"
    echo "To run once: npm start -- --once"
fi

echo ""
echo "Configuration:"
echo "  Schedule: $(grep SCHEDULE .env | cut -d= -f2) (from .env)"
echo "  Favorites: $(grep FAVORITE_PRODUCTS .env | cut -d= -f2)"
echo "  Email to: $(grep EMAIL_TO .env | cut -d= -f2)"
