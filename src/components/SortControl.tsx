import type { SortOption } from '../types/todo'

interface SortControlProps {
  sort: SortOption
  onChange: (s: SortOption) => void
}

const options: { value: SortOption; label: string; icon: string }[] = [
  { value: 'default',   label: '기본순',   icon: '•' },
  { value: 'date-asc',  label: '날짜 오름차순', icon: '↑' },
  { value: 'date-desc', label: '날짜 내림차순', icon: '↓' },
]

export default function SortControl({ sort, onChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400 font-medium">정렬</span>
      <div className="flex gap-1">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
              sort === opt.value
                ? 'bg-indigo-100 text-indigo-600'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title={opt.label}
          >
            <span>{opt.icon}</span>
            <span className="hidden sm:inline">{opt.label.replace(' ', ' ')}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
