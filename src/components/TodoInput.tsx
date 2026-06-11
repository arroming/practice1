import { useState, useRef } from 'react'
import type { Priority } from '../types/todo'
import StarRating from './StarRating'

interface TodoInputProps {
  categories: string[]
  onAdd: (
    text: string,
    priority: Priority,
    importance: number,
    startDate: string | null,
    startTime: string | null,
    endDate: string | null,
    endTime: string | null,
    category: string | null,
  ) => void
}

const priorityConfig: Record<Priority, { label: string; cls: string }> = {
  low:    { label: '낮음', cls: 'text-green-600 bg-green-50 border-green-200' },
  medium: { label: '보통', cls: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  high:   { label: '높음', cls: 'text-red-600 bg-red-50 border-red-200' },
}

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function nowTimeTo5Min(): string {
  const d = new Date()
  const h = d.getHours()
  const rawMin = d.getMinutes()
  const m = Math.round(rawMin / 5) * 5
  if (m >= 60) return `${String((h + 1) % 24).padStart(2, '0')}:00`
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [h, m] = value.split(':')
  return (
    <div className="flex items-center gap-1">
      <select
        value={h}
        onChange={e => onChange(`${e.target.value}:${m}`)}
        className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white outline-none focus:ring-1 focus:ring-indigo-300"
      >
        {HOURS.map(hh => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span className="text-gray-400 text-xs font-bold">:</span>
      <select
        value={m}
        onChange={e => onChange(`${h}:${e.target.value}`)}
        className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white outline-none focus:ring-1 focus:ring-indigo-300"
      >
        {MINUTES.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
    </div>
  )
}

export default function TodoInput({ categories, onAdd }: TodoInputProps) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [importance, setImportance] = useState(0)
  const [startDate, setStartDate] = useState(todayStr())
  const [endDate, setEndDate] = useState(todayStr())
  const [includeStartTime, setIncludeStartTime] = useState(false)
  const [includeEndTime, setIncludeEndTime] = useState(false)
  const [startTime, setStartTime] = useState(nowTimeTo5Min())
  const [endTime, setEndTime] = useState(nowTimeTo5Min())
  const [category, setCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const resetFields = () => {
    setStartDate(todayStr())
    setEndDate(todayStr())
    setIncludeStartTime(false)
    setIncludeEndTime(false)
    setStartTime(nowTimeTo5Min())
    setEndTime(nowTimeTo5Min())
    setPriority('medium')
    setImportance(0)
    setCategory('')
    setNewCategory('')
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!text.trim()) return
    const cat = newCategory.trim() || category || null
    onAdd(
      text,
      priority,
      importance,
      startDate || null,
      includeStartTime ? startTime : null,
      endDate || null,
      includeEndTime ? endTime : null,
      cat,
    )
    setText('')
    resetFields()
    setShowOptions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') { setText(''); setShowOptions(false) }
  }

  const handleStartDateChange = (val: string) => {
    setStartDate(val)
    if (endDate && val > endDate) setEndDate(val)
  }

  const handleEndDateChange = (val: string) => {
    setEndDate(val)
    if (startDate && val < startDate) setStartDate(val)
  }

  const handleToggleStartTime = (on: boolean) => {
    setIncludeStartTime(on)
    if (on) setStartTime(nowTimeTo5Min())
  }

  const handleToggleEndTime = (on: boolean) => {
    setIncludeEndTime(on)
    if (on) setEndTime(nowTimeTo5Min())
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => setShowOptions(v => !v)}
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-transform duration-200 ${showOptions ? 'rotate-45 bg-indigo-100' : 'bg-gray-100 hover:bg-gray-200'}`}
          title="옵션 설정"
        >
          ＋
        </button>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="새로운 할 일을 입력하세요… (Enter로 추가)"
          className="flex-1 text-gray-800 placeholder-gray-400 bg-transparent outline-none text-base"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex-shrink-0 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 rounded-lg text-sm font-medium transition-colors duration-150"
        >
          추가
        </button>
      </div>

      {showOptions && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3 bg-gray-50">

          {/* Priority */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium w-14">우선순위</span>
            <div className="flex gap-1">
              {(Object.keys(priorityConfig) as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                    priority === p ? priorityConfig[p].cls + ' ring-2 ring-offset-1 ring-indigo-400' : 'text-gray-500 bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Importance */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium w-14">중요도</span>
            <StarRating value={importance} onChange={setImportance} />
            {importance > 0 && (
              <button onClick={() => setImportance(0)} className="text-xs text-gray-400 hover:text-red-400 transition-colors">초기화</button>
            )}
          </div>

          {/* Date range */}
          <div className="space-y-1.5">
            <span className="text-xs text-gray-500 font-medium">기간</span>
            {/* Start date */}
            <div className="flex items-center gap-2 flex-wrap pl-0">
              <span className="text-xs text-gray-400 w-6">시작</span>
              <input
                type="date"
                value={startDate}
                onChange={e => handleStartDateChange(e.target.value)}
                className="text-xs text-gray-700 border border-gray-200 rounded-md px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStartTime}
                  onChange={e => handleToggleStartTime(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-300"
                />
                <span className="text-xs text-gray-500">시간 포함</span>
              </label>
              {includeStartTime && <TimeSelect value={startTime} onChange={setStartTime} />}
              {startDate && (
                <button onClick={() => { setStartDate(''); setIncludeStartTime(false) }} className="text-gray-300 hover:text-red-400 text-xs transition-colors">✕</button>
              )}
            </div>
            {/* End date */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 w-6">종료</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={e => handleEndDateChange(e.target.value)}
                className="text-xs text-gray-700 border border-gray-200 rounded-md px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEndTime}
                  onChange={e => handleToggleEndTime(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-300"
                />
                <span className="text-xs text-gray-500">시간 포함</span>
              </label>
              {includeEndTime && <TimeSelect value={endTime} onChange={setEndTime} />}
              {endDate && (
                <button onClick={() => { setEndDate(''); setIncludeEndTime(false) }} className="text-gray-300 hover:text-red-400 text-xs transition-colors">✕</button>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium w-14 pt-1">카테고리</span>
            <div className="flex-1 space-y-2">
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat === category ? '' : cat); setNewCategory('') }}
                      className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
                        category === cat ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={newCategory}
                onChange={e => { setNewCategory(e.target.value); setCategory('') }}
                placeholder="새 카테고리 입력…"
                className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
