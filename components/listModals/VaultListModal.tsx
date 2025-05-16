import React, { useState } from 'react';
import { YStack, XStack, Text, isWeb } from 'tamagui'; 
import { Pressable, Platform, useColorScheme, Alert } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons';
import { LongPressDelete } from '@/components/common/LongPressDelete';
import { useVault } from '@/hooks/useVault';
import { VaultRecommendationCategory } from '@/constants';
import { VaultRecommendationModal } from '@/components/recModals/VaultRecommendationModal';
import { useToastStore } from '@/store';
import { BaseCardWithRecommendationsModal } from '../recModals/BaseCardWithRecommendationsModal'; 
import { getChipStyle, isIpad } from '@/utils';

interface VaultListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface VaultEntry {
  id: string
  name: string
  username: string
  password: string
}

export function VaultListModal({ open, onOpenChange, onEditVault }: VaultListModalProps & { onEditVault: (entry: VaultEntry) => void }) {
  const { data, deleteVaultEntry, addVaultEntry } = useVault()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark';
  const [socialMediaModalOpen, setSocialMediaModalOpen] = useState(false);
  const [emailCloudModalOpen, setEmailCloudModalOpen] = useState(false);
  const [shoppingModalOpen, setShoppingModalOpen] = useState(false);
  const [workModalOpen, setWorkModalOpen] = useState(false);

  const categories: VaultRecommendationCategory[] = ['Social Media', 'Misc', 'Shopping', 'Work'];

  const getCategoryWidth = (category: VaultRecommendationCategory): number => {
    switch (category) {
      case 'Social Media': return 120
      case 'Misc': return 80
      case 'Shopping': return 110
      case 'Work': return 90
      default: return 120;
    }
  };


  const ModifiedChip = ({ category }: { category: VaultRecommendationCategory }) => {
    const style = getChipStyle(category);
    const handlePress = () => {
      onOpenChange(false); 
      switch (category) {
        case 'Social Media': setSocialMediaModalOpen(true); break;
        case 'Misc': setEmailCloudModalOpen(true); break;
        case 'Shopping': setShoppingModalOpen(true); break;
        case 'Work': setWorkModalOpen(true); break;
      }
    };
    return (
      <XStack
        width={getCategoryWidth(category)}
        backgroundColor={style.backgroundColor}
        borderColor={style.borderColor}
        borderWidth={1}
        br={8}
        px="$4"
        py="$3"
        pressStyle={{ opacity: 0.7 }}
        marginRight="$2"
        justifyContent="center"
        alignItems="center"
        onPress={handlePress}
      >
        <Text color={style.textColor} fontSize={13} fontWeight="600" fontFamily="$body" numberOfLines={1} textAlign="center">
          {category}
        </Text>
      </XStack>
    );
  };

  const { showToast } = useToastStore();
  const handleDelete = (id: string) => {
    return (onComplete: (deleted: boolean) => void) => {
      if (Platform.OS === 'web') {
        if (confirm('Are you sure you want to delete this password entry?')) {
          deleteVaultEntry(id);
          onOpenChange(false); 
          setTimeout(() => {
            showToast('Vault Entry Successfully removed', 'success');
          }, 300);
          onComplete(true);
        } else {
          onComplete(false);
        }
      } else {
        Alert.alert(
          'Confirm Deletion',
          'Are you sure you want to delete this password entry?',
          [
            { 
              text: 'Cancel', 
              style: 'cancel',
              onPress: () => onComplete(false)
            },
            {
              text: 'Yes',
              style: 'destructive',
              onPress: () => {
                deleteVaultEntry(id);
                onOpenChange(false); 
                setTimeout(() => {
                  showToast('Vault Entry Successfully removed', 'success');
                }, 300);
                onComplete(true);
              },
            },
          ]
        );
      }
    };
  };

  const vaultRecommendations = (
    <>
      {categories.map((category) => (
        <ModifiedChip key={category} category={category} />
      ))}
    </>
  );

  return (
    <>
      <BaseCardWithRecommendationsModal
        open={open}
        onOpenChange={onOpenChange} 
        title="Vault Entries"
        snapPoints={isWeb ? [90] : [85]}
        zIndex={100000}
        showCloseButton={true} 
        hideHandle={true}
        recommendationChips={vaultRecommendations} 
      >
        <>
            {data?.items && data.items.length > 0 ? (
              <YStack gap="$1" mt="$2"> 
                <XStack flexWrap="wrap" justifyContent="space-between" gap={isIpad() ? "$2" : "$1"}>
                  {data.items.map((entry: VaultEntry) => (
                    <LongPressDelete key={entry.id} onDelete={handleDelete(entry.id)}>
                      <YStack
                        width="100%"
                        backgroundColor={isDark ? '$gray3' : '$gray3'}
                        br={8}
                        padding="$3"
                        mt="$1"
                        mb="$2"
                      >
                        <XStack
                          justifyContent="space-between"
                          alignItems="center"
                          marginTop="$-2"
                          paddingLeft="$2"
                          width="100%"
                        >
                          <Text
                            fontFamily="$body"
                            color={isDark ? '$gray12' : '$gray11'}
                            fontSize={16}
                            fontWeight="600"
                          >
                            {entry.name}
                          </Text>
                          <Pressable
                            onPress={() => {
                              onOpenChange(false);
                              setTimeout(() => {
                                onEditVault(entry);
                              }, 100);
                            }}
                            style={({ pressed }) => ({
                              opacity: pressed ? 0.7 : 1,
                              padding: 6
                            })}
                          >
                            <Ionicons
                              name="pencil"
                              size={18}
                              color="#888"
                              style={{ fontWeight: 200 }}
                            />
                          </Pressable>
                        </XStack>
                        <Text
                          fontFamily="$body"
                          color={isDark ? '$gray11' : '$gray10'}
                          fontSize={13}
                          paddingLeft="$2"
                        >
                          {entry.username}
                        </Text>
                      </YStack>
                    </LongPressDelete>
                  ))}
                </XStack>
              </YStack>
            ) : (
              <YStack
                backgroundColor={isDark ? '$gray2' : '$gray3'}
                br={8}
                padding="$4"
                alignItems="center"
                mt="$4"
              >
                <Text
                  fontFamily="$body"
                  color={isDark ? '$gray12' : '$gray11'}
                  opacity={0.7}
                >
                  No vault entries found
                </Text>
              </YStack>
            )}
        </>
      </BaseCardWithRecommendationsModal>
      <VaultRecommendationModal
        open={socialMediaModalOpen}
        onOpenChange={setSocialMediaModalOpen}
        category="Social Media"
      />
      <VaultRecommendationModal
        open={emailCloudModalOpen}
        onOpenChange={setEmailCloudModalOpen}
        category="Misc"
      />
      <VaultRecommendationModal
        open={shoppingModalOpen}
        onOpenChange={setShoppingModalOpen}
        category="Shopping"
      />
      <VaultRecommendationModal
        open={workModalOpen}
        onOpenChange={setWorkModalOpen}
        category="Work"
      />
    </>
  )
}
