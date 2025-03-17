import React, { useState, useEffect } from 'react'
import { YStack, isWeb, Text, Button, XStack, ScrollView, Label, Switch } from 'tamagui'
import { Image, useWindowDimensions } from 'react-native'
import { FormData } from '@/types'
import { nbaTeams } from '@/constants/nba'

export default function Step5({
  formData,
  setFormData,
  handleNext,
  isDark = true,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  handleNext: () => void
  isDark?: boolean
}) {
  const { width } = useWindowDimensions()
  const [showAllTeams, setShowAllTeams] = useState(isWeb)
  const selectedTeam = formData.favoriteNBATeam || ''
  const [showNBAGamesInCalendar, setShowNBAGamesInCalendar] = useState(true)

  const handleTeamSelect = (teamCode: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteNBATeam: teamCode,
      showNBAGamesInCalendar: showNBAGamesInCalendar
    }))
  }
  
  const handleToggleNBAGames = (value: boolean) => {
    setShowNBAGamesInCalendar(value)
    if (selectedTeam) {
      setFormData(prev => ({
        ...prev,
        showNBAGamesInCalendar: value
      }))
    }
  }
  
  const handleSkip = () => {
    setFormData(prev => ({
      ...prev,
      favoriteNBATeam: 'OKC',
      showNBAGamesInCalendar: showNBAGamesInCalendar
    }))
    handleNext()
  }
  
  const popularTeams = ['LAL', 'GSW', 'BOS', 'CHI', 'OKC','NYK', 'DAL', 'CLE','DEN']
  const initialTeams = nbaTeams.filter(team => popularTeams.includes(team.code))
  const teamsToDisplay = showAllTeams ? nbaTeams : initialTeams
  
  useEffect(() => { if (isWeb) { setShowAllTeams(true)}}, [isWeb])
  
  const getGridColumns = () => {
    if (!isWeb) return 3
    if (width > 1200) return 6
    if (width > 900) return 5
    if (width > 600) return 4
    return 3
  }
  const columns = getGridColumns()
  const labelColor = isDark ? "$gray12Dark" : "$gray12Light";
  const buttonBackgroundColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const buttonBorderColor = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
  const buttonTextColor = isDark ? "$gray11Dark" : "$gray11Light";
  const showAllTeamsButtonBackground = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const preferencesBackgroundColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";
  const buttonColor = isDark ? "$blue10Dark" : "$blue10Light";
  
  return (
    <YStack flex={1} justifyContent="flex-start" alignItems="center" padding="$4" paddingTop={isWeb ? 20 : 80}>
      <YStack alignItems="center" gap="$1" marginBottom="$2">
        <Label
          fontFamily="$heading"
          fontSize={isWeb ? "$9" : "$8"}
           fontWeight="800"
          textAlign="center"
          color={labelColor}
          paddingBottom={isWeb ? 20 : 0} 
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
              backgroundColor={selectedTeam === team.code ? formData.primaryColor : buttonBackgroundColor}
              borderColor={selectedTeam === team.code ? formData.primaryColor : buttonBorderColor}
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
                fontFamily="$body"
                color={selectedTeam === team.code ? (isDark ? 'white' : 'black') : buttonTextColor}
                textAlign="center"
                fontSize={isWeb ? 14 : 12}
                numberOfLines={2}
                width="100%"
                paddingTop={isWeb ? 5 : 0}
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
            backgroundColor={showAllTeamsButtonBackground}
            borderColor={buttonBorderColor}
            onPress={() => setShowAllTeams(true)}
          >
            <Text fontFamily="$body" color={buttonTextColor}>Show All Teams</Text>
          </Button>
        )}
        
        {selectedTeam && (
          <YStack 
            width="100%" 
            maxWidth={400} 
            marginTop="$0" 
            marginBottom="$2"
            backgroundColor={preferencesBackgroundColor}
            borderRadius={8}
            padding="$3"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <YStack>
                <Text 
                  fontFamily="$body" 
                  color={labelColor} 
                  fontSize={14} 
                  fontWeight="500"
                >
                  Show games in calendar
                </Text>
                <Text 
                  fontFamily="$body" 
                  color={buttonTextColor} 
                  fontSize={14}
                  marginTop="$1"
                >
                  Display team logo on game days
                </Text>
              </YStack>
              <XStack alignItems="center" gap="$2">
                <Text 
                  fontFamily="$body" 
                  color={showNBAGamesInCalendar ? "#fff" : buttonTextColor}
                  fontWeight="bold"
                >
                  {showNBAGamesInCalendar ? 'ON' : 'OFF'}
                </Text>
                <Switch
                  checked={showNBAGamesInCalendar}
                  onCheckedChange={handleToggleNBAGames}
                  size="$3"
                  backgroundColor={showNBAGamesInCalendar ? formData.primaryColor : buttonBackgroundColor}
                  borderColor={showNBAGamesInCalendar ? formData.primaryColor : buttonBorderColor}
                >
                  <Switch.Thumb  backgroundColor={showNBAGamesInCalendar ? 'white' : isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'} animation="quick"/>
                </Switch>
              </XStack>
            </XStack>
          </YStack>
        )}
        
        <Button
          chromeless
          onPress={handleSkip}
          color={buttonColor}
          marginTop="$2"
          marginBottom={isWeb ? "$6" : "$2"}
        >
          or skip for now
        </Button>
      </ScrollView>
    </YStack>
  )
}