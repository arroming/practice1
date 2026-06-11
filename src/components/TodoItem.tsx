import { useState, useRef, useEffect } from 'react'
import type { Todo, Priority } from '../types/todo'
import TodoLogs from './TodoLogs'
import StarRating from './StarRating'

interface TodoItemProps {
  todo: Todo
  categories: string[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (
    id: string, text: string, priority: Priority, importance: number,
    startDate: string | null, startTime: string | null,
    endDate: string | null, endTime: string | null,
    category: string | null,
  ) => void
  onAddLog: (todoId: string, date: string, content: string) => void
  onDeleteLog: (todoId: string, logId: string) => void
}

const priorityDot: Record<Priority, string> = {
  low: 'bg-green-400', medium: 'bg-yellow-400', high: 'bg-red-400',
}
const priorityLabel: Record<Priority, string> = {
  low: '낮음', medium: '보통', high: '높음',
}

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

function toDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDateRange(
  startDate: string | null, startTime: string | null,
  endDate: string | null, endTime: string | null,
): string {
  const fmt = (d: string, t: string | null) => {
    const dm = d.slice(5).replace('-', '/')
    return t ? `${dm} ${t}` : dm
  }
  if (startDate && endDate) {
    if (startDate === endDate) {
      if (startTime && endTime && startTime !== endTime) return `${fmt(startDate, startTime)} ~ ${fmt(endDate, endTime)}`
      return fmt(startDate, startTime)
    }
    return `${fmt(startDate, startTime)} ~ ${fmt(endDate, endTime)}`
  }
  if (startDate) return `${fmt(startDate, startTime)} ~`
  if (endDate)   return `~ ${fmt(endDate, endTime)}`
  return ''
}

function getDueDateStatus(startDate: string | null, endDate: string | null) {
  const ref = endDate || startDate
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

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [h, m] = value.split(':')
  return (
    <div className="flex items-center gap-1">
      <select value={h} onChange={e => onChange(`${e.target.value}:${m}`)}
        className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white outline-none focus:ring-1 focus:ring-indigo-300">
        {HOURS.map(hh => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span className="text-gray-400 text-xs font-bold">:</span>
      <select value={m} onChange={e => onChange(`${h}:${e.target.value}`)}
        className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white outline-none focus:ring-1 focus:ring-indigo-300">
        {MINUTES.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
    </div>
  )
}

export default function TodoItem({ todo, categories, onToggle, onDelete, onEdit, onAddLog, onDeleteLog }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority)
  const [editImportance, setEditImportance] = useState(todo.importance)
  const [editStartDate, setEditStartDate] = useState(todo.startDate ?? '')
  const [editStartTime, setEditStartTime] = useState(todo.startTime ?? '09:00')
  const [includeStartTime, setIncludeStartTime] = useState(!!todo.startTime)
  const [editEndDate, setEditEndDate] = useState(todo.endDate ?? '')
  const [editEndTime, setEditEndTime] = useState(todo.endTime ?? '18:00')
  const [includeEndTime, setIncludeEndTime] = useState(!!todo.endTime)
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
    setEditImportance(todo.importance)
    setEditStartDate(todo.startDate ?? '')
    setEditStartTime(todo.startTime ?? '09:00')
    setIncludeStartTime(!!todo.startTime)
    setEditEndDate(todo.endDate ?? '')
    setEditEndTime(todo.endTime ?? '18:00')
    setIncludeEndTime(!!todo.endTime)
    setEditCategory(todo.category ?? '')
    setNewCategory('')
    setIsEditing(true)
  }

  const saveEdit = () => {
    if (!editText.trim()) return
    const cat = newCategory.trim() || editCategory || null
    onEdit(
      todo.id, editText, editPriority, editImportance,
      editStartDate || null, includeStartTime ? editStartTime : null,
      editEndDate || null, includeEndTime ? editEndTime : null,
      cat,
    )
    setIsEditing(false)
  }

  const handleEditKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') setIsEditing(false)
  }

  const handleEditStartChange = (val: string) => {
    setEditStartDate(val)
    if (editEndDate && val > editEndDate) setEditEndDate(val)
  }

  const dateRange = formatDateRange(todo.startDate, todo.startTime, todo.endDate, todo.endTime)
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
              {/* Priority + Importance */}
              <div className="flex flex-wrap items-center gap-3">
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
                <StarRating value={editImportance} onChange={setEditImportance} size="sm" />
              </div>
              {/* Date range */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 w-6">시작</span>
                  <input type="date" value={editStartDate} onChange={e => handleEditStartChange(e.target.value)}
                    className="text-xs border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-indigo-300" />
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={includeStartTime} onChange={e => setIncludeStartTime(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-500" />
                    <span className="text-xs text-gray-500">시간</span>
                  </label>
                  {includeStartTime && <TimeSelect value={editStartTime} onChange={setEditStartTime} />}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 w-6">종료</span>
                  <input type="date" value={editEndDate} min={editStartDate || undefined}
                    onChange={e => setEditEndDate(e.target.value)}
                    className="text-xs border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-indigo-300" />
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={includeEndTime} onChange={e => setIncludeEndTime(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-500" />
                    <span className="text-xs text-gray-500">시간</span>
                  </label>
                  {includeEndTime && <TimeSelect value={editEndTime} onChange={setEditEndTime} />}
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
                <input type="text" value={newCategory}
                  onChange={e => { setNewCategory(e.target.value); setEditCategory('') }}
                  placeholder="새 카테고리"
                  className="text-xs border border-gray-200 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-indigo-300 w-24" />
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
                {todo.importance > 0 && (
                  <StarRating value={todo.importance} readonly size="sm" />
                )}
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
            <TodoLogs todoId={todo.id} logs={todo.logs} onAdd={onAddLog} onDelete={onDeleteLog} />
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
