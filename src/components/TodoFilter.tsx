import type { FilterType } from '../types/todo'

interface TodoFilterProps {
  filter: FilterType
  onFilterChange: (filter: FilterType) => void
  activeCount: number
  completedCount: number
  onClearCompleted: () => void
}

const filters: { value: FilterType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '진행 중' },
  { value: 'completed', label: '완료' },
]

export default function TodoFilter({
  filter,
  onFilterChange,
  activeCount,
  completedCount,
  onClearCompleted,
}: TodoFilterProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              filter === f.value
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
            {f.value === 'active' && activeCount > 0 && (
              <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {completedCount > 0 && (
        <button
          onClick={onClearCompleted}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors duration-150 px-2 py-1 rounded-lg hover:bg-red-50"
        >
          완료된 항목 삭제 ({completedCount})
        </button>
      )}
    </div>
  )
}
