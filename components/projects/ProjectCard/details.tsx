import React from 'react'
import { XStack, YStack, Text } from 'tamagui'
import { Image } from 'react-native'
import { Project } from '@/types'
import { isIpad } from '@/utils'

interface ProjectCardDetailsProps {
  project: Project
  isDark: boolean
  onEdit?: (projectId: string) => void
}

export const ProjectCardDetails = ({ project, isDark, onEdit }: ProjectCardDetailsProps) => {
  const TABLE_BORDER = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'
  const CARD_BG = isDark ? 'rgba(30,30,30,0.4)' : 'rgba(255,255,255,0.6)'

  type RowProps = {
    label: string
    children: React.ReactNode

  }

  const InfoRow = ({ label, children }: RowProps) => (
    <XStack
      ai="flex-start"
      py={isIpad() ? "$1.5" : "$1.5"}
      px={isIpad() ? "$2" : "$1.5"}
      gap="$2"
      borderBottomWidth={0.5}


      borderColor={TABLE_BORDER}

    >
      <Text
        color={isDark ? 'rgba(219, 208, 198, 0.8)' : 'rgba(119, 119, 119, 0.9)'}
        fontSize={isIpad() ? 14 : 13}
        minWidth={isIpad() ? 85 : 75}
        fontWeight="600"
        fontFamily="$body"

      >
        {label}
      </Text>
      <YStack flex={1}>{children}</YStack>
    </XStack>
  )

  const hasInfo = project?.description || (project.people && project.people.length > 0)











  if (!hasInfo) {
    return null




























  }

  return (
    <YStack
      br={isIpad() ? 12 : 10}
      overflow="hidden"
      borderWidth={1}
      borderColor={TABLE_BORDER}
      backgroundColor={CARD_BG}
      gap="$0"
    >
      {project?.description && (
        <InfoRow label="Description:">
          <Text 
            color={isDark ? '#f6f6f6' : '#333'} 
            fontSize={isIpad() ? 14 : 13} 
            fontFamily="$body"
            lineHeight={isIpad() ? 20 : 18}
          >
            {project.description}
          </Text>
        </InfoRow>
      )}

      {project.people && project.people.length > 0 && (
        <InfoRow label="People:">
          <XStack ai="center" gap={isIpad() ? "$1.5" : "$1"} flexWrap="wrap">
            {project.people.map((person) => (
              <XStack
                key={person.id}
                br={isIpad() ? 16 : 12}
                overflow="hidden"
                width={isIpad() ? 32 : 24}
                height={isIpad() ? 32 : 24}
                borderWidth={1}
                borderColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
              >
                {person.profilePicture ? (
                  <Image
                    source={{ uri: person.profilePicture }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <YStack 
                    flex={1} 
                    ai="center" 
                    jc="center" 
                    backgroundColor={isDark ? 'rgba(51, 51, 51, 0.6)' : 'rgba(230, 230, 230, 0.8)'}
                  >
                    <Text 
                      color={isDark ? '#f6f6f6' : '#111'} 
                      fontSize={isIpad() ? 14 : 12}
                      fontWeight="600"
                    >
                      {person.name.charAt(0).toUpperCase()}
                    </Text>
                  </YStack>
                )}
              </XStack>
            ))}
          </XStack>
        </InfoRow>
      )}
    </YStack>
  )
}