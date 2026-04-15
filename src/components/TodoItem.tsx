import { useState, useRef, useEffect } from 'react'
import type { Todo, Priority } from '../types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string, priority: Priority, dueDate: string | null) => void
}

const priorityDot: Record<Priority, string> = {
  low:    'bg-green-400',
  medium: 'bg-yellow-400',
  high:   'bg-red-400',
}

const priorityLabel: Record<Priority, string> = {
  low:    '낮음',
  medium: '보통',
  high:   '높음',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return `${Math.abs(diff)}일 초과`
  if (diff === 0) return '오늘 마감'
  if (diff === 1) return '내일 마감'
  return `${diff}일 남음`
}

function isOverdue(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority)
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? '')
  const [removing, setRemoving] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }
  }, [isEditing])

  const handleDelete = () => {
    setRemoving(true)
    setTimeout(() => onDelete(todo.id), 180)
  }

  const handleEditStart = () => {
    setEditText(todo.text)
    setEditPriority(todo.priority)
    setEditDueDate(todo.dueDate ?? '')
    setIsEditing(true)
  }

  const handleEditSave = () => {
    if (!editText.trim()) return
    onEdit(todo.id, editText, editPriority, editDueDate || null)
    setIsEditing(false)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSave()
    if (e.key === 'Escape') setIsEditing(false)
  }

  const overdue = todo.dueDate && !todo.completed && isOverdue(todo.dueDate)

  return (
    <li
      className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200
        ${removing ? 'animate-fade-out' : 'animate-slide-in'}
        ${todo.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-sm'}
      `}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${todo.completed
            ? 'bg-indigo-500 border-indigo-500 text-white'
            : 'border-gray-300 hover:border-indigo-400'
          }`}
        aria-label={todo.completed ? '완료 취소' : '완료 표시'}
      >
        {todo.completed && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <input
              ref={editInputRef}
              type="text"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="w-full text-sm text-gray-800 border border-indigo-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <div className="flex flex-wrap items-center gap-2">
              {/* Edit priority */}
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setEditPriority(p)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      editPriority === p
                        ? p === 'high' ? 'bg-red-100 text-red-600'
                          : p === 'medium' ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {priorityLabel[p]}
                  </button>
                ))}
              </div>
              {/* Edit due date */}
              <input
                type="date"
                value={editDueDate}
                onChange={e => setEditDueDate(e.target.value)}
                className="text-xs border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-indigo-300"
              />
              <div className="flex gap-1 ml-auto">
                <button onClick={handleEditSave} className="px-2.5 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors">저장</button>
                <button onClick={() => setIsEditing(false)} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors">취소</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p
              onDoubleClick={handleEditStart}
              className={`text-sm leading-relaxed break-words cursor-default select-none ${
                todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
              }`}
            >
              {todo.text}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {/* Priority badge */}
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[todo.priority]}`} />
                <span className="text-xs text-gray-400">{priorityLabel[todo.priority]}</span>
              </span>
              {/* Due date */}
              {todo.dueDate && (
                <span className={`text-xs font-medium ${
                  todo.completed ? 'text-gray-400'
                  : overdue ? 'text-red-500'
                  : 'text-indigo-500'
                }`}>
                  {todo.completed ? todo.dueDate.slice(5).replace('-', '/') : formatDate(todo.dueDate)}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={handleEditStart}
            className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            title="편집"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="삭제"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </li>
  )
}
