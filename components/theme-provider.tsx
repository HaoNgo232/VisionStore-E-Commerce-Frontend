'use client'

import type { JSX } from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: Readonly<ThemeProviderProps>): JSX.Element {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
