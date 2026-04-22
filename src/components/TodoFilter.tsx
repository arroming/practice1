import type { FilterType } from '../types/todo'
import { getCategoryColor } from './TodoItem'

interface TodoFilterProps {
  filter: FilterType
  onFilterChange: (f: FilterType) => void
  activeCount: number
  completedCount: number
  onClearCompleted: () => void
  categories: string[]
  categoryFilter: string | null
  onCategoryFilter: (cat: string | null) => void
}

const filters: { value: FilterType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '진행 중' },
  { value: 'completed', label: '완료' },
]

export default function TodoFilter({
  filter, onFilterChange, activeCount, completedCount, onClearCompleted,
  categories, categoryFilter, onCategoryFilter,
}: TodoFilterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                filter === f.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
              {f.value === 'active' && activeCount > 0 && (
                <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{activeCount}</span>
              )}
            </button>
          ))}
        </div>

        {completedCount > 0 && (
          <button
            onClick={onClearCompleted}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            완료 삭제 ({completedCount})
          </button>
        )}
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-400 mr-1">카테고리</span>
          <button
            onClick={() => onCategoryFilter(null)}
            className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors ${
              !categoryFilter ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            전체
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryFilter(cat === categoryFilter ? null : cat)}
              className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors ${
                categoryFilter === cat
                  ? getCategoryColor(cat, categories) + ' border-transparent'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
