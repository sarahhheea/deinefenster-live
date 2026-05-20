#!/usr/bin/env bash
# IndexNow Submission — Bing, Yandex, Seznam, Naver etc.
# Usage: ./scripts/indexnow-submit.sh  (submits all updated URLs from git diff)
#        ./scripts/indexnow-submit.sh url1 url2 ...  (manual)

set -euo pipefail

HOST="deinefenster.de"
KEY="e75797aa33edfee687342db1c65a83e2"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

# Collect URLs
URLS=()
if [ "$#" -gt 0 ]; then
    URLS=("$@")
else
    # Auto: alle in den letzten 3 commits geänderten .html-Files
    cd "$(dirname "$0")/.."
    while IFS= read -r f; do
        [[ "$f" == *.html ]] || continue
        [[ "$f" == _archive/* ]] && continue
        [[ "$f" == staedte/* ]] && continue  # zu viele, separat
        URLS+=("https://${HOST}/${f}")
    done < <(git diff --name-only HEAD~3 HEAD)
fi

if [ "${#URLS[@]}" -eq 0 ]; then
    echo "No URLs to submit."
    exit 0
fi

echo "Submitting ${#URLS[@]} URLs to IndexNow..."

# Build JSON payload
URL_LIST=$(printf '"%s",' "${URLS[@]}" | sed 's/,$//')
PAYLOAD=$(cat <<EOF
{
  "host": "${HOST}",
  "key": "${KEY}",
  "keyLocation": "${KEY_LOCATION}",
  "urlList": [${URL_LIST}]
}
EOF
)

# Submit to multiple search engines
for ENDPOINT in "https://api.indexnow.org/IndexNow" "https://www.bing.com/IndexNow" "https://yandex.com/indexnow"; do
    echo "→ ${ENDPOINT}"
    curl -s -X POST "${ENDPOINT}" \
        -H "Content-Type: application/json; charset=utf-8" \
        -d "${PAYLOAD}" \
        -w "HTTP %{http_code}\n" \
        -o /tmp/indexnow-resp.txt || true
done

echo "Done. (200/202 = OK)"
