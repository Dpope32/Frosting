import React from 'react'
import { XStack, YStack, Text, Button } from 'tamagui'
import { Eye, EyeOff } from '@tamagui/lucide-icons'
import { isIpad } from '@/utils/deviceUtils'
import { LinearGradient } from 'expo-linear-gradient'
import { Alert, Platform } from 'react-native'
import { LongPressDelete } from '@/components/common/LongPressDelete'

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
  onDelete: () => void
}

export const VaultCard = ({
  cred,
  isDark,
  primaryColor,
  visiblePasswords,
  togglePasswordVisibility,
  isWeb,
  columnWidthWeb,
  onDelete
}: VaultCardProps) => {
  const handleDelete = (onComplete: (deleted: boolean) => void) => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this password entry?')) {
        onDelete();
        onComplete(true);
      } else {
        onComplete(false);
      }
    } else {
      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this password entry?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => onComplete(false) },
          { text: 'Delete', style: 'destructive', onPress: () => { onDelete(); onComplete(true); } },
        ]
      );
    }
  };

  return (
    <LongPressDelete onDelete={handleDelete}>
      {isWeb ? (
        <XStack
          px="$5"
          pt="$2"
          br="$4"
          ai="center"
          animation="quick"
          width={columnWidthWeb}
          minWidth={300}
          maxWidth={400}
          height={120}
          position="relative"
          overflow="hidden"
          hoverStyle={{
            transform: [{ scale: 1.02 }],
            borderColor: primaryColor,
            shadowColor: primaryColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}
        >
          <LinearGradient
            colors={isDark ? ['rgb(7, 7, 7)', 'rgb(15, 15, 15)', 'rgb(20, 19, 19)', 'rgb(25, 25, 25)'] : ['rgba(255, 255, 255, 0.7)', 'rgba(238, 238, 238, 0.7)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
            }}
          />
          <YStack flex={1}>
            <XStack jc="space-between" ai="center" mt="$1" mb="$2">
              <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                {cred.name}
              </Text>
            </XStack>

            <XStack ai="center" gap={ "$2"} mb={isWeb ? 0 : "$2"}>
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
          p={isIpad() ? "$2" : "$1.5"}
          px={isWeb ? "$3.5" : isIpad() ? "$1" : "$4"}
          pl={isWeb ? "$3" : isIpad() ? "$2.5" : "$4"}
          br="$4"
          borderWidth={1}
          w={isIpad() ? "99%" : "100%"}
          borderColor={isDark ? '#777' : '#9c9c9c'}
          ai="center"
          animation="quick"
          py={isIpad() ? "$3.5" : "$2.5"}
          position="relative"
          overflow="hidden"
        >
          <LinearGradient
            colors={isDark ? ['rgb(7, 7, 7)', 'rgb(15, 15, 15)', 'rgb(20, 19, 19)', 'rgb(25, 25, 25)'] : ['rgba(255, 255, 255, 0.7)', 'rgba(238, 238, 238, 0.7)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
            }}
          />
          <YStack flex={1}>
            <XStack jc="space-between" px={isIpad() ? "$2.5" : "$1"} mb={isIpad() ? "$1.5" : "$1"} ai="center" mt={isIpad() ? "$-1" : 0}>
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
      )}
    </LongPressDelete>
  )
}
