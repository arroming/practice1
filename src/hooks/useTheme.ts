import { useState } from 'react'
import { THEMES, DEFAULT_THEME_ID, type Theme } from '../data/themes'

const STORAGE_KEY = 'todo-app-theme'

export function useTheme(): { themeId: string; theme: Theme; applyTheme: (id: string) => void } {
  const [themeId, setThemeId] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID
  )

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES.find(t => t.id === DEFAULT_THEME_ID)!

  const applyTheme = (id: string) => {
    setThemeId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  return { themeId, theme, applyTheme }
}
