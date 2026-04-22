import type { Todo, Priority } from '../types/todo'
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  categories: string[]
  search: string
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string, priority: Priority, startDate: string | null, endDate: string | null, category: string | null) => void
  onAddLog: (todoId: string, date: string, content: string) => void
  onDeleteLog: (todoId: string, logId: string) => void
}

export default function TodoList({ todos, categories, search, onToggle, onDelete, onEdit, onAddLog, onDeleteLog }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4 select-none">{search ? '🔍' : '✨'}</div>
        <p className="text-gray-500 font-medium">
          {search ? `"${search}"에 해당하는 항목이 없어요` : '할 일이 없습니다'}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {search ? '다른 검색어를 시도해 보세요' : '위에서 새로운 할 일을 추가해 보세요 :)'}
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          categories={categories}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onAddLog={onAddLog}
          onDeleteLog={onDeleteLog}
        />
      ))}
    </ul>
  )
}
