import { useState } from 'react'
import type { TodoLog } from '../types/todo'

interface TodoLogsProps {
  todoId: string
  logs: TodoLog[]
  onAdd: (todoId: string, date: string, content: string) => void
  onDelete: (todoId: string, logId: string) => void
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatLogDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${y}.${m}.${d}`
}

export default function TodoLogs({ todoId, logs, onAdd, onDelete }: TodoLogsProps) {
  const [date, setDate] = useState(todayStr())
  const [content, setContent] = useState('')

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date))

  const handleAdd = () => {
    if (!content.trim()) return
    onAdd(todoId, date, content)
    setContent('')
    setDate(todayStr())
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      {/* Add log */}
      <div className="flex gap-2 items-start">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-200 flex-shrink-0"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() } }}
          placeholder="진행 내역을 입력하세요… (Enter로 추가)"
          rows={2}
          className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-200 resize-none placeholder-gray-400"
        />
        <button
          onClick={handleAdd}
          disabled={!content.trim()}
          className="flex-shrink-0 px-2.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 rounded-lg text-xs font-medium transition-colors"
        >
          추가
        </button>
      </div>

      {/* Log entries */}
      {sorted.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">아직 기록된 내역이 없습니다.</p>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {sorted.map(log => (
            <div key={log.id} className="flex gap-2 group">
              <span className="flex-shrink-0 text-xs text-indigo-400 font-medium pt-0.5 w-[72px]">
                {formatLogDate(log.date)}
              </span>
              <p className="flex-1 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                {log.content}
              </p>
              <button
                onClick={() => onDelete(todoId, log.id)}
                className="flex-shrink-0 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all pt-0.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
