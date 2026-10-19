#!/bin/sh
# Fills the deployment-specific values into the built client at container
# start. The Ember build stores its config URL-encoded in a <meta> tag of
# index.html; the placeholders below are replaced there.
set -eu

HTML_ROOT=/usr/share/nginx/html

fail() {
  echo "umb-runtime-config: $1" >&2
  exit 1
}

[ -n "${UMB_PUBLIC_URL:-}" ] || fail "UMB_PUBLIC_URL is required (e.g. https://umb.example.org)"
[ -n "${UMB_KEYCLOAK_URL:-}" ] || fail "UMB_KEYCLOAK_URL is required (e.g. https://auth.example.org)"
[ -n "${UMB_KEYCLOAK_REALM:-}" ] || fail "UMB_KEYCLOAK_REALM is required"

strip_slash() { printf '%s' "$1" | sed 's:/*$::'; }

PUBLIC_URL=$(strip_slash "$UMB_PUBLIC_URL")
API_URL=$(strip_slash "${UMB_API_URL:-$PUBLIC_URL}")
KEYCLOAK_URL=$(strip_slash "$UMB_KEYCLOAK_URL")
OIDC_HOST="$KEYCLOAK_URL/realms/$UMB_KEYCLOAK_REALM/protocol/openid-connect"
CLIENT_ID="${UMB_KEYCLOAK_CLIENT_ID:-urban-model-builder}"

# Values end up inside a URL-encoded JSON string: encode the characters that
# would break either layer. '%' first, so later encodings are not doubled.
encode() {
  printf '%s' "$1" | sed -e 's/%/%25/g' -e 's/\\/%5C%5C/g' -e 's/"/%5C%22/g' \
    -e 's/&/%26/g' -e 's/ /%20/g' -e 's/[|]/%7C/g'
}

for file in "$HTML_ROOT"/index.html "$HTML_ROOT"/tests/index.html; do
  [ -f "$file" ] || continue
  sed -i \
    -e "s|__UMB_PUBLIC_URL__|$(encode "$PUBLIC_URL")|g" \
    -e "s|__UMB_API_URL__|$(encode "$API_URL")|g" \
    -e "s|__UMB_OIDC_HOST__|$(encode "$OIDC_HOST")|g" \
    -e "s|__UMB_OIDC_CLIENT_ID__|$(encode "$CLIENT_ID")|g" \
    "$file"
done

if grep -q "__UMB_" "$HTML_ROOT/index.html"; then
  fail "placeholders left in index.html"
fi

echo "umb-runtime-config: public $PUBLIC_URL, api $API_URL, oidc $OIDC_HOST, client $CLIENT_ID"
