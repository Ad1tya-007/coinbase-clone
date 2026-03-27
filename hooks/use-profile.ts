"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

export const PROFILE_QUERY_KEY = ["profile"] as const

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  createdAt: string
}

export function useProfile() {
  return useQuery<UserProfile, Error>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/user/profile")
      if (!res.ok) throw new Error("Failed to load profile")
      return res.json()
    },
    staleTime: 5 * 60 * 1000,  // profile rarely changes
    gcTime: 30 * 60 * 1000,
  })
}

export function useRefreshProfile() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
}
