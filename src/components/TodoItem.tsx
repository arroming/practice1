import { useState, useRef, useEffect } from 'react'
import type { Todo, Priority } from '../types/todo'
import TodoLogs from './TodoLogs'

interface TodoItemProps {
  todo: Todo
  categories: string[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string, priority: Priority, startDate: string | null, endDate: string | null, category: string | null) => void
  onAddLog: (todoId: string, date: string, content: string) => void
  onDeleteLog: (todoId: string, logId: string) => void
}

const priorityDot: Record<Priority, string> = {
  low: 'bg-green-400', medium: 'bg-yellow-400', high: 'bg-red-400',
}
const priorityLabel: Record<Priority, string> = {
  low: '낮음', medium: '보통', high: '높음',
}

function toDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDateRange(start: string | null, end: string | null): string {
  const fmt = (s: string) => s.slice(5).replace('-', '/')
  if (start && end && start !== end) return `${fmt(start)} ~ ${fmt(end)}`
  if (start && end && start === end) return fmt(start)
  if (start) return `${fmt(start)} ~`
  if (end) return `~ ${fmt(end)}`
  return ''
}

function getDueDateStatus(start: string | null, end: string | null): 'overdue' | 'today' | 'soon' | 'normal' | null {
  const ref = end || start
  if (!ref) return null
  const today = toDateStr(new Date())
  if (ref < today) return 'overdue'
  if (ref === today) return 'today'
  const diff = (new Date(ref).getTime() - new Date(today).getTime()) / 86400000
  if (diff <= 3) return 'soon'
  return 'normal'
}

const CATEGORY_COLORS = [
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
  'bg-lime-100 text-lime-700',
  'bg-fuchsia-100 text-fuchsia-700',
]

export function getCategoryColor(cat: string, allCategories: string[]) {
  const idx = allCategories.indexOf(cat)
  return CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
}

export default function TodoItem({ todo, categories, onToggle, onDelete, onEdit, onAddLog, onDeleteLog }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority)
  const [editStart, setEditStart] = useState(todo.startDate ?? '')
  const [editEnd, setEditEnd] = useState(todo.endDate ?? '')
  const [editCategory, setEditCategory] = useState(todo.category ?? '')
  const [newCategory, setNewCategory] = useState('')
  const [removing, setRemoving] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) { editInputRef.current?.focus(); editInputRef.current?.select() }
  }, [isEditing])

  const handleDelete = () => {
    setRemoving(true)
    setTimeout(() => onDelete(todo.id), 180)
  }

  const startEdit = () => {
    setEditText(todo.text)
    setEditPriority(todo.priority)
    setEditStart(todo.startDate ?? '')
    setEditEnd(todo.endDate ?? '')
    setEditCategory(todo.category ?? '')
    setNewCategory('')
    setIsEditing(true)
  }

  const saveEdit = () => {
    if (!editText.trim()) return
    const cat = newCategory.trim() || editCategory || null
    onEdit(todo.id, editText, editPriority, editStart || null, editEnd || null, cat)
    setIsEditing(false)
  }

  const handleEditKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') setIsEditing(false)
  }

  const handleEditStartChange = (val: string) => {
    setEditStart(val)
    if (editEnd && val > editEnd) setEditEnd(val)
  }

  const dateRange = formatDateRange(todo.startDate, todo.endDate)
  const dateStatus = !todo.completed ? getDueDateStatus(todo.startDate, todo.endDate) : null
  const catColor = todo.category ? getCategoryColor(todo.category, categories) : ''

  const dateStatusClass =
    dateStatus === 'overdue' ? 'text-red-500 font-semibold' :
    dateStatus === 'today'   ? 'text-orange-500 font-semibold' :
    dateStatus === 'soon'    ? 'text-yellow-600' :
    'text-indigo-400'

  return (
    <li className={`group rounded-xl border transition-all duration-200
      ${removing ? 'animate-fade-out' : 'animate-slide-in'}
      ${todo.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-sm'}
    `}>
      <div className="flex items-start gap-3 p-3.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${todo.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 hover:border-indigo-400'}`}
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
                onKeyDown={handleEditKey}
                className="w-full text-sm text-gray-800 border border-indigo-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <div className="flex flex-wrap gap-2 items-center">
                {/* Priority */}
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as Priority[]).map(p => (
                    <button key={p} onClick={() => setEditPriority(p)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                        editPriority === p
                          ? p === 'high' ? 'bg-red-100 text-red-600' : p === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}>{priorityLabel[p]}</button>
                  ))}
                </div>
                {/* Date range */}
                <div className="flex items-center gap-1">
                  <input type="date" value={editStart} onChange={e => handleEditStartChange(e.target.value)}
                    className="text-xs border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-indigo-300" />
                  <span className="text-gray-400 text-xs">~</span>
                  <input type="date" value={editEnd} min={editStart}
                    onChange={e => setEditEnd(e.target.value)}
                    className="text-xs border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-indigo-300" />
                </div>
              </div>
              {/* Category edit */}
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-xs text-gray-500">카테고리:</span>
                {categories.map(cat => (
                  <button key={cat} onClick={() => { setEditCategory(cat === editCategory ? '' : cat); setNewCategory('') }}
                    className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
                      editCategory === cat ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                    }`}>{cat}</button>
                ))}
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => { setNewCategory(e.target.value); setEditCategory('') }}
                  placeholder="새 카테고리"
                  className="text-xs border border-gray-200 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-indigo-300 w-24"
                />
              </div>
              <div className="flex gap-1">
                <button onClick={saveEdit} className="px-2.5 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors">저장</button>
                <button onClick={() => setIsEditing(false)} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors">취소</button>
              </div>
            </div>
          ) : (
            <>
              <p
                onDoubleClick={startEdit}
                className={`text-sm leading-relaxed break-words cursor-default select-none ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
              >
                {todo.text}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[todo.priority]}`} />
                  <span className="text-xs text-gray-400">{priorityLabel[todo.priority]}</span>
                </span>
                {dateRange && (
                  <span className={`text-xs ${todo.completed ? 'text-gray-400' : dateStatusClass}`}>
                    {dateRange}
                    {dateStatus === 'overdue' && ' ⚠'}
                    {dateStatus === 'today' && ' · 오늘 마감'}
                  </span>
                )}
                {todo.category && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${catColor}`}>
                    {todo.category}
                  </span>
                )}
                {todo.logs.length > 0 && (
                  <span className="text-xs text-gray-400">{todo.logs.length}개 메모</span>
                )}
              </div>
            </>
          )}

          {/* Logs panel */}
          {showLogs && !isEditing && (
            <TodoLogs
              todoId={todo.id}
              logs={todo.logs}
              onAdd={onAddLog}
              onDelete={onDeleteLog}
            />
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => setShowLogs(v => !v)}
              className={`p-1.5 rounded-lg transition-colors ${showLogs ? 'text-indigo-500 bg-indigo-50' : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50'}`}
              title="메모/진행 내역"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={startEdit} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="편집">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L12 14H9v-3z" />
              </svg>
            </button>
            <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="삭제">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </li>
  )
}
