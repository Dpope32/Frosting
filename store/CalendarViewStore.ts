import { create } from 'zustand';
import { Platform } from 'react-native';
import { isIpad } from '@/utils';

type ViewMode = 'month' | 'week';

interface CalendarViewState {
  webColumnCount: 1 | 2 | 3;
  viewMode: ViewMode;
  toggleWebColumnCount: () => void;
  setWebColumnCount: (count: 1 | 2 | 3) => void;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useCalendarViewStore = create<CalendarViewState>((set) => ({
  webColumnCount: 3,
  viewMode: 'month',
  toggleWebColumnCount: () =>
    set((state) => {
      // On iPad, only toggle between 1 and 2 columns
      if (Platform.OS !== 'web' && isIpad()) {
        return {
          webColumnCount: state.webColumnCount === 1 ? 2 : 1,
        };
      }
      
      // On web, cycle through 1, 2, 3
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
}));
