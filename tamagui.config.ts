import { createTamagui, createFont } from 'tamagui'
import { createInterFont } from '@tamagui/font-inter'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens } from '@tamagui/themes'
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

const headingFont = createInterFont({
  size: {
    1: 8,
    2: 10,
    3: 12,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 24,
    9: 28,
    10: 36,
    11: 40,
    12: 48,
    13: 64,
    14: 72,
  },
  face: {
    normal: {
      normal: 'Inter-Regular',
      italic: 'Inter-Italic',
    },
    bold: {
      normal: 'Inter-Bold',
      italic: 'Inter-BoldItalic',
    },
  }
})

const bodyFont = createInterFont()

const config = createTamagui({
  defaultTheme: 'dark',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
    body_cn: createFont({
      family: 'Inter-CN',
      size: {
        1: 12,
        2: 14,
        3: 16,
        4: 18,
        5: 20,
        6: 24,
        7: 28,
        8: 32,
        9: 36,
        10: 40,
        11: 48,
        12: 56,
        13: 64,
        14: 72,
      },
      face: {
        normal: {
          normal: 'Inter-Regular',
          italic: 'Inter-Italic',
        },
        bold: {
          normal: 'Inter-Bold',
          italic: 'Inter-BoldItalic',
        },
      }
    }),
  },
  themes,
  tokens,
  animations,

})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
