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
    console.log('openModal called with stock:', stock, 'isAdd:', isAdd);
    set({ isOpen: true, selectedStock: stock, isAddMode: isAdd });
    console.log('State after openModal:', get());
  },
  closeModal: () => {
    console.log('closeModal called');
    set({ isOpen: false });
    console.log('State after closeModal:', get());
  }
}))
