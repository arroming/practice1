import { useState, useEffect, useCallback } from 'react'
import type { Todo, Priority, FilterType } from '../types/todo'
import { loadTodos, saveTodos } from '../utils/storage'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos())
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const addTodo = useCallback((text: string, priority: Priority, dueDate: string | null) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos(prev => [
      {
        id: generateId(),
        text: trimmed,
        completed: false,
        priority,
        dueDate,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }, [])

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }, [])

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }, [])

  const editTodo = useCallback((id: string, text: string, priority: Priority, dueDate: string | null) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: trimmed, priority, dueDate } : todo
      )
    )
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.completed))
  }, [])

  const toggleAll = useCallback(() => {
    const allCompleted = todos.every(todo => todo.completed)
    setTodos(prev => prev.map(todo => ({ ...todo, completed: !allCompleted })))
  }, [todos])

  const filteredTodos = todos.filter(todo => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed)

    const matchesSearch =
      search.trim() === '' ||
      todo.text.toLowerCase().includes(search.trim().toLowerCase())

    return matchesFilter && matchesSearch
  })

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  }

  return {
    todos,
    filteredTodos,
    filter,
    setFilter,
    search,
    setSearch,
    stats,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    toggleAll,
  }
}
