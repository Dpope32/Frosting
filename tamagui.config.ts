import { createTamagui } from 'tamagui'
import { createInterFont } from '@tamagui/font-inter'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens } from '@tamagui/themes'
import { createMedia } from '@tamagui/react-native-media-driver'
import { createFont } from 'tamagui'
import { createAnimations } from '@tamagui/animations-react-native'

const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  modal: {
    type: 'spring',
    damping: 25,
    mass: 1,
    stiffness: 300,
  }
})

const headingFont = createInterFont()
const bodyFont = createInterFont()
const spaceMonoFont = createFont({
  family: 'SpaceMono',
  size: {
    1: 12,
    2: 14,
    3: 15,
    4: 16,
    5: 18,
    6: 20,
    7: 24,
    8: 28,
    9: 32,
    10: 36,
    11: 40,
    12: 48,
  },
  lineHeight: {
    1: 17,
    2: 19,
    3: 20,
    4: 21,
    5: 23,
    6: 25,
    7: 29,
    8: 33,
    9: 37,
    10: 41,
    11: 45,
    12: 53,
  },
  weight: {
    4: '400',
  },
  letterSpacing: {
    4: 0,
  },
})

const config = createTamagui({
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
    SpaceMono: spaceMonoFont,
  },
  themes,
  tokens,
  animations,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  }),
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
