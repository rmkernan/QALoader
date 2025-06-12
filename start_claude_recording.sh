#!/bin/bash

# Claude Code Session Recorder
# Usage: ./start_claude_recording.sh "session_name"

SESSION_NAME="${1:-claude_session}"
TIMESTAMP=$(date +%Y%m%d_%H%M)
RECORDING_FILE="${SESSION_NAME}_${TIMESTAMP}.txt"

echo "🎬 Starting Claude Code session recording..."
echo "📝 Recording to: $RECORDING_FILE"
echo "🛑 Stop recording with: Ctrl+D or 'exit'"
echo "📊 View recording with: cat $RECORDING_FILE"
echo ""
echo "Session started at: $(date)"
echo "Project: Q&A Loader"
echo "Branch: $(git branch --show-current)"
echo ""

# Start the recording session
script -a "$RECORDING_FILE"

echo ""
echo "✅ Recording saved to: $RECORDING_FILE"
echo "📤 Upload to Google Docs or convert to Word document"