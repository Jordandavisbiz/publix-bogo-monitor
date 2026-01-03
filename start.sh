#!/bin/bash
cd /Users/davisjr01/publix-bogo-monitor
nohup npm start > app.log 2>&1 &
echo "Publix BOGO Monitor started in background!"
echo "Process ID: $!"
echo "Check app.log for output"
echo "To stop: kill $!"
