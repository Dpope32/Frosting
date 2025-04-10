import React, { useState, useEffect } from 'react'
import { Image, Platform, useColorScheme, useWindowDimensions } from 'react-native'
import { Button, YStack, XStack, Text, ScrollView, Switch } from 'tamagui'; // Added Switch
import { nbaTeams } from '@/constants/nba';
import { useNBAStore } from '@/store/NBAStore';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore'; // Import ToastStore
import { BaseCardModal } from '../cardModals/BaseCardModal';

interface NBATeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NBATeamModal({ open, onOpenChange }: NBATeamModalProps) {
  const { teamCode, setTeamInfo } = useNBAStore();
  const { preferences, setPreferences } = useUserStore();
  const showToast = useToastStore((s) => s.showToast); // Get toast function
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'
  
  // State to track the selected team (initially set to current team)
  const [selectedTeam, setSelectedTeam] = useState(teamCode)
  
  // Get window dimensions for responsive layout
  const { width } = useWindowDimensions()
  
  // Calculate grid columns based on screen width - adjusted for mobile
  const getGridColumns = () => {
    if (!isWeb) return 6; // Changed mobile grid to 6 columns
    if (width > 1200) return 6;
    if (width > 900) return 5;
    if (width > 600) return 4;
    return 3; // Default web columns
  };
  
  const columns = getGridColumns()
  
  // Reset selected team when modal opens
  useEffect(() => {
    if (open) {
      setSelectedTeam(teamCode)
    }
  }, [open, teamCode])
  
  // Handle team selection
  const handleTeamSelect = (teamCode: string) => {
    setSelectedTeam(teamCode)
  }
  
  // Save the selected team
  const handleSave = () => {
    // Only update if the team has changed
    if (selectedTeam !== teamCode) {
      // Find the team name
      const team = nbaTeams.find(t => t.code === selectedTeam)
      if (team) {
        // Update NBAStore
        setTeamInfo(selectedTeam, team.name)
        
        // Update UserStore preferences
        setPreferences({
          ...preferences,
          favoriteNBATeam: selectedTeam
        })
      }
    }
    onOpenChange(false);
    setTimeout(() => {
      showToast('Preferences saved successfully!', 'success');
    }, 300); 
  };

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Change Favorite NBA Team"
      snapPoints={isWeb ? [95] : [70]} 
      showCloseButton={true} 
      hideHandle={true}
    >
      <YStack flex={1} gap="$3" paddingBottom="$4" paddingHorizontal="$2">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: 20, 
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          <XStack
            flexWrap="wrap"
            justifyContent="center"
            gap={isWeb ? "$2" : "$2"} 
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
                width={isWeb ? `${Math.floor(100 / columns) - 2}%` : `${Math.floor(100 / columns) - 2}%`}
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
                      width: isWeb ? '70%' : '90%',
                      height: isWeb ? '70%' : '90%',
                    }}
                    resizeMode="contain"
                  />
                </YStack>
              </Button>
            ))}
          </XStack>
        </ScrollView>
        <YStack gap="$3" paddingHorizontal="$4" paddingTop="$3" borderTopWidth={1} borderColor={isDark ? '$gray4' : '$gray6'}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text color="$color11" fontSize={14} fontFamily="$body" fontWeight="500">Show games in calendar?</Text>
            <Switch
              checked={preferences.showNBAGamesInCalendar}
              onCheckedChange={(checked) => setPreferences({ showNBAGamesInCalendar: checked })}
              backgroundColor={preferences.showNBAGamesInCalendar ? preferences.primaryColor : "$background"}
              borderColor={isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}
              size="$3"
            >
              <Switch.Thumb animation="bouncy" backgroundColor="$backgroundStrong" />
            </Switch>
          </XStack>
          <XStack justifyContent="space-between" py="$2" alignItems="center">
            <Text color="$color11" fontSize={14} fontFamily="$body" fontWeight="500">Show game days on Home Screen?</Text>
            <Switch
              checked={preferences.showNBAGameTasks}
              onCheckedChange={(checked) => setPreferences({ showNBAGameTasks: checked })}
              backgroundColor={preferences.showNBAGameTasks ? preferences.primaryColor : "$background"}
              borderColor={isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}
              size={isWeb ? "$3" : "$3"}
            >
              <Switch.Thumb animation="bouncy" backgroundColor="$backgroundStrong" />
            </Switch>
          </XStack>
        </YStack>

        <XStack
          paddingTop="$3"
          justifyContent={isWeb ? "center" : "flex-end"}
          borderTopWidth={1}
          borderColor={isDark ? '$gray4' : '$gray6'}
        >
          <Button
            backgroundColor='transparent'
            borderColor={preferences.primaryColor}
            borderWidth={2}
            height={45}
            width={isWeb ? 200 : '50%'}
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
            <Text color={preferences.primaryColor} fontWeight="600" fontSize={17} fontFamily="$body">
              Save
            </Text>
          </Button>
        </XStack>
      </YStack>
    </BaseCardModal>
  );
}
