import React from 'react'
import { XStack, YStack, Text, Button } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { isIpad } from '@/utils'
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
          py="$2"
          br="$4"
          ai="center"
          animation="quick"
          width={columnWidthWeb}
          minWidth={350}
          maxWidth={500}
          height={100}
          position="relative"
          overflow="hidden"
          borderWidth={1}
          borderColor={isDark ? '#333' : '#e0e0e0'}
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
            <XStack jc="space-between" ai="center" mb="$1">
              <Text color={isDark ? '#f6f6f6' : '#222'} fontSize={isIpad() ? 24 : 20} fontWeight="bold" fontFamily="$body">
                {cred.name}
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
                    <MaterialIcons name="visibility-off" size={18} color={isDark ? '#666' : '#999'} />
                  ) : (
                    <MaterialIcons name="visibility" size={18} color={isDark ? '#666' : '#999'} />
                  )
                }
              />
            </XStack>

            <XStack ai="center" gap="$2" mb="$1">
              {!isIpad() && (
                <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                  Username:
                </Text>
              )}
              <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                {cred.username}
              </Text>
            </XStack>

            <XStack ai="center" gap="$2">
              <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                Password:
              </Text>
              <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                {visiblePasswords[cred.id] ? cred.password : '••••••••'}
              </Text>
            </XStack>
          </YStack>
        </XStack>
      ) : (
        <XStack
          p={isIpad() ? "$1.5" : "$1"}
          px={isWeb ? "$3.5" : isIpad() ? "$1" : "$4"}
          pl={isWeb ? "$3" : isIpad() ? "$2.5" : "$4"}
          br="$4"
          borderWidth={1}
          w={isIpad() ? "99%" : "100%"}
          borderColor={isDark ? '#333' : '#e0e0e0'}
          ai="center"
          animation="quick"
          py={isIpad() ? "$2" : "$2.5"}
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
            <XStack jc="space-between" px={isIpad() ? "$2.5" : "$1"} mb={isIpad() ? "$1" : "$0.5"} ai="center">
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
                    <MaterialIcons name="visibility-off" size={18} color={isDark ? '#666' : '#999'} />
                  ) : (
                    <MaterialIcons name="visibility" size={18} color={isDark ? '#666' : '#999'} />
                  )
                }
              />
            </XStack>

            <XStack ai="center" gap={isIpad() ? "$3" : "$1"} ml="$3" mb={isIpad() ? "$1" : 4}>
              {!isIpad() && (
                <Text color={isDark ? '#666' : '#666'} fontSize={isIpad() ? 14 : 14} w={isIpad() ? 80 : 70} fontFamily="$body">
                  Username:
                </Text>
              )}
              <Text color={isDark ? isIpad() ? '#ccc' : '#f3f3f3' :  isIpad() ? '#333' : '#333'} fontSize={isWeb ? "$5" : isIpad() ? 15 : 15} flex={1} fontFamily="$body">
                {cred.username}
              </Text>
            </XStack>

            <XStack ai="center" gap={isIpad() ? "$3" : "$1"} ml="$3">
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
