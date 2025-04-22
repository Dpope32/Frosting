import React from 'react'
import { Button, Text } from 'tamagui'

interface SubmitButtonProps {
  isSubmitting: boolean
  preferences: any
}

export const SubmitButton = React.forwardRef<any, SubmitButtonProps>(({ isSubmitting, preferences }, ref) => {
  return (
    <Button
      ref={ref}
      backgroundColor={preferences.primaryColor}
      height={42}
      py={12}
      pressStyle={{ opacity: 0.8, scale: 0.98 }}
      br={12}
      px={12}
      alignSelf="center"
      m={20}
      width="100%"
      shadowColor="black"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
      elevation={3}
      disabled={isSubmitting}
      opacity={isSubmitting ? 0.7 : 1}
    >
      <Text fontFamily="$body" color="white" fontWeight="600" fontSize={16}>
        {isSubmitting ? 'Adding...' : 'Add Task'}
      </Text>
    </Button>
  )
}) 