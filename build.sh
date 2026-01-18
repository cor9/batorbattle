#!/bin/bash
# Build script for Netlify - injects API URL into config.js

API_URL=${API_URL:-"http://localhost:8181"}

# Replace placeholder in config.js with actual API URL
sed -i.bak "s|%%API_URL%%|$API_URL|g" config.js
sed -i.bak "s|%%SUPABASE_URL%%|$SUPABASE_URL|g" config.js
sed -i.bak "s|%%SUPABASE_KEY%%|$SUPABASE_KEY|g" config.js

echo "Build complete. API_URL set to: $API_URL"

