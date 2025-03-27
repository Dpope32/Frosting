import React, { useState, useEffect } from 'react'
import { YStack, isWeb, Text, Button, XStack, ScrollView, Label, Switch, Circle } from 'tamagui'
import { Image, useWindowDimensions, View } from 'react-native'
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
  
  // Style variables
  const labelColor = isDark ? "$gray12Dark" : "$gray12Light";
  const subTextColor = isDark ? "$gray9Dark" : "$gray9Light";
  const buttonBackgroundColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";
  const buttonBorderColor = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)";
  const buttonTextColor = isDark ? "$gray11Dark" : "$gray11Light";
  const showAllTeamsButtonBackground = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";
  const preferencesBackgroundColor = isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.3)";
  const buttonColor = formData.primaryColor || (isDark ? "$blue10Dark" : "$blue10Light");
  
  return (
    <YStack flex={1} justifyContent="flex-start" alignItems="center" padding="$4" paddingTop={isWeb ? 0 : 40}>
      <YStack 
        position="absolute" 
        top={isWeb ? "5%" : "15%"} 
        left={0} 
        right={0} 
        alignItems="center"
        py={isWeb ? "$4" : "$0"}
        my={isWeb ? "$2" : 0}
      >
        <Label 
          paddingBottom={20} 
          fontFamily="$heading" 
          fontWeight="500" 
          fontSize={isWeb ? "$9" : "$7"} 
          textAlign="center" 
          color={labelColor}
        >
          Follow your favorite NBA team
        </Label>
      </YStack>

      <ScrollView 
        style={{ 
          width: '100%', 
          maxWidth: isWeb ? 1200 : 600,
          marginTop: isWeb ? 140 : 160
        }}
        contentContainerStyle={{ 
          paddingBottom: isWeb ? 80 : 120,
          alignItems: 'center'
        }}
        showsVerticalScrollIndicator={!isWeb}
      >
        <XStack 
          flexWrap="wrap" 
          justifyContent="center" 
          gap="$2.5" 
          marginBottom="$4"
          width="100%"
          px="$2"
        >
          {teamsToDisplay.map(team => (
            <Button
              key={team.code}
              backgroundColor={selectedTeam === team.code ? buttonColor : buttonBackgroundColor}
              borderColor={selectedTeam === team.code ? buttonColor : buttonBorderColor}
              borderWidth={2}
              br={16}
              marginVertical="$2"
              width={isWeb ? `${Math.floor(100 / columns) -2}%` : 105}
              height={isWeb ? 130 : 105}
              hoverStyle={{
                backgroundColor: selectedTeam === team.code 
                  ? buttonColor 
                  : isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                scale: 1.02
              }}
              pressStyle={{
                scale: 0.97,
                opacity: 0.9
              }}
              onPress={() => handleTeamSelect(team.code)}
              flexDirection="column"
              justifyContent="space-between"
              alignItems="center"
              padding="$2"
              shadowColor={selectedTeam === team.code ? buttonColor : "transparent"}
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={selectedTeam === team.code ? 0.3 : 0}
              shadowRadius={4}
              style={{
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)'
              }}
            >
              <YStack flex={1} justifyContent="center" alignItems="center" paddingTop={isWeb ? 10 : 5}>
                <Image
                  source={{ uri: team.logo }}
                  style={{ 
                    width: isWeb ? 60 : 40, 
                    height: isWeb ? 60 : 40,
                    opacity: selectedTeam === team.code ? 1 : 0.85
                  }}
                  resizeMode="contain"
                />
              </YStack>
              <Text
                fontFamily="$body"
                color={selectedTeam === team.code ? (isDark ? 'white' : 'black') : buttonTextColor}
                textAlign="center"
                fontSize={isWeb ? 14 : 12}
                fontWeight={selectedTeam === team.code ? "600" : "400"}
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
            mt="$2"
            marginBottom="$6"
            size="$3"
            backgroundColor={showAllTeamsButtonBackground}
            borderColor={buttonBorderColor}
            borderWidth={1}
            br={20}
            px="$4"
            hoverStyle={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
            }}
            pressStyle={{
              scale: 0.97
            }}
            onPress={() => setShowAllTeams(true)}
          >
            <Text fontFamily="$body" color={buttonTextColor}>Show All Teams</Text>
          </Button>
        )}
        
        {selectedTeam && (
          <YStack 
            width="100%" 
            maxWidth={450} 
            mt="$2" 
            marginBottom="$4"
            backgroundColor={preferencesBackgroundColor}
            br={16}
            padding="$4"
            borderWidth={2}
            borderColor={buttonColor}
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <YStack>
                <Text 
                  fontFamily="$heading" 
                  color={labelColor} 
                  fontSize={16} 
                  fontWeight="600"
                >
                  Show games in calendar
                </Text>
                <Text 
                  fontFamily="$body" 
                  color={buttonTextColor} 
                  fontSize={14}
                  mt="$1"
                  opacity={0.9}
                >
                  Display team logo on game days
                </Text>
              </YStack>
              <XStack alignItems="center" gap="$2">
                <Text 
                  fontFamily="$body" 
                  color={showNBAGamesInCalendar ? buttonColor : buttonTextColor}
                  fontWeight="bold"
                  fontSize={14}
                >
                  {showNBAGamesInCalendar ? 'ON' : 'OFF'}
                </Text>
                <Switch
                  checked={showNBAGamesInCalendar}
                  onCheckedChange={handleToggleNBAGames}
                  size="$3"
                  backgroundColor={showNBAGamesInCalendar ? buttonColor : buttonBackgroundColor}
                  borderColor={showNBAGamesInCalendar ? buttonColor : buttonBorderColor}
                >
                  <Switch.Thumb backgroundColor={showNBAGamesInCalendar ? 'white' : isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'} animation="quick"/>
                </Switch>
              </XStack>
            </XStack>
          </YStack>
        )}
        
        <Button
          chromeless
          onPress={handleSkip}
          py="$2"
          px="$4"
          mt="$-2"
          color={buttonColor}
          hoverStyle={{
            opacity: 0.8
          }}
          pressStyle={{
            scale: 0.97
          }}
        >
          <Text fontFamily="$body" fontSize={15}>or skip for now</Text>
        </Button>
      </ScrollView>
    </YStack>
  )
}