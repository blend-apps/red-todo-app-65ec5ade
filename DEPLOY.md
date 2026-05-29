# Deploying Red Todo App

## Local (no Docker)

```bash
npm install
PORT=3000 npm start
```

Data is stored in `./data/todos.db` (created automatically).

---

## Docker (self-hosted)

Build and run:

```bash
docker build -t red-todo-app .

# Create a local data directory and mount it as a volume for persistence
mkdir -p ./data
docker run -d \
  --name red-todo \
  -p 3000:3000 \
  -v "$(pwd)/data:/app/data" \
  --restart unless-stopped \
  red-todo-app
```

The app will be available at `http://localhost:3000`.

To update:
```bash
docker build -t red-todo-app .
docker stop red-todo && docker rm red-todo
docker run -d ... (same command as above)
```

---

## Fly.io

Install `flyctl` (https://fly.io/docs/hands-on/install-flyctl/), then:

```bash
fly launch --name red-todo-app --region iad --no-deploy
fly volumes create todo_data --size 1 --region iad
```

Add to `fly.toml`:
```toml
[mounts]
  source      = "todo_data"
  destination = "/app/data"

[[services]]
  internal_port = 3000
  protocol      = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port     = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port     = 443

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20

  [[services.http_checks]]
    interval  = 10000
    timeout   = 2000
    grace_period = "5s"
    method    = "GET"
    path      = "/health"
```

Set environment variables (if overriding defaults):
```bash
fly secrets set DB_PATH=/app/data/todos.db
```

Deploy:
```bash
fly deploy
```

---

## Render / Railway / Fly (one-click variants)

These platforms auto-detect `Dockerfile` and will build + deploy it. Set:
- `PORT` to whatever the platform provides (or leave at 3000 if the platform sets it for you)
- Mount a persistent volume at `/app/data` to preserve the SQLite file

---

## Production checklist

- [ ] Mount a persistent volume at `/app/data` (otherwise data is lost on restart)
- [ ] Set `NODE_ENV=production` (already set in `Dockerfile`)
- [ ] Put the app behind a reverse proxy (nginx, Caddy, Fly, Render, etc.) for TLS
- [ ] Optionally: replace SQLite with a managed Postgres by updating `db.js`
      (the query API is almost identical using `pg` + `node-postgres`)

---

## Blend-managed deploy

If this app was customized on Blend, the deploy happens automatically when you
click **Accept** in the customization session. Blend:

1. Snapshots the working tree from the dev environment
2. Commits the changes to your fork
3. Builds a new Docker image from the commit
4. Deploys to your Fly.io app (or other configured target)

No manual steps required.

---

## Switching from SQLite to Postgres

Install:
```bash
npm install pg
```

Replace `db.js` with a `pg`-based implementation. The query logic is nearly
identical:

```js
import pg from 'pg'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

export async function getAllTodos() {
  const { rows } = await pool.query('SELECT * FROM todos ORDER BY created_at DESC')
  return rows
}
// ... etc
```

Set `DATABASE_URL` in your deployment environment.
