import { create } from 'zustand'

const EASTER_EGG_IMAGES = [
  require('../assets/images/bewd.png'),
  require('../assets/images/pog2.png'),
  require('../assets/images/dm.png'),
] as const

export interface EasterEggStore {
  currentImageIndex: number
  getCurrentImage: () => any
  cycleToNextImage: () => void
  resetToFirst: () => void
}

export const useEasterEggStore = create<EasterEggStore>((set, get) => ({
  currentImageIndex: 0,
  
  getCurrentImage: () => {
    const index = get().currentImageIndex
    return EASTER_EGG_IMAGES[index]
  },
  
  cycleToNextImage: () => {
    set((state) => ({
      currentImageIndex: (state.currentImageIndex + 1) % EASTER_EGG_IMAGES.length
    }))
  },
  
  resetToFirst: () => {
    set({ currentImageIndex: 0 })
  }
})) 