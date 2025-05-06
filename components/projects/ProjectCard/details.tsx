import React from 'react'
import { XStack, YStack, Text, Button } from 'tamagui'
import { Image } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { Project } from '@/types/project'
import { isIpad } from '@/utils/deviceUtils'
import { getDaysUntilDeadline } from './projectCardUtils';

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
      ai="center"
      py={"$2"}
      px={"$2"}
      jc="flex-start"
      gap="$2"
      borderBottomWidth={1}
      borderColor={TABLE_BORDER}
      backgroundColor={rowIndex % 2 === 0 ? 'transparent' : ROW_ALT_BG}
    >
      <Text
        color={isDark ? '#dbd0c6' : '#444'}
        fontSize={isIpad() ? '$4' : '$3'}
        w={isIpad() ? 150 : 110}
        fontWeight="600"
        fontFamily="$body"
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
        <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? '$4' : '$3'} fontFamily="$body">
          {project.description}
        </Text>
      </TableRow>,
    )
  }

  // Created row
  rows.push(
    <TableRow key="created" label="Created:" rowIndex={rows.length}>
      <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? '$4' : '$3'} fontFamily="$body">
        {(() => {
          let dateObj = project?.createdAt
          if (dateObj && typeof dateObj === 'string') {
            dateObj = new Date(dateObj)
          }
          if (dateObj && dateObj instanceof Date && !isNaN(dateObj.getTime())) {
            return dateObj.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          }
          return '-'
        })()}
      </Text>
    </TableRow>,
  )

  if (project?.deadline) {
    rows.push(
      <TableRow key="deadline" label="Days remaining:" rowIndex={rows.length}>
        <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? '$4' : '$3'} fontFamily="$body">
          {(() => {
            let deadlineDate = project?.deadline
            if (!deadlineDate) return '-'
            if (typeof deadlineDate === 'string') deadlineDate = new Date(deadlineDate)
            if (!(deadlineDate instanceof Date) || isNaN(deadlineDate.getTime())) return '-'
            return getDaysUntilDeadline(deadlineDate)
          })()}
        </Text>
      </TableRow>,
    )
  }

  if (project.people && project.people.length > 0) {
    rows.push(
      <TableRow key="people" label="People:" rowIndex={rows.length}>
        <XStack ai="center" gap="$2" flexWrap="wrap">
          {project.people.map((person) => (
            <XStack
              key={person.id}
              br={isIpad() ? 16 : 14}
              overflow="hidden"
              width={isIpad() ? 32 : 28}
              height={isIpad() ? 32 : 28}
            >
              {person.profilePicture ? (
                <Image
                  source={{ uri: person.profilePicture }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <YStack flex={1} ai="center" jc="center" backgroundColor={isDark ? '$gray3' : '$gray6'}>
                  <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? 15 : 13}>
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
      ml={isIpad() ? 16 : 0}
      mt="$2"
      mb="$4"
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
        minWidth={isIpad() ? 420 : 280}
        px={"$1"}
      >
        {rows}
      </YStack>
      {onEdit && (
        <Button
          size="$2"
          circular
          backgroundColor="transparent"
          onPress={() => onEdit(project.id)}
          mt="$2"
        >
          <MaterialIcons
            name="edit"
            size={16}
            color={isDark ? '#3c3c3c' : '#6c6c6c'}
          />
        </Button>
      )}
    </XStack>
  )
}