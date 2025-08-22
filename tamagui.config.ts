import { createTamagui, createFont, createVariable } from 'tamagui'
import { createInterFont } from '@tamagui/font-inter'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens as baseTokens } from '@tamagui/themes' 
import { createAnimations } from '@tamagui/animations-react-native'
import { createMedia } from '@tamagui/react-native-media-driver'

const customColorTokenNames = {
  onboardingLabel: true,
  onboardingSubText: true,
  onboardingInputBackground: true,
  onboardingInputBorder: true,
  onboardingInputText: true,
  onboardingPlaceholder: true,
  onboardingButtonPrimary: true,
  onboardingButtonSecondaryBackground: true, 
  onboardingButtonSecondaryBorder: true, 
  onboardingButtonSecondaryText: true,
  onboardingWelcomeButtonBackground: true,
  onboardingWelcomeButtonText: true,
  onboardingStep1Background: true,
  onboardingStep1HoverBackground: true,
  onboardingStep1CircleBackground: true,
  onboardingIndexBackground: true, 
  onboardingIndexBorder: true, 
  onboardingIndexButtonBackground: true,
  onboardingIndexButtonBorder: true,
  onboardingIndexButtonText: true,
  onboardingCardBackground: true, 
  onboardingError: true,
};

const mergedTokens = {
  ...baseTokens,
  color: {
    ...baseTokens.color,
    ...Object.fromEntries(Object.keys(customColorTokenNames).map(k => [k, createVariable({ key: k, name: k, val: '' })])), 
  },
};

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
  themes: {
    dark: {
      ...themes.dark,
      onboardingLabel: baseTokens.color.gray12Dark.val,
      onboardingSubText: baseTokens.color.gray9Dark.val,
      onboardingInputBackground: baseTokens.color.gray5Dark.val,
      onboardingInputBorder: "rgba(255, 255, 255, 0.3)",
      onboardingInputText: baseTokens.color.gray12Dark.val,
      onboardingPlaceholder: baseTokens.color.gray8Dark.val,
      onboardingButtonPrimary: 'rgb(0, 140, 255)',
      onboardingButtonSecondaryBackground: 'rgba(255, 255, 255, 0.08)',
      onboardingButtonSecondaryBorder: 'rgba(255, 255, 255, 0.15)',
      onboardingButtonSecondaryText: baseTokens.color.gray11Dark.val,
      onboardingWelcomeButtonBackground: baseTokens.color.blue9Dark.val,
      onboardingWelcomeButtonText: baseTokens.color.gray1Dark.val,
      onboardingStep1Background: baseTokens.color.gray4Dark.val,
      onboardingStep1HoverBackground: baseTokens.color.gray5Dark.val,
      onboardingStep1CircleBackground: baseTokens.color.gray6Dark.val,
      onboardingIndexBackground: 'rgb(15, 15, 15)',
      onboardingIndexBorder: 'rgba(255,255,255,0.1)',
      onboardingIndexButtonBackground: baseTokens.color.gray4Dark.val,
      onboardingIndexButtonBorder: baseTokens.color.gray8Dark.val,
      onboardingIndexButtonText: baseTokens.color.gray12Dark.val,
      onboardingCardBackground: 'rgba(0, 0, 0, 0.4)',
      onboardingError: baseTokens.color.red9Dark.val,
    },
    light: {
      ...themes.light,
      onboardingLabel: baseTokens.color.gray12Light.val,
      onboardingSubText: baseTokens.color.gray9Light.val,
      onboardingInputBackground: baseTokens.color.gray2Light.val,
      onboardingInputBorder: "rgba(0, 0, 0, 0.2)",
      onboardingInputText: baseTokens.color.gray12Light.val,
      onboardingPlaceholder: baseTokens.color.gray8Light.val,
      onboardingButtonPrimary: baseTokens.color.blue10Light.val,
      onboardingButtonSecondaryBackground: 'rgba(0, 0, 0, 0.05)',
      onboardingButtonSecondaryBorder: 'rgba(0, 0, 0, 0.1)',
      onboardingButtonSecondaryText: baseTokens.color.gray11Light.val,
      onboardingWelcomeButtonBackground: baseTokens.color.blue9Light.val,
      onboardingWelcomeButtonText: baseTokens.color.gray1Light.val,
      onboardingStep1Background: '#f0f0f0',
      onboardingStep1HoverBackground: '#e0e0e0',
      onboardingStep1CircleBackground: '#e0e0e0',
      onboardingIndexBackground: 'rgb(241, 241, 241)', 
      onboardingIndexBorder: 'rgba(0,0,0,0.1)',
      onboardingIndexButtonBackground: baseTokens.color.gray1Light.val,
      onboardingIndexButtonBorder: 'rgba(0, 0, 0, 0.1)',
      onboardingIndexButtonText: baseTokens.color.gray12Light.val,
      onboardingCardBackground: 'rgba(255, 255, 255, 0.4)',
      onboardingError: baseTokens.color.red9Light.val, 
    },
  },
  tokens: mergedTokens,
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
