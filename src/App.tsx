import { useTodos } from './hooks/useTodos'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'
import TodoFilter from './components/TodoFilter'
import SearchBar from './components/SearchBar'

export default function App() {
  const {
    filteredTodos,
    filter,
    setFilter,
    search,
    setSearch,
    stats,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    toggleAll,
  } = useTodos()

  const progressPercent = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header */}
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            할 일 목록 <span className="text-indigo-600">✓</span>
          </h1>
          <p className="text-gray-500 text-sm">오늘도 하나씩 해결해 봐요</p>
        </header>

        {/* Stats bar */}
        {stats.total > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-4">
                <span className="text-gray-500">전체 <strong className="text-gray-800">{stats.total}</strong></span>
                <span className="text-indigo-500">진행 중 <strong>{stats.active}</strong></span>
                <span className="text-green-500">완료 <strong>{stats.completed}</strong></span>
              </div>
              <span className="text-gray-400 font-medium">{progressPercent}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {stats.total > 0 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleAll}
                  className="text-xs text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {stats.active === 0 ? '모두 미완료로 변경' : '모두 완료로 표시'}
                </button>
                {progressPercent === 100 && (
                  <span className="text-xs text-green-500 font-medium animate-pulse">
                    🎉 모든 할 일 완료!
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <TodoInput onAdd={addTodo} />

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Filter */}
        <TodoFilter
          filter={filter}
          onFilterChange={setFilter}
          activeCount={stats.active}
          completedCount={stats.completed}
          onClearCompleted={clearCompleted}
        />

        {/* List */}
        <main>
          <TodoList
            todos={filteredTodos}
            search={search}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
        </main>

        {/* Footer hint */}
        <footer className="text-center text-xs text-gray-300 pt-2">
          더블클릭으로 편집 · Enter로 저장 · Esc로 취소
        </footer>

      </div>
    </div>
  )
}
