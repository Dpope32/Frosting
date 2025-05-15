import React from 'react'
import { XStack, YStack, Text, isWeb } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient';
import { isIpad } from '@/utils/deviceUtils';
import { NoteExampleChip } from './NoteExampleChip';
import { useExampleNotes, getExampleNoteTitle } from './ExampleNotesManager';
import { Note } from '@/types/notes';

interface NotesEmptyProps {
  isDark: boolean
  primaryColor: string
  isWeb: boolean
  onAddExampleNote?: (note: Note) => void
}

export const NotesEmpty = ({
  isDark,
  primaryColor,
  isWeb,
  onAddExampleNote
}: NotesEmptyProps) => {
  const { exampleNotes } = useExampleNotes();

  const handleExampleNotePress = (index: number) => {
    if (onAddExampleNote && exampleNotes[index]) {
      onAddExampleNote(exampleNotes[index]);
    }
  };

  return (
    <XStack 
      p={isWeb ? "$6" : "$4"} 
      br="$4" 
      ai="flex-start"
      jc="center"
      borderWidth={1} 
      borderColor={isDark ? "#333" : "#e0e0e0"} 
      width={isWeb ? "80%" : "92%"} 
      maxWidth={isWeb ? 800 : "92%"} 
      mx="auto"
      py={isWeb ? "$6" : "$5"}
      marginTop={isWeb ? 10 : 16}
      overflow="hidden"
    >
      <LinearGradient
        colors={isDark ? ['rgb(34, 34, 34)', 'rgb(0, 0, 0)'] : ['#ffffff', '#eeeeee']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <YStack gap="$2" width="100%" position="relative"> 
        <YStack gap="$3" px="$2">
          <XStack gap="$2" ai="flex-start">
              <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Capture Your Thoughts
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Create and organize notes for ideas, tasks, or anything important.
              </Text>
            </YStack>
          </XStack>

          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                 Markdown Support
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Write in Markdown to format your notes. 
                Use bold, underline, bullet points, and more to make your notes more readable.
              </Text>
            </YStack>
          </XStack>
          
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                 Just Drag and Drop
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Drag and drop notes to the trashcan to delete them.
                You can also drag and drop notes to other notes to rearrange them
              </Text>
            </YStack>
          </XStack>
        </YStack>

        <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center" fontFamily="$body" mt="$2">
          Try out example notes:
        </Text>
        <YStack width="100%" alignItems="center" justifyContent="center" ai="center">
          <XStack 
            jc="center"
            px="$2"
            gap="$2"
            flexWrap="wrap"
            width="100%"
            flexDirection="row"
          >
            {exampleNotes.map((_, index) => (
              <NoteExampleChip 
                key={index}
                title={getExampleNoteTitle(index)} 
                onPress={() => handleExampleNotePress(index)} 
                isDark={isDark}
                index={index}
              />
            ))}
          </XStack>
        </YStack>
        
        <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center" fontFamily="$body" mt="$4">
          Or click the + button below to create your own
        </Text>
      </YStack>
    </XStack>
  )
} 