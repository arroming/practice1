import { useState } from 'react'
import type { Todo, Priority } from '../types/todo'

interface CalendarViewProps {
  todos: Todo[]
}

// ── helpers ──────────────────────────────────────────────────────────────────

function toStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function todayStr(): string {
  return toStr(new Date())
}

/** Returns week rows for the given month. Each row has 7 dates (Mon–Sun). */
function getMonthWeeks(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1)
  const dow = first.getDay() // 0=Sun
  const offset = dow === 0 ? 6 : dow - 1 // days back to Mon
  const start = new Date(year, month, 1 - offset)

  const weeks: Date[][] = []
  const cur = new Date(start)
  while (true) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
    if (cur.getMonth() > month || cur.getFullYear() > year) break
    if (weeks.length >= 6) break
  }
  return weeks
}

// ── layout algorithm ─────────────────────────────────────────────────────────

interface EventLayout {
  todo: Todo
  colStart: number    // 0-indexed within visible days
  colEnd: number
  slot: number
  isStart: boolean    // starts in this week?
  isEnd: boolean      // ends in this week?
  numCols: number
}

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

function layoutWeek(todos: Todo[], weekDates: Date[], showWeekends: boolean): EventLayout[] {
  const days = showWeekends ? weekDates : weekDates.slice(0, 5)
  const numCols = days.length
  const weekStartStr = toStr(days[0])
  const weekEndStr = toStr(days[numCols - 1])

  const overlapping = todos.filter(todo => {
    const s = todo.startDate || todo.endDate
    const e = todo.endDate || todo.startDate
    if (!s && !e) return false
    return (!s || s <= weekEndStr) && (!e || e >= weekStartStr)
  })

  // Sort: priority high→low, then by endDate ascending (shorter deadline first)
  overlapping.sort((a, b) => {
    const pd = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (pd !== 0) return pd
    const ae = a.endDate || a.startDate || ''
    const be = b.endDate || b.startDate || ''
    return ae.localeCompare(be)
  })

  const layouts: EventLayout[] = []
  const occupied: boolean[][] = []   // occupied[slot][col]

  for (const todo of overlapping) {
    const eventStart = todo.startDate || todo.endDate!
    const eventEnd = todo.endDate || todo.startDate!

    let colStart = 0
    let colEnd = numCols - 1

    for (let i = 0; i < numCols; i++) {
      const ds = toStr(days[i])
      if (ds < eventStart) colStart = i + 1
      if (ds > eventEnd) { colEnd = i - 1; break }
    }

    if (colStart > numCols - 1 || colEnd < 0 || colStart > colEnd) continue

    // Assign slot
    let slot = 0
    while (true) {
      if (!occupied[slot]) occupied[slot] = new Array(numCols).fill(false)
      let fits = true
      for (let c = colStart; c <= colEnd; c++) {
        if (occupied[slot][c]) { fits = false; break }
      }
      if (fits) break
      slot++
    }
    if (!occupied[slot]) occupied[slot] = new Array(numCols).fill(false)
    for (let c = colStart; c <= colEnd; c++) occupied[slot][c] = true

    layouts.push({
      todo,
      colStart,
      colEnd,
      slot,
      isStart: !todo.startDate || todo.startDate >= weekStartStr,
      isEnd:   !todo.endDate   || todo.endDate   <= weekEndStr,
      numCols,
    })
  }

  return layouts
}

// ── sub-components ────────────────────────────────────────────────────────────

const priorityBar: Record<Priority, string> = {
  high:   'bg-red-400 text-white',
  medium: 'bg-amber-400 text-white',
  low:    'bg-green-400 text-white',
}

