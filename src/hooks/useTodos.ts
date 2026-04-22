import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Todo, TodoLog, Priority, FilterType } from '../types/todo'
import { loadTodos, saveTodos } from '../utils/storage'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos())
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const addTodo = useCallback((
    text: string,
    priority: Priority,
    startDate: string | null,
    endDate: string | null,
    category: string | null,
  ) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos(prev => [{
      id: generateId(),
      text: trimmed,
      completed: false,
      priority,
      startDate,
      endDate,
      category: category?.trim() || null,
      logs: [],
      createdAt: new Date().toISOString(),
    }, ...prev])
  }, [])

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }, [])

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  const editTodo = useCallback((
    id: string,
    text: string,
    priority: Priority,
    startDate: string | null,
    endDate: string | null,
    category: string | null,
  ) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, text: trimmed, priority, startDate, endDate, category: category?.trim() || null } : t
    ))
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(t => !t.completed))
  }, [])

  const toggleAll = useCallback(() => {
    setTodos(prev => {
      const allDone = prev.every(t => t.completed)
      return prev.map(t => ({ ...t, completed: !allDone }))
    })
  }, [])

  const addLog = useCallback((todoId: string, date: string, content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return
    const log: TodoLog = {
      id: generateId(),
      date,
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    setTodos(prev => prev.map(t =>
      t.id === todoId ? { ...t, logs: [log, ...t.logs] } : t
    ))
  }, [])

  const deleteLog = useCallback((todoId: string, logId: string) => {
    setTodos(prev => prev.map(t =>
      t.id === todoId ? { ...t, logs: t.logs.filter(l => l.id !== logId) } : t
    ))
  }, [])

  const categories = useMemo(() =>
    Array.from(new Set(todos.map(t => t.category).filter(Boolean) as string[])).sort(),
    [todos]
  )

  const filteredTodos = useMemo(() => todos.filter(todo => {
    const matchesStatus =
      filter === 'all' ||
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed)

    const matchesSearch =
      !search.trim() ||
      todo.text.toLowerCase().includes(search.trim().toLowerCase())

    const matchesCategory =
      !categoryFilter ||
      todo.category === categoryFilter

    return matchesStatus && matchesSearch && matchesCategory
  }), [todos, filter, search, categoryFilter])

  const stats = useMemo(() => ({
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  }), [todos])

  return {
    todos,
    filteredTodos,
    filter, setFilter,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    categories,
    stats,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    toggleAll,
    addLog,
    deleteLog,
  }
}
