import React from 'react';
import { XStack, Text, Button, YStack } from 'tamagui';
import { useColorScheme, Image } from 'react-native';
import { isIpad } from '@/utils';
import { Person } from '@/types';

interface PeopleSelectorProps {
  people: Person[];
  selectedPeople: Person[];
  onPersonSelect: (person: Person) => void;
}

export function PeopleSelector({ people, selectedPeople, onPersonSelect }: PeopleSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isSelected = (person: Person) => {
    return selectedPeople.some(p => p.id === person.id);
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };


  return (
    <XStack mt={-12} px={isIpad() ? "$2.5" : "$2.5"} gap={isIpad() ? "$1.5" : "$0"} alignItems="center" justifyContent="flex-start">
      <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="500">
        People?
      </Text>
      <XStack gap={isIpad() ? "$2" : "$1"} ml={isIpad() ? "$2.5" : "$2.5"}>
        {people.map(person => {
          const selected = isSelected(person);
          
          return (
            <Button
              key={person.id}
              onPress={() => onPersonSelect(person)}
              backgroundColor={
                selected
                  ? isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'
                  : isDark ? "$gray2" : "white"
              }
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              br={isIpad() ? 20 : 21}
              p={0}
              borderWidth={1}
              borderColor={
                selected
                  ? 'transparent'
                  : isDark ? "$gray7" : "$gray4"
              }
              width={isIpad() ? 46 : 42}
              height={isIpad() ? 46 : 42}
              overflow="hidden"
            >
              {person.profilePicture ? (
                <Image
                  source={{ uri: person.profilePicture }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: isIpad() ? 20 : 16,
                    borderWidth: selected ? 2 : 0,
                    borderColor: selected ? '#3B82F6' : 'transparent'
                  }}
                />
              ) : (
                <YStack
                  width="100%"
                  height="100%"
                  borderRadius={isIpad() ? 20 : 16}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={selected ? '#3B82F6' : isDark ? "$gray10" : "$gray4"}
                >
                  <Text
                    color={selected ? 'white' : isDark ? "$gray1" : "white"}
                    fontFamily="$body"
                    fontWeight="700"
                    fontSize={isIpad() ? 16 : 14}
                  >
                    {getInitial(person.name)}
                  </Text>
                </YStack>
              )}
            </Button>
          );
        })}
      </XStack>
    </XStack>
  );
}
