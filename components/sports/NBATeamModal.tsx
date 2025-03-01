import React, { useState, useEffect } from 'react'
import { Image, Platform, useColorScheme, useWindowDimensions } from 'react-native'
import { Sheet, Button, YStack, XStack, Text, ScrollView } from 'tamagui'
import { nbaTeams } from '@/constants/nba'
import { useNBAStore } from '@/store/NBAStore'
import { useUserStore } from '@/store/UserStore'

interface NBATeamModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NBATeamModal({ open, onOpenChange }: NBATeamModalProps) {
  const { teamCode, setTeamInfo } = useNBAStore()
  const { preferences, setPreferences } = useUserStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'
  
  // State to track the selected team (initially set to current team)
  const [selectedTeam, setSelectedTeam] = useState(teamCode)
  
  // Get window dimensions for responsive layout
  const { width } = useWindowDimensions()
  
  // Calculate grid columns based on screen width
  const getGridColumns = () => {
    if (!isWeb) return 4
    if (width > 1200) return 8
    if (width > 900) return 6
    if (width > 600) return 5
    return 4
  }
  
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
    
    // Close the modal
    onOpenChange(false)
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      dismissOnSnapToBottom
      snapPoints={[70]}
      zIndex={100000}
      animation="quick"
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.5)"
        opacity={0.8}
      />
      <Sheet.Frame
        backgroundColor={isDark ? '#1c1c1c' : '#ffffff'}
        padding="$4"
        gap="$3"
        {...(isWeb
          ? {
              style: {
                overflowY: 'auto',
                maxHeight: '70vh',
                maxWidth: 600,
                margin: '0 auto',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              },
            }
          : {})}
      >
        <Sheet.Handle
          backgroundColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
        />
        <XStack width="100%" justifyContent="flex-end" position="absolute" top="$3" right="$3" zIndex={1000}>
          <Text
            fontSize={16}
            fontWeight="bold"
            color={isDark ? '#fff' : '#000'}
            fontFamily="$body"
            opacity={0.7}
            pressStyle={{ opacity: 0.5 }}
            onPress={() => onOpenChange(false)}
          >
            ✕
          </Text>
        </XStack>
        <YStack gap="$3" paddingBottom="$3">
          <Text fontSize={20} fontWeight="600" color={isDark ? '#fff' : '#000'} fontFamily="$body">
            Change Favorite NBA Team
          </Text>
          
          <ScrollView 
            style={{ width: '100%' }}
            contentContainerStyle={{ 
              paddingBottom: isWeb ? 80 : 100,
              alignItems: 'center'
            }}
            showsVerticalScrollIndicator={!isWeb}
          >
            <XStack 
              flexWrap="wrap" 
              justifyContent="center" 
              gap="$2" 
              marginBottom="$1"
              width="100%"
            >
              {nbaTeams.map(team => (
                <Button
                  key={team.code}
                  size="$3"
                  backgroundColor={selectedTeam === team.code ? preferences.primaryColor : 'rgba(255, 255, 255, 0.1)'}
                  borderColor={selectedTeam === team.code ? preferences.primaryColor : 'rgba(255, 255, 255, 0.2)'}
                  borderWidth={2}
                  marginVertical="$2"
                  width={isWeb ? `${Math.floor(100 / columns) - 2}%` : 80}
                  height={isWeb ? 80 : 80}
                  pressStyle={{
                    scale: 0.97,
                    opacity: 0.8
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
                        width: isWeb ? 50 : 40, 
                        height: isWeb ? 50 : 40
                      }}
                      resizeMode="contain"
                    />
                  </YStack>
                </Button>
              ))}
            </XStack>
          </ScrollView>
          
          {/* Save Button - Fixed at bottom */}
          <XStack 
            position="absolute" 
            bottom={52} 
            left={0} 
            right={0} 
            backgroundColor={isDark ? '#1c1c1c' : '#ffffff'}
            borderTopWidth={1}
            borderTopColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            padding="$4"
            justifyContent="center"
          >
            <Button
              backgroundColor={preferences.primaryColor}
              height={48}
              width={isWeb ? 200 : "70%"}
              paddingHorizontal={20}
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              onPress={handleSave}
              borderRadius={24}
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
      </Sheet.Frame>
    </Sheet>
  )
}
