import { create } from 'zustand'
import { Stock } from '@/types'

interface EditStockState {
  isOpen: boolean
  selectedStock: Stock | undefined
  isAddMode: boolean
  openModal: (stock?: Stock, isAdd?: boolean) => void
  closeModal: () => void
}

export const useEditStockStore = create<EditStockState>((set, get) => ({
  isOpen: false,
  selectedStock: undefined,
  isAddMode: false,
  openModal: (stock, isAdd = false) => { 
    set({ isOpen: true, selectedStock: stock, isAddMode: isAdd });
  },
  closeModal: () => {
    set({ isOpen: false });
  }
}))
