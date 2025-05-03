import { create } from 'zustand';
import { Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

type OrientationState = {
  orientation: number | null;
  isPortrait: boolean;
  isLandscape: boolean;
  init: () => void;
};

export const useOrientationStore = create<OrientationState>((set) => ({
  orientation: null,
  isPortrait: true,
  isLandscape: false,
  init: () => {
    if (Platform.OS === 'web') return;

    const update = (orientation: number) => {
        
      const isPortrait =
        orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
        orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN;

      const isLandscape =
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      set({ orientation, isPortrait, isLandscape });
    };

    ScreenOrientation.getOrientationAsync().then(update);

    const sub = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      update(orientationInfo.orientation);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(sub);
    };
  },
}));