import { ReactNode } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { SquircleView } from 'react-native-figma-squircle'

interface SquircleProps {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}

export function Squircle({ children, style }: SquircleProps) {
  return (
    <SquircleView
      style={[{ overflow: 'hidden', position: 'relative' }, style]}
      squircleParams={{
        cornerRadius: 35,
        cornerSmoothing: 0.7,
        fillColor: '#00000000',
      }}
    >
      {children}
    </SquircleView>
  )
}
