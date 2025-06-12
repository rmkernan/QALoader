#!/bin/bash

# Process Claude Code session recording for documentation
# Usage: ./process_recording.sh "recording_file.txt"

RECORDING_FILE="$1"
OUTPUT_FILE="${RECORDING_FILE%.txt}_processed.md"

if [ ! -f "$RECORDING_FILE" ]; then
    echo "❌ Recording file not found: $RECORDING_FILE"
    exit 1
fi

echo "📝 Processing recording: $RECORDING_FILE"

cat > "$OUTPUT_FILE" << EOF
# Claude Code Session Recording

**File:** $RECORDING_FILE  
**Processed:** $(date)  
**Project:** Q&A Loader  

---

## Raw Session Log

\`\`\`
$(cat "$RECORDING_FILE")
\`\`\`

---

## Key Commands Summary

\`\`\`bash
$(grep "^.*\$" "$RECORDING_FILE" | grep -v "^Script" | head -20)
\`\`\`

## File Operations

\`\`\`
$(grep -E "(Read|Write|Edit|Bash)" "$RECORDING_FILE" | head -10)
\`\`\`

---
*Processed from Claude Code session recording*
EOF

echo "✅ Processed recording saved to: $OUTPUT_FILE"
echo "📤 Ready to upload to Google Docs/Word"