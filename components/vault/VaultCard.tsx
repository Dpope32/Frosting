import React from 'react'
import { XStack, YStack, Text, Button } from 'tamagui'
import { Eye, EyeOff } from '@tamagui/lucide-icons'
import { isIpad } from '@/utils/deviceUtils'

interface VaultCardProps {
  cred: {
    id: string
    name: string
    username: string
    password: string
  }
  isDark: boolean
  primaryColor: string
  visiblePasswords: { [id: string]: boolean }
  togglePasswordVisibility: (id: string) => void
  isWeb: boolean
  columnWidthWeb?: string
}

export const VaultCard = ({
  cred,
  isDark,
  primaryColor,
  visiblePasswords,
  togglePasswordVisibility,
  isWeb,
  columnWidthWeb
}: VaultCardProps) => {

  return isWeb ? (
    <XStack
      bg={isDark ? '#111' : '#f5f5f5'}
      px="$4"
      br="$4"
      borderWidth={1}
      borderColor={isDark ? '#121212' : '#e0e0e0'}
      ai="center"
      animation="quick"
      width={columnWidthWeb}
      minWidth={288}
      maxWidth={400}
      height={120}
      hoverStyle={{
        transform: [{ scale: 1.02 }],
        borderColor: primaryColor,
        shadowColor: primaryColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}
    >
      <YStack flex={1}>
        <XStack jc="space-between" ai="center" mt="$1" mb="$2">
          <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
            {cred.name}
          </Text>
        </XStack>

        <XStack ai="center" gap={ "$2"} mb="$2">
          {!isIpad() && (
            <Text color={isDark ? '#ccc' : '#666'} fontSize="$3" w={70} fontFamily="$body">
              Username:
            </Text>
          )}
          <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
            {cred.username}
          </Text>
        </XStack>

        <XStack ai="center" gap={"$2"} mb="$2">
          <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={70} fontFamily="$body">
            Password:
          </Text>
          <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
            {visiblePasswords[cred.id] ? cred.password : '••••••••'}
          </Text>
          <Button
            size="$3"
            bg="transparent"
            pressStyle={{ scale: 0.9 }}
            hoverStyle={{
              bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            }}
            onPress={() => togglePasswordVisibility(cred.id)}
            icon={
              visiblePasswords[cred.id] ? (
                <EyeOff size={18} color={isDark ? '#666' : '#999'} />
              ) : (
                <Eye size={18} color={isDark ? '#666' : '#999'} />
              )
            }
          />
        </XStack>
      </YStack>
    </XStack>
  ) : (
    <XStack
      bg={isDark ? '#111' : 'rgba(234, 234, 234, 0.8)'}
      p={isIpad() ? "$2" : "$1.5"}
      px={isWeb ? "$4" : isIpad() ? "$2.5" : "$4"}
      pl={isWeb ? "$4" : isIpad() ? "$2.5" : "$4"}
      br="$4"
      borderWidth={0.5}
      w={isIpad() ? "100%" : "100%"}
      borderColor={isDark ? '#777' : '#e0e0e0'}
      ai="center"
      animation="quick"
      py={isIpad() ? "$3" : "$2.5"}
    >
      <YStack flex={1}>
        <XStack jc="space-between" px={isIpad() ? "$2" : "$1"} mb={isIpad() ? "$1" : "$1"} ai="center" mt={isIpad() ? "$-1" : 0}>
          <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
            {cred.name}
          </Text>
          <Button
            size="$2"
            bg="transparent"
            pressStyle={{ scale: 0.9 }}
            onPress={() => togglePasswordVisibility(cred.id)}
            icon={
              visiblePasswords[cred.id] ? (
                <EyeOff size={18} color={isDark ? '#666' : '#999'} />
              ) : (
                <Eye size={18} color={isDark ? '#666' : '#999'} />
              )
            }
          />
        </XStack>

        <XStack ai="center" gap={isIpad() ? "$3" : "$1"} ml="$3" mb={isIpad() ? "$2" : 6}>
          {!isIpad() && (
            <Text color={isDark ? '#666' : '#666'} fontSize={isIpad() ? 14 : 14} w={isIpad() ? 80 : 70} fontFamily="$body">
              Username:
            </Text>
          )}
          <Text color={isDark ? isIpad() ? '#ccc' : '#f3f3f3' :  isIpad() ? '#333' : '#f6f6f6'} fontSize={isWeb ? "$5" : isIpad() ? 15 : 15} flex={1} fontFamily="$body">
            {cred.username}
          </Text>
        </XStack>

        <XStack ai="center" gap={isIpad() ? "$3" : "$1"} ml="$3" mb={isIpad() ? "$1" : 4}>
          <Text color={isDark ? '#666' : '#666'} fontSize={isIpad() ? 14 : 14} w={isIpad() ? 80 : 70} fontFamily="$body">
            Password:
          </Text>
          <Text color={isDark ? '#f3f3f3' : '#000'} fontSize={isWeb ? "$5" : isIpad() ? 15 : 15} flex={1} fontFamily="$body">
            {visiblePasswords[cred.id] ? cred.password : '••••••••'}
          </Text>

        </XStack>
      </YStack>
    </XStack>
  )
}
