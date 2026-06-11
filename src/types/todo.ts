export type Priority = 'low' | 'medium' | 'high'
export type FilterType = 'all' | 'active' | 'completed'
export type ViewType = 'list' | 'calendar'
export type SortOption = 'default' | 'date-asc' | 'date-desc'

export interface TodoLog {
  id: string
  date: string      // YYYY-MM-DD
  content: string
  createdAt: string
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  priority: Priority
  importance: number        // 0 = unset, 1–5
  startDate: string | null  // YYYY-MM-DD
  startTime: string | null  // HH:MM
  endDate: string | null    // YYYY-MM-DD
  endTime: string | null    // HH:MM
  category: string | null
  logs: TodoLog[]
  createdAt: string
}
