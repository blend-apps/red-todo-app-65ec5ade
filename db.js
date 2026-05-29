import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const DB_PATH = process.env.DB_PATH ?? './data/todos.db'

// Ensure the data directory exists
const dir = dirname(DB_PATH)
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

const db = new Database(DB_PATH)

// WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    text      TEXT    NOT NULL,
    done      INTEGER NOT NULL DEFAULT 0,
    created_at TEXT   NOT NULL DEFAULT (datetime('now'))
  );
`)

export function getAllTodos() {
  return db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all()
}

export function createTodo(text) {
  const stmt = db.prepare('INSERT INTO todos (text) VALUES (?)')
  const info = stmt.run(text.trim())
  return db.prepare('SELECT * FROM todos WHERE id = ?').get(info.lastInsertRowid)
}

export function toggleTodo(id) {
  db.prepare('UPDATE todos SET done = NOT done WHERE id = ?').run(id)
  return db.prepare('SELECT * FROM todos WHERE id = ?').get(id)
}

export function deleteTodo(id) {
  db.prepare('DELETE FROM todos WHERE id = ?').run(id)
}
