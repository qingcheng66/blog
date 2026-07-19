"use client"

import { ThemeProvider as CustomThemeProvider } from "@/hooks/use-theme"

export function ThemeProvider({ children, ..._props }: { children: React.ReactNode }) {
  return <CustomThemeProvider>{children}</CustomThemeProvider>
}
