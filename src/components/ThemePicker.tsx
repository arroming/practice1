import { useState, useRef, useEffect } from 'react'
import { THEMES, type Theme } from '../data/themes'

interface ThemePickerProps {
  themeId: string
  onSelect: (id: string) => void
}

function Swatch({ theme, active, onClick }: { theme: Theme; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={theme.name}
      className={`w-8 h-8 rounded-full transition-all duration-150 hover:scale-110 flex-shrink-0 ${
        active ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : 'ring-1 ring-black/10'
      }`}
      style={{ background: theme.css }}
      aria-label={theme.name}
      aria-pressed={active}
    >
      {active && (
        <span className="flex items-center justify-center w-full h-full">
          <svg className="w-3.5 h-3.5 text-gray-600 drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  )
}

export default function ThemePicker({ themeId, onSelect }: ThemePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const solids    = THEMES.filter(t => t.type === 'solid')
  const gradients = THEMES.filter(t => t.type === 'gradient')

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="배경 테마 변경"
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150
          ${open ? 'bg-white shadow-md text-indigo-500' : 'bg-white/60 hover:bg-white hover:shadow text-gray-500 hover:text-indigo-500'}
        `}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
          />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 w-64 animate-slide-in">
          <p className="text-xs font-semibold text-gray-700 mb-3">배경 테마</p>

          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-gray-400 font-medium mb-2 uppercase tracking-wide">단색</p>
              <div className="flex gap-2">
                {solids.map(t => (
                  <Swatch key={t.id} theme={t} active={themeId === t.id}
                    onClick={() => { onSelect(t.id); setOpen(false) }} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] text-gray-400 font-medium mb-2 uppercase tracking-wide">그라데이션</p>
              <div className="flex gap-2">
                {gradients.map(t => (
                  <Swatch key={t.id} theme={t} active={themeId === t.id}
                    onClick={() => { onSelect(t.id); setOpen(false) }} />
                ))}
              </div>
            </div>
          </div>

          {/* Current theme name */}
          <p className="text-[11px] text-gray-400 text-right mt-3">
            {THEMES.find(t => t.id === themeId)?.name}
          </p>
        </div>
      )}
    </div>
  )
}
