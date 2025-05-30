import { create } from 'zustand'
import { GetThemeValueForKey } from 'tamagui'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type ToastPosition = 'top-center'

export interface ToastOptions {
  duration?: number
  fontFamily?: GetThemeValueForKey<'fontFamily'>
  position?: ToastPosition
}

interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
  fontFamily: GetThemeValueForKey<'fontFamily'>
  position: ToastPosition
  createdAt: number
}

export interface ToastStore { 
  toasts: Toast[]
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => string
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

export type ToastStoreType = ReturnType<typeof useToastStore>;

const DEFAULT_DURATION = 1500
const DEFAULT_FONT_FAMILY = "$body" as GetThemeValueForKey<'fontFamily'>
const DEFAULT_POSITION = "top-center"

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (message: string, type: ToastType = 'success', options?: ToastOptions) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
    const duration = options?.duration ?? DEFAULT_DURATION
    const fontFamily = options?.fontFamily ?? DEFAULT_FONT_FAMILY
    const position = options?.position ?? DEFAULT_POSITION
    
    set((state) => ({
      toasts: [...state.toasts, { 
        id, 
        message, 
        type, 
        duration,
        fontFamily,
        position,
        createdAt: Date.now()
      }],
    }))
    
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }))
    }, duration)
    
    return id
  },
  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },
  clearAllToasts: () => {
    set({ toasts: [] })
  }
}))
