import { create } from 'zustand'
import { Stock } from '@/types'

interface EditStockState {
  isOpen: boolean
  selectedStock: Stock | undefined
  openModal: (stock?: Stock) => void
  closeModal: () => void
}

export const useEditStockStore = create<EditStockState>((set) => ({
  isOpen: false,
  selectedStock: undefined,
  openModal: (stock) => { set({ isOpen: true, selectedStock: stock })},
  closeModal: () => {set({ isOpen: false })}
}))
