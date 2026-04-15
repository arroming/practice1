import { useState, useRef } from 'react'
import type { Priority } from '../types/todo'

interface TodoInputProps {
  onAdd: (text: string, priority: Priority, dueDate: string | null) => void
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low:    { label: '낮음', color: 'text-green-600 bg-green-50 border-green-200' },
  medium: { label: '보통', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  high:   { label: '높음', color: 'text-red-600 bg-red-50 border-red-200' },
}

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!text.trim()) return
    onAdd(text, priority, dueDate || null)
    setText('')
    setDueDate('')
    setPriority('medium')
    setShowOptions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setText('')
      setShowOptions(false)
    }
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
        <div className="border-t border-gray-100 px-4 py-3 flex flex-wrap items-center gap-4 bg-gray-50">
          {/* Priority */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">우선순위</span>
            <div className="flex gap-1">
              {(Object.keys(priorityConfig) as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-100 ${
                    priority === p
                      ? priorityConfig[p].color + ' ring-2 ring-offset-1 ring-indigo-400'
                      : 'text-gray-500 bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">마감일</span>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="text-xs text-gray-700 border border-gray-200 rounded-md px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {dueDate && (
              <button onClick={() => setDueDate('')} className="text-xs text-gray-400 hover:text-red-400 transition-colors">✕</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
