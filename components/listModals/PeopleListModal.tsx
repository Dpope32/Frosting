import React from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';
import { Platform, useColorScheme } from 'react-native';
import { BaseCardWithRecommendationsModal } from '../recModals/BaseCardWithRecommendationsModal';
import { usePeopleStore } from '@/store/People';
import type { Person } from '@/types/people';

interface PeopleListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CrmRecommendationChip = ({ label, onPress }: { label: string, onPress: () => void }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <Button
      size="$2" 
      theme={isDark ? 'dark' : 'light'}
      onPress={onPress}
      backgroundColor={isDark ? '$gray4' : '$gray6'}
      pressStyle={{ opacity: 0.7 }}
      borderColor={isDark ? '$gray5' : '$gray7'}
      borderWidth={1}
      borderRadius="$4"
      paddingHorizontal="$3" 
      height="$3" 
    >
      <Text fontSize={12} color={isDark ? '$gray12' : '$gray1'} fontFamily="$body">
        {label}
      </Text>
    </Button>
  );
};


export function PeopleListModal({ open, onOpenChange }: PeopleListModalProps) {
  const { contacts } = usePeopleStore();
  const allContacts = Object.values(contacts);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';

  const crmRecommendations = (
    <>
      <CrmRecommendationChip label="Recently Added" onPress={() => console.log('Filter: Recently Added')} />
      <CrmRecommendationChip label="Favorites" onPress={() => console.log('Filter: Favorites')} />
      <CrmRecommendationChip label="Birthdays" onPress={() => console.log('Filter: Birthdays')} />
    </>
  );

  return (
    <BaseCardWithRecommendationsModal
      open={open}
      onOpenChange={onOpenChange}
      title="Contacts"
      snapPoints={isWeb ? [95] : [85]} 
      showCloseButton={true}
      recommendationChips={crmRecommendations}
    >
      <>
        {allContacts.length > 0 ? (
          <YStack gap="$2" mt="$2">
            {allContacts.sort((a, b) => a.name.localeCompare(b.name)).map((person: Person) => ( 
              <XStack
                key={person.id}
                backgroundColor={isDark ? "$gray2" : "$gray3"}
                br={8}
                padding="$3"
                alignItems="center"
              >
                <Text color={isDark ? "$gray12" : "$gray11"} fontFamily="$body">
                  {person.name} 
                </Text>
              </XStack>
            ))}
          </YStack>
        ) : (
          <YStack backgroundColor={isDark ? "$gray2" : "$gray3"} br={8} padding="$4" alignItems="center" mt="$2">
            <Text fontFamily="$body" color={isDark ? "$gray12" : "$gray11"} opacity={0.7}>
              No contacts found
            </Text>
          </YStack>
        )}
      </>
    </BaseCardWithRecommendationsModal>
  );
}
