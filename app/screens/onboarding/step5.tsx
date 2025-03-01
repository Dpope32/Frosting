import React, { useState, useEffect } from 'react'
import { YStack, Text, Button, XStack, ScrollView, Label } from 'tamagui'
import { Image, Platform, View, useColorScheme, useWindowDimensions } from 'react-native'
import { FormData } from '@/types'
import { nbaTeams } from '@/constants/nba'

export default function Step5({
  formData,
  setFormData,
  handleNext,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  handleNext: () => void
}) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'
  const { width } = useWindowDimensions()
  
  // State to track if the grid view is expanded (showing all teams)
  const [showAllTeams, setShowAllTeams] = useState(isWeb)
  
  // Get the selected team
  const selectedTeam = formData.favoriteNBATeam || ''
  
  // Function to handle team selection
  const handleTeamSelect = (teamCode: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteNBATeam: teamCode
    }))
  }
  
  // Function to skip team selection
  const handleSkip = () => {
    // Default to OKC Thunder if skipped
    setFormData(prev => ({
      ...prev,
      favoriteNBATeam: 'OKC'
    }))
    handleNext()
  }
  
  // Get popular teams for the initial view
  const popularTeams = ['LAL', 'GSW', 'BOS', 'MIA', 'CHI', 'OKC', 'NYK', 'DAL']
  const initialTeams = nbaTeams.filter(team => popularTeams.includes(team.code))
  const teamsToDisplay = showAllTeams ? nbaTeams : initialTeams
  
  // Force showAllTeams to true on web
  useEffect(() => {
    if (isWeb) {
      setShowAllTeams(true)
    }
  }, [isWeb])
  
  // Calculate grid columns based on screen width
  const getGridColumns = () => {
    if (!isWeb) return 3
    if (width > 1200) return 6
    if (width > 900) return 5
    if (width > 600) return 4
    return 3
  }
  
  const columns = getGridColumns()
  
  return (
    <YStack flex={1} justifyContent="flex-start" alignItems="center" padding="$4">
      <YStack alignItems="center" gap="$1" marginBottom="$0">
        <Label
          size="$5"
          textAlign="center"
          color="$gray12Dark"
        >
          Follow your favorite NBA team
        </Label>
      </YStack>

      <ScrollView 
        style={{ width: '100%', maxWidth: isWeb ? '90%' : 600 }}
        contentContainerStyle={{ 
          paddingBottom: isWeb ? 60 : 100,
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
          {teamsToDisplay.map(team => (
            <Button
              key={team.code}
              size="$4"
              backgroundColor={selectedTeam === team.code ? formData.primaryColor : 'rgba(255, 255, 255, 0.1)'}
              borderColor={selectedTeam === team.code ? formData.primaryColor : 'rgba(255, 255, 255, 0.2)'}
              borderWidth={2}
              marginVertical="$2"
              width={isWeb ? `${Math.floor(100 / columns) - 2}%` : 105}
              height={isWeb ? 130 : 105}
              pressStyle={{
                scale: 0.97,
                opacity: 0.8
              }}
              onPress={() => handleTeamSelect(team.code)}
              flexDirection="column"
              justifyContent="space-between"
              alignItems="center"
              padding="$2"
            >
              <YStack flex={1} justifyContent="center" alignItems="center" paddingTop={isWeb ? 10 : 5}>
                <Image
                  source={{ uri: team.logo }}
                  style={{ 
                    width: isWeb ? 60 : 40, 
                    height: isWeb ? 60 : 40
                  }}
                  resizeMode="contain"
                />
              </YStack>
              <Text
                color={selectedTeam === team.code ? 'white' : '$gray11Dark'}
                textAlign="center"
                fontSize={isWeb ? 14 : 12}
                numberOfLines={2}
                width="100%"
                paddingTop={isWeb ? 5 : 2}
                paddingBottom={isWeb ? 5 : 2}
              >
                {team.name}
              </Text>
            </Button>
          ))}
        </XStack>
        
        {!isWeb && !showAllTeams && (
          <Button
            marginTop="$2"
            marginBottom="$6"
            size="$3"
            variant="outlined"
            backgroundColor="rgba(255, 255, 255, 0.1)"
            borderColor="rgba(255, 255, 255, 0.2)"
            onPress={() => setShowAllTeams(true)}
          >
            <Text color="$gray11Dark">Show All Teams</Text>
          </Button>
        )}
        
        <Button
          chromeless
          onPress={handleSkip}
          color="$blue10Dark"
          marginTop="$2"
          marginBottom={isWeb ? "$6" : "$2"}
        >
          or skip for now
        </Button>
      </ScrollView>
    </YStack>
  )
}