export type Priority = 'low' | 'medium' | 'high'
export type FilterType = 'all' | 'active' | 'completed'
export type ViewType = 'list' | 'calendar'

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
  startDate: string | null   // YYYY-MM-DD
  endDate: string | null     // YYYY-MM-DD
  category: string | null
  logs: TodoLog[]
  createdAt: string
}
