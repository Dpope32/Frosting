import { create } from 'zustand';

interface CalendarViewState {
  webColumnCount: 2 | 3;
  toggleWebColumnCount: () => void;
}

export const useCalendarViewStore = create<CalendarViewState>((set) => ({
  webColumnCount: 3,
  toggleWebColumnCount: () =>
    set((state) => ({
      webColumnCount: state.webColumnCount === 3 ? 2 : 3,
    })),
}));
