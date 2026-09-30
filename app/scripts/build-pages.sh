#!/usr/bin/env bash
# Builds the web version for GitHub Pages: https://ommo787.github.io/Makmora/app/
# Pages serves the /docs folder of the default branch; the app lives in docs/app.
set -euo pipefail
cd "$(dirname "$0")/.."
cp app.json /tmp/makmoura-app.json
trap 'cp /tmp/makmoura-app.json app.json' EXIT
node -e "const f='app.json',j=require('./'+f);j.expo.experiments={...j.expo.experiments,baseUrl:'/Makmora/app'};require('fs').writeFileSync(f,JSON.stringify(j,null,2)+'\n')"
rm -rf ../docs/app
npx expo export -p web --output-dir ../docs/app
touch ../docs/.nojekyll                       # keep folders that start with "_" (like _expo)
cp ../docs/app/index.html ../docs/404.html   # links straight into a screen still open the app
printf '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=app/"><title>مكمورة</title><a href="app/">مكمورة</a>\n' > ../docs/index.html
echo "Built. After pushing: https://ommo787.github.io/Makmora/app/"
