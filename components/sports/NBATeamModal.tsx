import React, { useState, useEffect } from 'react'
import { Image, useColorScheme, useWindowDimensions } from 'react-native'
import { Button, YStack, XStack, Text, ScrollView, isWeb } from 'tamagui'; 
import { nbaTeams } from '@/constants/nba';
import { useNBAStore } from '@/store/NBAStore';
import { useUserStore } from '@/store/UserStore';
import { BaseCardModal } from '../baseModals/BaseCardModal'; 

interface NBATeamModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NBATeamModal({ open, onOpenChange }: NBATeamModalProps) {
  const { teamCode, setTeamInfo } = useNBAStore()
  const { preferences, setPreferences } = useUserStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [selectedTeam, setSelectedTeam] = useState(teamCode)
  const { width } = useWindowDimensions()
  
  const getGridColumns = () => {
    if (width > 1200) return 6; 
    if (width > 900) return 5;
    if (width > 600) return 4;
    return 3; 
  };
  
  const columns = getGridColumns()
  
  useEffect(() => {
    if (open) {
      setSelectedTeam(teamCode)
    }
  }, [open, teamCode])
  
  const handleTeamSelect = (teamCode: string) => {setSelectedTeam(teamCode)}
  
  const handleSave = () => {
    if (selectedTeam !== teamCode) {
      const team = nbaTeams.find(t => t.code === selectedTeam)
      if (team) {
        setTeamInfo(selectedTeam, team.name)
        setPreferences({
          ...preferences,
          favoriteNBATeam: selectedTeam
        })
      }
    }
    onOpenChange(false)
  }

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Change Favorite NBA Team"
      snapPoints={isWeb ? [95] : [80]} 
      showCloseButton={true} 
      hideHandle={true}
    >
      <YStack flex={1} gap="$3" paddingBottom="$4">
        <ScrollView
          style={{ flex: 1 }} 
          contentContainerStyle={{
            paddingBottom: 60, 
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          <XStack
            flexWrap="wrap"
            justifyContent="center"
            gap="$2"
            width="100%"
          >
            {nbaTeams.map(team => (
              <Button
                key={team.code}
                size="$3"
                backgroundColor={selectedTeam === team.code ? preferences.primaryColor : (isDark ? 'rgba(255, 255, 255, 0.1)' : '$gray3')}
                borderColor={selectedTeam === team.code ? preferences.primaryColor : (isDark ? 'rgba(255, 255, 255, 0.2)' : '$gray5')}
                borderWidth={2}
                marginVertical="$0"
                width={isWeb ? `${Math.floor(100 / columns) - 2}%` : '22%'}
                aspectRatio={1} 
                pressStyle={{
                  scale: 0.97,
                  opacity: 0.8,
                }}
                onPress={() => handleTeamSelect(team.code)}
                justifyContent="center"
                alignItems="center"
                padding="$2"
              >
                <YStack flex={1} justifyContent="center" alignItems="center">
                  <Image
                    source={{ uri: team.logo }}
                    style={{
                      width: isWeb ? '70%' : '60%',
                      height: isWeb ? '70%' : '60%',
                    }}
                    resizeMode="contain"
                  />
                </YStack>
              </Button>
            ))}
          </XStack>
        </ScrollView>

        <XStack
          paddingTop="$3" 
          justifyContent="center"
          borderTopWidth={1}
          borderColor={isDark ? '$gray4' : '$gray6'}
        >
          <Button
            backgroundColor={preferences.primaryColor}
            height={48}
            width={isWeb ? 200 : '70%'}
            paddingHorizontal={20}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            onPress={handleSave}
            br={24}
            shadowColor="black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={3}
          >
            <Text color="#fff" fontWeight="600" fontSize={16} fontFamily="$body">
              Save
            </Text>
          </Button>
        </XStack>
      </YStack>
    </BaseCardModal>
  );
}
