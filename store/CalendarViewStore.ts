import { create } from 'zustand';
import { Platform } from 'react-native';
import { isIpad } from '@/utils/deviceUtils';

interface CalendarViewState {
  webColumnCount: 1 | 2 | 3;
  toggleWebColumnCount: () => void;
  setWebColumnCount: (count: 1 | 2 | 3) => void;
}

export const useCalendarViewStore = create<CalendarViewState>((set) => ({
  webColumnCount: 3,
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
}));
