// hooks/useOUSportsAPI.ts
import { useQuery } from '@tanstack/react-query'
import { preloadedOUSchedule } from '@/constants/ouschedule'
import type { Game } from '../types/espn'

export const useOUSportsAPI = () => {
  const fetchOUSchedule = async (): Promise<Game[]> => preloadedOUSchedule

  return useQuery<Game[], Error>({
    queryKey: ['ou-schedule'],
    queryFn: fetchOUSchedule,
    staleTime: Infinity,
    retry: false,
  })
}
