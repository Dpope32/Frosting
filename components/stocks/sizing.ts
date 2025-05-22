import { useMemo } from 'react'
import { isWeb } from 'tamagui'
import { isIpad } from '@/utils'

export const sizing = useMemo(() => {
    if (isWeb) {
      return {
        iconSize: 24,
        containerSize: 56,
        titleSize: 20,
        subtitleSize: 16,
        inputHeight: 52,
        buttonHeight: 52,
        padding: '$4',
        gap: '$4'
      }
    } else if (isIpad()) {
      return {
        iconSize: 22,
        containerSize: 52,
        titleSize: 19,
        subtitleSize: 15,
        inputHeight: 50,
        buttonHeight: 50,
        padding: '$4',
        gap: '$4'
      }
    } else {
      return {
        iconSize: 20,
        containerSize: 48,
        titleSize: 18,
        subtitleSize: 14,
        inputHeight: 48,
        buttonHeight: 48,
        padding: '$3',
        gap: '$3'
      }
    }
  }, [])