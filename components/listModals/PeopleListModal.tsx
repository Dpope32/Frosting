import React from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';
import { Platform, useColorScheme, Alert } from 'react-native';
import { BaseCardWithRecommendationsModal } from '../recModals/BaseCardWithRecommendationsModal';
import { usePeopleStore } from '@/store/People';
import { useToastStore } from '@/store/ToastStore';
import { Ionicons } from '@expo/vector-icons';
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
      backgroundColor={isDark ? '$gray4' : '$gray3'}
      pressStyle={{ opacity: 0.7 }}
      borderColor={isDark ? '$gray5' : '$gray8'}
      borderWidth={1}
      borderRadius="$4"
      paddingHorizontal="$3"
      height="$3"
    >
      <Text fontSize={12} color={isDark ? '$gray12' : '$gray12'} fontFamily="$body">
        {label}
      </Text>
    </Button>
  );
};


export function PeopleListModal({ open, onOpenChange }: PeopleListModalProps) {
  const { contacts, deletePerson } = usePeopleStore();
  const { showToast } = useToastStore();
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

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this contact?')) {
        deletePerson(id);
        onOpenChange(false);
        showToast('Contact successfully removed', 'success');
      }
    } else {
      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this contact?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', style: 'destructive', onPress: () => {
              deletePerson(id);
              onOpenChange(false);
              showToast('Contact successfully removed', 'success');
            }
          },
        ],
      );
    }
  };

  return (
    <BaseCardWithRecommendationsModal
      open={open}
      onOpenChange={onOpenChange}
      title="Contacts"
      snapPoints={isWeb ? [95] : [85]} 
      showCloseButton={true}
      hideHandle={true}
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
                justifyContent="space-between"
                alignItems="center"
              >
                <Text color={isDark ? "$gray12" : "$gray11"} fontFamily="$body">
                  {person.name}
                </Text>
                <Button
                  backgroundColor="transparent"
                  onPress={() => handleDelete(person.id)}
                  padding="$1"
                  pressStyle={{ opacity: 0.7 }}
                  icon={<Ionicons name="close" size={18} color={"rgba(255, 0, 0, 0.93)"} />}
                />
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
