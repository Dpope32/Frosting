import { useQuery } from '@tanstack/react-query'
import { preloadedOUSchedule } from '@/constants/ouschedule'
import type { Game } from '../types/espn'

export const useOUSportsAPI = () => {
  const fetchOUSchedule = async (): Promise<Game[]> => {
    try {
      // Log each game's full structure using JSON.stringify
      preloadedOUSchedule.forEach((game, index) => {
        console.log(`Game ${index + 1}:`, JSON.stringify(game, null, 2))
      })

      if (!Array.isArray(preloadedOUSchedule)) {
        throw new Error('Schedule data is not an array')
      }
      if (preloadedOUSchedule.length === 0) {
        throw new Error('Schedule data is empty')
      }

      // Enhanced validation
      preloadedOUSchedule.forEach((game, index) => {
        if (!game.competitions || !Array.isArray(game.competitions)) {
          console.error(`Game ${index + 1} competitions invalid:`, game.competitions)
          throw new Error(`Game ${index + 1} (${game.id}) has invalid competitions data`)
        }
        if (game.competitions.length === 0) {
          throw new Error(`Game ${index + 1} (${game.id}) has no competitions`)
        }
        
        const competition = game.competitions[0]
        console.log(`Game ${index + 1} competition:`, JSON.stringify(competition, null, 2))
        
        if (!competition.competitors || !Array.isArray(competition.competitors)) {
          console.error(`Game ${index + 1} competitors invalid:`, competition.competitors)
          throw new Error(`Game ${index + 1} (${game.id}) has invalid competitors data`)
        }
        if (competition.competitors.length < 2) {
          console.error(`Game ${index + 1} competitors insufficient:`, competition.competitors)
          throw new Error(`Game ${index + 1} (${game.id}) has insufficient competitors`)
        }
      })

      return preloadedOUSchedule
    } catch (error) {
      console.error('Error in fetchOUSchedule:', error)
      throw error
    }
  }

  return useQuery<Game[], Error>({
    queryKey: ['ou-schedule'],
    queryFn: fetchOUSchedule,
    staleTime: Infinity,
    retry: false,
  })
}