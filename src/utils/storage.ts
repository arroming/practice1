import type { Todo } from '../types/todo'

const STORAGE_KEY = 'todo-app-todos'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateTodo(raw: any): Todo {
  return {
    id: raw.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text: raw.text ?? '',
    completed: raw.completed ?? false,
    priority: raw.priority ?? 'medium',
    // migrate old single dueDate to both startDate and endDate
    startDate: raw.startDate ?? raw.dueDate ?? null,
    endDate: raw.endDate ?? raw.dueDate ?? null,
    category: raw.category ?? null,
    logs: Array.isArray(raw.logs) ? raw.logs : [],
    createdAt: raw.createdAt ?? new Date().toISOString(),
  }
}

export function loadTodos(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = JSON.parse(stored) as any[]
    return raw.map(migrateTodo)
  } catch {
    return []
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    // ignore storage errors
  }
}
