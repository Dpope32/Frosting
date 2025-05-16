import React from 'react'
import { XStack, YStack, Text } from 'tamagui'
import { Image } from 'react-native'
import { Project } from '@/types'
import { isIpad } from '@/utils/deviceUtils'

interface ProjectCardDetailsProps {
  project: Project
  isDark: boolean
  onEdit?: (projectId: string) => void
}

export const ProjectCardDetails = ({ project, isDark, onEdit }: ProjectCardDetailsProps) => {
  const TABLE_BORDER = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'
  const ROW_ALT_BG = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

  type RowProps = {
    label: string
    children: React.ReactNode
    rowIndex: number
  }

  const TableRow = ({ label, children, rowIndex }: RowProps) => (
    <XStack
      ai="flex-start"
      py={isIpad() ? "$2" : "$1.5"}
      px={isIpad() ? "$1.5" : "$1"}
      pl={isIpad() ? "$2" : "$1.5"}
      jc="flex-start"
      gap={isIpad() ? "$0" : "$1"}
      borderBottomWidth={1}
      borderColor={TABLE_BORDER}
      backgroundColor={rowIndex % 2 === 0 ? 'transparent' : ROW_ALT_BG}
    >
      <Text
        color={isDark ? '#dbd0c6' : '#777'}
        fontSize={isIpad() ? 16 : "$3"}
        w={isIpad() ? 130 : 95}
        fontWeight="600"
        fontFamily="$body"
        pt="$0.5"
      >
        {label}
      </Text>
      <YStack flex={1}>{children}</YStack>
    </XStack>
  )

  const rows: React.ReactNode[] = []

  if (project?.description) {
    rows.push(
      <TableRow key="description" label="Description:" rowIndex={rows.length}>
        <Text color={isDark ? '#f6f6f6' : '#333'} fontSize={isIpad() ? 16 : "$3"} fontFamily="$body">
          {project.description}
        </Text>
      </TableRow>,
    )
  }

  // People row
  if (project.people && project.people.length > 0) {
    rows.push(
      <TableRow key="people" label="People:" rowIndex={rows.length}>
        <XStack ai="center" gap={isIpad() ? "$1.5" : "$1"} flexWrap="wrap">
          {project.people.map((person) => (
            <XStack
              key={person.id}
              br={isIpad() ? 15 : 8}
              overflow="hidden"
              width={isIpad() ? 28 : 16}
              height={isIpad() ? 28 : 16}
            >
              {person.profilePicture ? (
                <Image
                  source={{ uri: person.profilePicture }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <YStack flex={1} ai="center" jc="center" backgroundColor={isDark ? '$gray3' : '$gray6'}>
                  <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? 13 : 11}>
                    {person.name.charAt(0).toUpperCase()}
                  </Text>
                </YStack>
              )}
            </XStack>
          ))}
        </XStack>
      </TableRow>,
    )
  }

  return (
    <XStack
      ml={isIpad() ? 10 : 0}
      mt="$2"
      mb={project.tasks.length > 0 ? "$0" : "$4"}
      gap="$2"
      ai="flex-start"
    >
      <YStack
        flex={1}
        br={isIpad() ? '$4' : '$3'}
        overflow="hidden"
        borderWidth={1}
        borderColor={TABLE_BORDER}
        backgroundColor={isDark ? 'rgba(30,30,30,0.6)' : 'rgba(255,255,255,0.8)'}
        minWidth={isIpad() ? 380 : 240}
        px={"$1"}
        ml={isIpad() ? 16 : 12}
        mr={isIpad() ? 24 : 12}
      >
        {rows}
      </YStack>
    </XStack>
  )
}
