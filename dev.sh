#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
cd /Users/ghost/Desktop/equipe_interne
exec /opt/homebrew/bin/node ./node_modules/.bin/next dev --port 3002 --webpack
