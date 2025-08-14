import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Platform } from 'react-native';
import { isIpad } from '@/utils';
import { createPersistStorage } from './AsyncStorage';

type ViewMode = 'month' | 'week';

interface CalendarViewPersistedState {
  webColumnCount: 1 | 2 | 3;
  viewMode: ViewMode;
}

// Add modal states - these won't be persisted
interface CalendarModalState {
  isEventModalVisible: boolean;
  isViewEventModalVisible: boolean;
  debugModalVisible: boolean;
  debugData: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    vaultEntries: number;
    upcomingEvents: { title: string; date: string; type: string }[];
  } | null;
  // Add these new fields:
  selectedDate: Date | null;
  selectedEvents: any[];
}

interface CalendarViewState extends CalendarViewPersistedState, CalendarModalState {
  toggleWebColumnCount: () => void;
  setWebColumnCount: (count: 1 | 2 | 3) => void;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
  
  // Modal actions
  setIsEventModalVisible: (visible: boolean) => void;
  setIsViewEventModalVisible: (visible: boolean) => void;
  setDebugModalVisible: (visible: boolean) => void;
  setDebugData: (data: CalendarModalState['debugData']) => void;
  openEventModal: () => void;
  openViewEventModal: () => void;
  closeEventModals: () => void;
  openDebugModal: (data: CalendarModalState['debugData']) => void;
  closeDebugModal: () => void;
  
  // Computed getter for if any modal is open
  isAnyModalOpen: boolean;
  
  // New actions for date/event selection
  setSelectedDate: (date: Date | null) => void;
  setSelectedEvents: (events: any[]) => void;
}

export const useCalendarViewStore = create<CalendarViewState>()(
  persist(
    (set, get) => ({
      // Persisted state
      webColumnCount: 3,
      viewMode: 'month',
      
      // Modal state (not persisted)
      isEventModalVisible: false,
      isViewEventModalVisible: false,
      debugModalVisible: false,
      debugData: null,
      selectedDate: null,
      selectedEvents: [],
      
      // Computed getter
      get isAnyModalOpen() {
        const state = get();
        return state.isEventModalVisible || state.isViewEventModalVisible || state.debugModalVisible;
      },
      
      // Existing actions
      toggleWebColumnCount: () =>
        set((state) => {
          if (Platform.OS !== 'web' && isIpad()) {
            return {
              webColumnCount: state.webColumnCount === 1 ? 2 : 1,
            };
          }
          
          return {
            webColumnCount: 
              state.webColumnCount === 3 ? 2 :
              state.webColumnCount === 2 ? 1 : 3,
          };
        }),
      setWebColumnCount: (count: 1 | 2 | 3) =>
        set(() => ({
          webColumnCount: count,
        })),
      toggleViewMode: () =>
        set((state) => ({
          viewMode: state.viewMode === 'month' ? 'week' : 'month',
        })),
      setViewMode: (mode: ViewMode) =>
        set(() => ({
          viewMode: mode,
        })),
      
      // Modal actions
      setIsEventModalVisible: (visible: boolean) =>
        set(() => ({ isEventModalVisible: visible })),
      setIsViewEventModalVisible: (visible: boolean) =>
        set(() => ({ isViewEventModalVisible: visible })),
      setDebugModalVisible: (visible: boolean) =>
        set(() => ({ debugModalVisible: visible })),
      setDebugData: (data: CalendarModalState['debugData']) =>
        set(() => ({ debugData: data })),
      
      openEventModal: () =>
        set(() => ({
          isViewEventModalVisible: false,
          isEventModalVisible: true,
        })),
      openViewEventModal: () =>
        set(() => ({
          isEventModalVisible: false,
          isViewEventModalVisible: true,
        })),
      closeEventModals: () =>
        set(() => ({
          isEventModalVisible: false,
          isViewEventModalVisible: false,
        })),
      openDebugModal: (data: CalendarModalState['debugData']) =>
        set(() => ({
          debugData: data,
          debugModalVisible: true,
        })),
      closeDebugModal: () =>
        set(() => ({
          debugModalVisible: false,
        })),
      
      // New actions for date/event selection
      setSelectedDate: (date: Date | null) =>
        set(() => ({ selectedDate: date })),
      setSelectedEvents: (events: any[]) =>
        set(() => ({ selectedEvents: events })),
    }),
    {
      name: 'calendar-view-preferences',
      storage: createPersistStorage<CalendarViewPersistedState>(1),
      // Only persist the view-related state, not modal state
      partialize: (state) => ({
        webColumnCount: state.webColumnCount,
        viewMode: state.viewMode,
      }),
    }
  )
);
