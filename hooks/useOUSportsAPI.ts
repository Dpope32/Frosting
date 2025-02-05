// hooks/useOUSportsAPI.ts
import { useQuery } from '@tanstack/react-query'
import { preloadedOUSchedule } from '@/constants/ouschedule'
import type { Game } from '../types/espn'

export const useOUSportsAPI = () => {
const fetchOUSchedule = async (): Promise<Game[]> => {
  try {
    // Log each game's structure individually for better debugging
    preloadedOUSchedule.forEach((game, index) => {
      console.log(`Game ${index + 1}:`, {
        id: game.id,
        date: game.date,
        competitions: game.competitions?.map(comp => ({
          competitors: comp.competitors?.map(c => ({
            homeAway: c.homeAway,
            team: c.team
          })),
          venue: comp.venue,
          status: comp.status
        }))
      })
    })

    if (!Array.isArray(preloadedOUSchedule)) {
      throw new Error('Schedule data is not an array')
    }
    if (preloadedOUSchedule.length === 0) {
      throw new Error('Schedule data is empty')
    }

    // Validate the structure of each game
    preloadedOUSchedule.forEach((game, index) => {
      if (!game.competitions || !Array.isArray(game.competitions)) {
        throw new Error(`Game ${index + 1} (${game.id}) has invalid competitions data`)
      }
      if (game.competitions.length === 0) {
        throw new Error(`Game ${index + 1} (${game.id}) has no competitions`)
      }
      const competition = game.competitions[0]
      if (!competition.competitors || !Array.isArray(competition.competitors)) {
        throw new Error(`Game ${index + 1} (${game.id}) has invalid competitors data`)
      }
      if (competition.competitors.length < 2) {
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
