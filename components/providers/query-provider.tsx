"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 2 min — no refetch within this window
            staleTime: 2 * 60 * 1000,
            // Keep unused data in cache for 10 min
            gcTime: 10 * 60 * 1000,
            // Don't refetch just because the user switched tabs
            refetchOnWindowFocus: false,
            // Retry once on network errors before showing error state
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
