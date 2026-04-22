import { useState, useRef } from 'react'
import type { Priority } from '../types/todo'

interface TodoInputProps {
  categories: string[]
  onAdd: (text: string, priority: Priority, startDate: string | null, endDate: string | null, category: string | null) => void
}

const priorityConfig: Record<Priority, { label: string; cls: string }> = {
  low:    { label: '낮음', cls: 'text-green-600 bg-green-50 border-green-200' },
  medium: { label: '보통', cls: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  high:   { label: '높음', cls: 'text-red-600 bg-red-50 border-red-200' },
}

const today = () => new Date().toISOString().split('T')[0]

export default function TodoInput({ categories, onAdd }: TodoInputProps) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [category, setCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!text.trim()) return
    const cat = newCategory.trim() || category || null
    onAdd(text, priority, startDate || null, endDate || null, cat)
    setText('')
    setStartDate('')
    setEndDate('')
    setCategory('')
    setNewCategory('')
    setPriority('medium')
    setShowOptions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') { setText(''); setShowOptions(false) }
  }

  const handleStartChange = (val: string) => {
    setStartDate(val)
    if (endDate && val > endDate) setEndDate(val)
  }

  const handleEndChange = (val: string) => {
    setEndDate(val)
    if (startDate && val < startDate) setStartDate(val)
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

          {/* Date range */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium w-14">기간</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={e => handleStartChange(e.target.value)}
                min={today()}
                className="text-xs text-gray-700 border border-gray-200 rounded-md px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <span className="text-gray-400 text-xs">~</span>
              <input
                type="date"
                value={endDate}
                onChange={e => handleEndChange(e.target.value)}
                min={startDate || today()}
                className="text-xs text-gray-700 border border-gray-200 rounded-md px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {(startDate || endDate) && (
                <button onClick={() => { setStartDate(''); setEndDate('') }} className="text-xs text-gray-400 hover:text-red-400">✕</button>
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
                        category === cat
                          ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
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
