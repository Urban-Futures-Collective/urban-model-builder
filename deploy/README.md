# Deploying the Urban Model Builder

This folder holds everything to run the Urban Model Builder as one Docker Compose stack, e.g. on
[Dokploy](https://dokploy.com). Keycloak is not part of the stack: the tool uses an existing
Keycloak for login. A matching login theme is in `keycloak-theme/`.

```
deploy/
  docker-compose.yml        the stack: postgres, redis, migrate, backend, frontend
  .env.example              all settings
  frontend/                 image for the client: Ember build served by nginx
  keycloak-theme/           "umb" login theme (folder + provider JAR)
```

## What runs

| Service | Image | Role |
| --- | --- | --- |
| `postgres` | postgres:16.3 | Database (volume `postgres-data`) |
| `redis` | redis:7.4-alpine | Job queue for OGC API Processes runs (volume `redis-data`) |
| `migrate` | `Dockerfile.migrate` | Applies database migrations on every deploy, then exits |
| `backend` | `Dockerfile` | Feathers API (port 3030, internal only) |
| `frontend` | `deploy/frontend/Dockerfile` | The client, served by nginx on port 80 |

Only `frontend` needs a domain. Its nginx serves the app and forwards to the backend:

- `/socket.io/` – the real-time API the client uses
- `/ogcapi/…` – OGC API Processes for the Urban Model Platform
- `/admin/…` – admin endpoints (approving models for the Urban Model Platform)

So the whole tool runs under one address, e.g. `https://modelbuilder.example.org`, and the
Urban Model Platform reaches the processes at `https://modelbuilder.example.org/ogcapi/processes`.

The client image is built once; the public URL and the Keycloak settings are written into it when
the container starts, so changing them only needs a restart, not a rebuild.

## 1. Prepare Keycloak

In your Keycloak (any recent version; the theme was tested with 26.0). For the UFC setup that is
`https://auth.urbanfuturescollective.org` (`UMB_KEYCLOAK_URL`, without `/realms/...`):

1. **Realm**: use an existing realm or create one, e.g. `urban-model-builder`, and set its name
   as `UMB_KEYCLOAK_REALM`. Check: `https://auth.urbanfuturescollective.org/realms/<realm>/.well-known/openid-configuration`
   must answer, and its `issuer` must equal `UMB_KEYCLOAK_URL/realms/UMB_KEYCLOAK_REALM` exactly
   (the backend compares it). If Keycloak runs with a relative path such as `/auth`, include it in
   `UMB_KEYCLOAK_URL`.
2. **Client** (Clients → Create client):
   - Client ID: `urban-model-builder` (or set `UMB_KEYCLOAK_CLIENT_ID`)
   - Client authentication: **off** (public client), Standard flow: **on**
   - Valid redirect URIs: `https://modelbuilder.example.org/*`
   - Valid post logout redirect URIs: `https://modelbuilder.example.org/*`
   - Web origins: `https://modelbuilder.example.org`
   - Advanced → Proof Key for Code Exchange: **S256**
   - Client scopes → `urban-model-builder-dedicated` → Add mapper → By configuration →
     **Audience**: name `audience`, Included Client Audience `urban-model-builder`,
     Add to access token **on**. The backend only accepts tokens with this audience
     (`UMB_KEYCLOAK_AUDIENCE`).
3. **Registration** (optional): Realm settings → Login → User registration **on**. The app's
   "Register" button opens Keycloak's registration page.
4. **Login theme**: see below, then Realm settings → Themes → Login theme: **umb**.
   Realm settings → Localization: enable English and German to show the language switch.

Without the audience mapper you can set `UMB_KEYCLOAK_AUDIENCE=account`: Keycloak puts `account`
into tokens of users who have the realm's default roles. Users without those roles (e.g. imported
ones) then cannot log in, so the mapper is the more reliable choice.

## 2. Install the login theme

The theme is CSS on top of Keycloak's default login theme (`keycloak.v2`), so it does not replace
any templates.

- **Provider JAR (recommended):** copy `keycloak-theme/umb-keycloak-theme.jar` to
  `/opt/keycloak/providers/` of your Keycloak and restart it. With an optimized image (`kc.sh
  start --optimized`), run `kc.sh build` first. Rebuild the JAR after changing the theme:
  `keycloak-theme/build-jar.sh`.
- **Folder:** mount or copy `keycloak-theme/umb` to `/opt/keycloak/themes/umb`.

In Docker Compose / Dokploy, mounting the JAR into your Keycloak service looks like this:

```yaml
    volumes:
      - ./umb-keycloak-theme.jar:/opt/keycloak/providers/umb-keycloak-theme.jar:ro
```

## 3. Create the stack in Dokploy

1. **Create → Compose**, source: this Git repository and branch.
2. **Compose path:** `./deploy/docker-compose.yml`.
3. **Environment:** paste `deploy/.env.example` and fill in the values. At least:
   `UMB_PUBLIC_URL`, `UMB_KEYCLOAK_URL`, `UMB_KEYCLOAK_REALM`, `UMB_KEYCLOAK_AUDIENCE`,
   `POSTGRES_PASSWORD`, `FEATHERS_SECRET`. The stack refuses to start while one of them is missing.
4. **Domains:** add your domain for service **frontend**, container port **80**, HTTPS on.
   Dokploy then routes the domain to the container; no ports need to be published.
5. **Deploy.** The first build takes several minutes (client build). Order on start:
   postgres and redis → migrate (runs and exits) → backend → frontend.

Check: `https://modelbuilder.example.org/healthz` answers `ok`, the landing page loads, and
"Log in" opens your Keycloak with the Urban Model Builder theme.

## Running without Dokploy

```sh
cd deploy
cp .env.example .env        # fill in the values
# publish the frontend: uncomment `ports: ["8080:80"]` in docker-compose.yml
docker compose up -d --build
```

Put a reverse proxy with HTTPS in front of port 8080 for production.

## Further settings

- **Admin token** (`ADMIN_TOKEN_HASH`): bcrypt hash used by the `admin/*` endpoints. Create it
  from the repository root with `npm run hash-password <token>` and keep the single quotes in
  the env file, since the hash contains `$`.
- **Separate API domain** (`UMB_API_URL`): leave empty to run everything on the public URL. If
  you give the backend its own domain in Dokploy (service `backend`, port 3030), set it here.
- **Other backend settings**: the backend reads its configuration with node-config. Settings
  without a dedicated variable can be set as JSON in `NODE_CONFIG` on the `backend` service, e.g.
  `{"origins":["https://modelbuilder.example.org"]}`. The compose file already sets `origins`
  from `UMB_PUBLIC_URL` and the token audience from `UMB_KEYCLOAK_AUDIENCE`; if you override
  `NODE_CONFIG`, keep both.

## Backups and updates

- Data lives in the named volumes `postgres-data` (everything) and `redis-data` (job queue).
  Back up the database with
  `docker compose exec postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup.sql`.
- Updating: redeploy in Dokploy (or `docker compose up -d --build`). Migrations run
  automatically before the backend starts.
