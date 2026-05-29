# 📝 Red Todo App

> The world's most customizable (and least attractive) todo list — purpose-built
> for demonstrating [Blend](https://blend.dev) customization sessions.

![screenshot of a very orange todo app](https://placehold.co/800x400/ff6b35/fff?text=Yes+it+really+looks+like+this)

## What is this?

A deliberately garish TODO app that **begs to be customized**. Orange background,
Comic Sans font, the full experience. If you've ever wanted to customize an app
without touching Kubernetes, this is your sandbox.

One click on Blend → tell the AI "make this blue and use a nicer font" → done.

## Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Runtime    | Node.js 22                              |
| Framework  | Express 4                               |
| Database   | SQLite via `better-sqlite3`             |
| Frontend   | Vanilla HTML + CSS + JS (no build step) |
| Dev server | `node --watch` (built-in, zero config)  |

No TypeScript compilation, no bundler, no build step. Hot-reload works by just
saving a file.

## Quick start

```bash
npm install
npm run dev     # starts on http://localhost:3000
```

Or with Docker:

```bash
docker build -t red-todo-app .
docker run -p 3000:3000 -v $(pwd)/data:/app/data red-todo-app
```

## Customizing

Everything visual is controlled by CSS custom properties at the top of
`public/style.css`. Change the `:root` block — the comments tell you exactly
which variable does what.

The "CHANGE ME" banner is in `public/index.html` and can be removed once you've
made the app yours.

## Project layout

```
.
├── server.js          Express app + REST API
├── db.js              SQLite setup and queries
├── public/
│   ├── index.html     Page shell (includes the "CHANGE ME" banner)
│   ├── style.css      All styles + CSS variables (start here to retheme)
│   └── app.js         Frontend JS (vanilla, no framework)
├── Dockerfile         Production image (multi-stage, non-root user)
├── Dockerfile.dev     Blend dev environment image
├── ARCHITECTURE.md    How all the pieces fit together
└── DEPLOY.md          How to deploy to production
```

## Environment variables

| Variable  | Default                  | Description                        |
|-----------|--------------------------|------------------------------------|
| `PORT`    | `3000`                   | HTTP port the server listens on    |
| `DB_PATH` | `./data/todos.db`        | Path to the SQLite database file   |

## API

| Method   | Path                   | Description              |
|----------|------------------------|--------------------------|
| `GET`    | `/api/todos`           | List all todos           |
| `POST`   | `/api/todos`           | Create a todo `{text}`   |
| `PATCH`  | `/api/todos/:id/toggle`| Toggle done/not-done     |
| `DELETE` | `/api/todos/:id`       | Delete a todo            |
| `GET`    | `/health`              | Health check (always 200)|

## License

MIT
