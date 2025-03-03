import { create } from 'zustand'
import { RecommendationCategory } from '@/utils/TaskRecommendations'

interface RecommendationState {
  activeCategory: RecommendationCategory | null
  isOpen: boolean
  openModal: (category: RecommendationCategory) => void
  closeModal: () => void
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  activeCategory: null,
  isOpen: false,
  openModal: (category) => {
    console.log(`RecommendationStore: Opening modal for category ${category}`)
    set({ activeCategory: category, isOpen: true })
  },
  closeModal: () => {
    console.log('RecommendationStore: Closing modal')
    set({ isOpen: false })
  }
}))
