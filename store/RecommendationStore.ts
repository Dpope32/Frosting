import { create } from 'zustand'
import { RecommendationCategory } from '@/constants'

interface RecommendationState {
  activeCategory: RecommendationCategory | null
  isOpen: boolean
  openModal: (category: RecommendationCategory) => void
  closeModal: () => void
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  activeCategory: null,
  isOpen: false,
  openModal: (category) => {set({ activeCategory: category, isOpen: true })},
  closeModal: () => { set({ isOpen: false })}
}))
