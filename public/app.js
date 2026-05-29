/* Todo App — frontend */

const addForm    = document.getElementById('addForm')
const todoInput  = document.getElementById('todoInput')
const todoList   = document.getElementById('todoList')
const emptyState = document.getElementById('emptyState')
const stats      = document.getElementById('stats')
const statTotal  = document.getElementById('statTotal')
const statDone   = document.getElementById('statDone')

let todos = []

// ── API helpers ───────────────────────────────────────────────────────────────

async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ── Render ────────────────────────────────────────────────────────────────────

function formatDate(iso) {
  const d = new Date(iso + 'Z')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function render() {
  todoList.innerHTML = ''

  const done  = todos.filter(t => t.done).length
  const total = todos.length

  if (total === 0) {
    emptyState.hidden = false
    stats.hidden      = true
    return
  }

  emptyState.hidden = false  // keep space consistent
  emptyState.hidden = true
  stats.hidden      = false
  statTotal.textContent = `${total} todo${total !== 1 ? 's' : ''}`
  statDone.textContent  = `${done} done ✓`

  todos.forEach(todo => {
    const li = document.createElement('li')
    li.className = `todo-item${todo.done ? ' done' : ''}`
    li.dataset.id = todo.id

    const cb = document.createElement('input')
    cb.type = 'checkbox'
    cb.className = 'todo-checkbox'
    cb.checked = !!todo.done
    cb.addEventListener('change', () => handleToggle(todo.id))

    const span = document.createElement('span')
    span.className = 'todo-text'
    span.textContent = todo.text

    const date = document.createElement('span')
    date.className = 'todo-date'
    date.textContent = formatDate(todo.created_at)

    const del = document.createElement('button')
    del.className = 'todo-delete'
    del.title = 'Delete'
    del.textContent = '✕'
    del.addEventListener('click', () => handleDelete(todo.id))

    li.append(cb, span, date, del)
    todoList.appendChild(li)
  })
}

// ── Event handlers ────────────────────────────────────────────────────────────

addForm.addEventListener('submit', async e => {
  e.preventDefault()
  const text = todoInput.value.trim()
  if (!text) return
  todoInput.disabled = true
  try {
    const todo = await api('POST', '/api/todos', { text })
    todos.unshift(todo)
    render()
    todoInput.value = ''
  } catch (err) {
    alert('Could not add todo: ' + err.message)
  } finally {
    todoInput.disabled = false
    todoInput.focus()
  }
})

async function handleToggle(id) {
  try {
    const updated = await api('PATCH', `/api/todos/${id}/toggle`)
    todos = todos.map(t => t.id === id ? updated : t)
    render()
  } catch (err) {
    alert('Could not update todo: ' + err.message)
  }
}

async function handleDelete(id) {
  try {
    await api('DELETE', `/api/todos/${id}`)
    todos = todos.filter(t => t.id !== id)
    render()
  } catch (err) {
    alert('Could not delete todo: ' + err.message)
  }
}

// ── Initial load ──────────────────────────────────────────────────────────────

;(async () => {
  try {
    todos = await api('GET', '/api/todos')
    render()
  } catch (err) {
    emptyState.textContent = '⚠️ Could not load todos. Is the server running?'
  }
})()
