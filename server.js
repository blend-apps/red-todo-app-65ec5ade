import express from 'express'
import { getAllTodos, createTodo, toggleTodo, deleteTodo } from './db.js'

const app = express()
const PORT = parseInt(process.env.PORT ?? '3000', 10)

app.use(express.json())
app.use(express.static('public'))

// ── REST API ──────────────────────────────────────────────────────────────────

app.get('/api/todos', (req, res) => {
  res.json(getAllTodos())
})

app.post('/api/todos', (req, res) => {
  const { text } = req.body
  if (!text?.trim()) return res.status(400).json({ error: 'text is required' })
  res.status(201).json(createTodo(text))
})

app.patch('/api/todos/:id/toggle', (req, res) => {
  const todo = toggleTodo(parseInt(req.params.id, 10))
  if (!todo) return res.status(404).json({ error: 'not found' })
  res.json(todo)
})

app.delete('/api/todos/:id', (req, res) => {
  deleteTodo(parseInt(req.params.id, 10))
  res.status(204).end()
})

// ── Health check (required by Blend / Fly.io) ─────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`red-todo-app listening on http://0.0.0.0:${PORT}`)
})
