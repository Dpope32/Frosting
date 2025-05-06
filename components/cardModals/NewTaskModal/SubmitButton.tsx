import React from 'react'
import { Button, Text } from 'tamagui'
import { isIpad } from '@/utils/deviceUtils'
interface SubmitButtonProps {
  isSubmitting: boolean
  preferences: any
  onPress: () => void
}

export const SubmitButton = React.forwardRef<any, SubmitButtonProps>(({ isSubmitting, preferences, onPress }, ref) => {
  return (
    <Button
      ref={ref}
      backgroundColor={preferences.primaryColor}
      height={42}
      py={12}
      pressStyle={{ opacity: 0.8, scale: 0.98 }}
      mr={isIpad() ? 16 : 16}
      br={12}
      m={isIpad() ? 20 : 0}
      mt={isIpad() ? 20 : 10}
      width="96%"
      shadowColor="black" 
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
      elevation={3}
      disabled={isSubmitting}
      opacity={isSubmitting ? 0.7 : 1}
      onPress={onPress}
    >
      <Text fontFamily="$body" color="white" fontWeight="600" fontSize={16}>
        {isSubmitting ? 'Adding...' : 'Add Task'}
      </Text>
    </Button>
  )
}) 