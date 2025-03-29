/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#333';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#111',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export default {
  primary: '#20AB6E',
  lime: '#D7FFD4',
  pink: '#F655FF',
  brown: '#29271D',
  sky: '#E5EDFF',
  teal: '#0E4D45',
  yellow: '#FCBB80',
  orange: '#EF580B',
  blue: '#0000FA',
  green: '#172E15',
  light: '#FFFCFF',
  grey: '#242026',
  greyLight: '#B8B3BA',
  input: '#EEE9F0',
  selected: '#F7F2F9',
  dark: '#2F2D32',
  // Additional colors
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#007AFF',
  purple: '#AF52DE',
  indigo: '#5856D6',
  coral: '#FF7F50',
  slate: '#708090',
  inputBorder: '#555555',
  inputBackground: '#333333',
  placeholder: '#A0A0A0',
  disabled: '#666666'
};

export const colorOptions = [
  { label: 'Default', value: '#010101' },
  { label: 'Light', value: '#2C2C2C' },
  { label: 'Offwhite', value: '#c4b7a6' }, 
  { label: 'Green', value: '#008f0f' },
  { label: 'Pink', value: '#cc00ad' },
  { label: 'Purple', value: '#6800b3' },
  { label: 'Yellow1', value: '#FFCC00' },
  { label: 'Blue1', value: '#546C8C' },        
  { label: 'Orange1', value: '#66CCFF' },    
  { label: 'Dark', value: '#0e0e0e' },
  { label: 'Cream', value: '#70685c' },       
  { label: 'Purple1', value: '#816687' },    
  { label: 'Yellow2', value: '#D4B483' },      
  { label: 'Lime1', value: '#CCFF99' },        
  { label: 'Blue2', value: '#22AAFF' },
  { label: 'Red2', value: '#DD4444' },
] as const;
