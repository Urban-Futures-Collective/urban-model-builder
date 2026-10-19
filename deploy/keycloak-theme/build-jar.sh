#!/bin/sh
# Packs the "umb" login theme as a Keycloak provider JAR:
#   deploy/keycloak-theme/umb-keycloak-theme.jar
# Copy the JAR to /opt/keycloak/providers/ of your Keycloak and restart it
# (for an optimized image, run `kc.sh build` after copying).
set -eu
cd "$(dirname "$0")"
OUT="$PWD/umb-keycloak-theme.jar"
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$WORK/META-INF" "$WORK/theme"
cp -R umb "$WORK/theme/umb"
cat > "$WORK/META-INF/keycloak-themes.json" <<'JSON'
{
  "themes": [
    { "name": "umb", "types": ["login"] }
  ]
}
JSON

rm -f "$OUT"
if command -v jar >/dev/null 2>&1; then
  (cd "$WORK" && jar --create --file "$OUT" META-INF theme)
else
  (cd "$WORK" && zip -qr "$OUT" META-INF theme)
fi
echo "Wrote $OUT"
