import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

export type Theme = 'dark' | 'light' | 'system'

const THEME_COOKIE_NAME = 'theme'

/**
 * Get the current theme from cookie
 */
export const getThemeServerFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const theme = getCookie(THEME_COOKIE_NAME) as Theme | undefined
  return theme || 'system'
})

/**
 * Set the theme in a cookie
 */
export const setThemeServerFn = createServerFn({
  method: 'POST',
})
  .inputValidator((theme: Theme) => theme)
  .handler(async ({ data: theme }) => {
    setCookie(THEME_COOKIE_NAME, theme, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // Allow client-side JavaScript to access
    })
    return { success: true }
  })