function EventBar({ layout }: { layout: EventLayout }) {
  const { todo, isStart, isEnd } = layout
  return (
    <div
      title={`${todo.text}${todo.startDate ? `\n${todo.startDate}${todo.endDate && todo.endDate !== todo.startDate ? ' ~ ' + todo.endDate : ''}` : ''}`}
      className={`h-5 flex items-center px-1.5 text-[11px] font-medium overflow-hidden whitespace-nowrap cursor-default select-none
        ${priorityBar[todo.priority]}
        ${isStart ? 'rounded-l-md' : ''}
        ${isEnd   ? 'rounded-r-md' : ''}
        ${todo.completed ? 'opacity-40 line-through' : ''}
      `}
    >
      {isStart && <span className="truncate">{todo.text}</span>}
    </div>
  )
}

const DAY_HEADERS_ALL = ['월', '화', '수', '목', '금', '토', '일']
const DAY_HEADERS_WD  = ['월', '화', '수', '목', '금']

// ── main component ────────────────────────────────────────────────────────────

export default function CalendarView({ todos }: CalendarViewProps) {
  const now = new Date()
  const [year, setYear]           = useState(now.getFullYear())
  const [month, setMonth]         = useState(now.getMonth())
  const [showWeekends, setShowWeekends] = useState(true)

  const weeks = getMonthWeeks(year, month)
  const dayHeaders = showWeekends ? DAY_HEADERS_ALL : DAY_HEADERS_WD
  const numCols = dayHeaders.length
  const today = todayStr()

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()) }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-semibold text-gray-800 min-w-[100px] text-center">
            {year}년 {month + 1}월
          </h2>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button onClick={goToday} className="ml-1 text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            오늘
          </button>
        </div>
        <button
          onClick={() => setShowWeekends(v => !v)}
          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
            showWeekends ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {showWeekends ? '주말 숨기기' : '주말 보기'}
        </button>
      </div>

      {/* Day headers */}
      <div className={`grid border-b border-gray-100`} style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}>
        {dayHeaders.map((h, i) => {
          const isSat = showWeekends && i === 5
          const isSun = showWeekends && i === 6
          return (
            <div key={h} className={`py-2 text-center text-xs font-semibold
              ${isSat ? 'text-blue-400' : isSun ? 'text-red-400' : 'text-gray-500'}
            `}>{h}</div>
          )
        })}
      </div>

      {/* Weeks */}
      <div className="divide-y divide-gray-100">
        {weeks.map((week, wi) => {
          const visibleDays = showWeekends ? week : week.slice(0, 5)
          const layouts = layoutWeek(todos, week, showWeekends)
          const maxSlot = layouts.length > 0 ? Math.max(...layouts.map(l => l.slot)) : -1
          const eventsH = (maxSlot + 1) * 22 + (layouts.length > 0 ? 4 : 0)

          return (
            <div key={wi}>
              {/* Event bars layer */}
              {layouts.length > 0 && (
                <div
                  className="relative mx-0.5"
                  style={{ height: eventsH }}
                >
                  {layouts.map((layout, li) => {
                    const leftPct = (layout.colStart / numCols) * 100
                    const widthPct = ((layout.colEnd - layout.colStart + 1) / numCols) * 100
                    return (
                      <div
                        key={`${layout.todo.id}-${wi}-${li}`}
                        className="absolute px-0.5"
                        style={{
                          top: layout.slot * 22 + 2,
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          height: 20,
                        }}
                      >
                        <EventBar layout={layout} />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Day cells row */}
              <div className="grid" style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}>
                {visibleDays.map((date, di) => {
                  const ds = toStr(date)
                  const isToday = ds === today
                  const isCurrentMonth = date.getMonth() === month
                  const isSat = showWeekends && di === 5
                  const isSun = showWeekends && di === 6

                  return (
                    <div
                      key={di}
                      className={`h-9 flex items-start justify-end px-1.5 pt-1
                        ${!isCurrentMonth ? 'opacity-30' : ''}
                        ${isSat ? 'bg-blue-50/40' : isSun ? 'bg-red-50/40' : ''}
                      `}
                    >
                      <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium
                        ${isToday ? 'bg-indigo-600 text-white' : isSat ? 'text-blue-500' : isSun ? 'text-red-500' : 'text-gray-600'}
                      `}>
                        {date.getDate()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
