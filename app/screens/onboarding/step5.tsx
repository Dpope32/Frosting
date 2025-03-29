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
  
  const popularTeams = ['LAL', 'GSW', 'BOS', 'CHI', 'OKC', 'NYK', 'CLE', 'DEN']
  const initialTeams = nbaTeams.filter(team => popularTeams.includes(team.code))
  const teamsToDisplay = showAllTeams ? nbaTeams : initialTeams
  
  useEffect(() => { if (isWeb) { setShowAllTeams(true)}}, [isWeb])
  
  const getGridColumns = () => {
    if (!isWeb) return 2 // Use 2 columns for mobile instead of 3
    if (width > 1200) return 6
    if (width > 900) return 5
    if (width > 600) return 4
    return 3
  }
  const columns = getGridColumns()
  
  // Style variables
  const labelColor = isDark ? "$gray12Dark" : "$gray12Light";
  const buttonBackgroundColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";
  const buttonBorderColor = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)";
  const buttonTextColor = isDark ? "$gray11Dark" : "$gray11Light";
  const showAllTeamsButtonBackground = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";
  const preferencesBackgroundColor = isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.3)";
  const buttonColor = formData.primaryColor || (isDark ? "$blue10Dark" : "$blue10Light");
  
  // Mobile styles from the second file
  const mobileButtonWidth = 140; // Wider buttons for mobile
  const mobileButtonHeight = 105;
  const mobileScrollMaxWidth = 600;
  const mobileTopPadding = 20; // Less top padding for mobile
  
  return (
    <YStack 
      flex={1} 
      justifyContent="flex-start" 
      alignItems="center" 
      padding="$4" 
      paddingTop={isWeb ? 0 : mobileTopPadding}
    >
      <YStack 
        position="absolute" 
        top={isWeb ? "2%" : "8%"} 
        left={0} 
        right={0} 
        alignItems="center"
        py={isWeb ? "$4" : "$0"}
        my={isWeb ? "$2" : 0}
      >
        <Label 
          paddingBottom={isWeb ? 20 : 0}
          fontFamily="$heading" 
          fontWeight={isWeb ? "500" : "800"} 
          fontSize={isWeb ? "$9" : "$8"} 
          textAlign="center" 
          color={labelColor}
        >
          Follow your favorite NBA team
        </Label>
      </YStack>

      <ScrollView 
        style={{ 
          width: '100%', 
          maxWidth: isWeb ? 1200 : mobileScrollMaxWidth,
          marginTop: isWeb ? 90 : 80 
        }}
        contentContainerStyle={{ 
          paddingBottom: isWeb ? 80 : 100,
          alignItems: 'center'
        }}
        showsVerticalScrollIndicator={!isWeb}
      >
        <XStack 
          flexWrap="wrap" 
          justifyContent="center" 
          gap={isWeb ? "$2.5" : "$2"} 
          marginBottom={isWeb ? "$2" : "$1"}
          width="100%"
          px={isWeb ? "$2" : "$0"}
        >
          {teamsToDisplay.map(team => (
            <Button
              key={team.code}
              backgroundColor={selectedTeam === team.code ? buttonColor : buttonBackgroundColor}
              borderColor={selectedTeam === team.code ? buttonColor : buttonBorderColor}
              borderWidth={2}
              br={isWeb ? 16 : 8} 
              marginVertical="$2"
              width={isWeb ? `${Math.floor(100 / columns) -2}%` : mobileButtonWidth}
              height={isWeb ? 110 : mobileButtonHeight}
              hoverStyle={{
                backgroundColor: selectedTeam === team.code 
                  ? buttonColor 
                  : isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                scale: 1.02
              }}
              pressStyle={{
                scale: 0.97,
                opacity: isWeb ? 0.9 : 0.8
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
              style={isWeb ? {
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)'
              } : undefined}
            >
              <YStack flex={1} justifyContent="center" alignItems="center" paddingTop={isWeb ? 10 : 5}>
                <Image
                  source={{ uri: team.logo }}
                  style={{ 
                    width: isWeb ? 55 : 40, 
                    height: isWeb ? 55 : 40,
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
            variant="outlined" 
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
            maxWidth={isWeb ? 450 : 400} 
            mt={isWeb ? "$2" : "$0"} 
            marginBottom={isWeb ? "$4" : "$2"}
            backgroundColor={preferencesBackgroundColor}
            br={isWeb ? 16 : 8}
            padding={isWeb ? "$4" : "$3"}
            borderWidth={isWeb ? 2 : 0}
            borderColor={isWeb ? buttonColor : undefined}
            style={isWeb ? {
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            } : undefined}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <YStack>
                <Text 
                  fontFamily={isWeb ? "$heading" : "$body"} 
                  color={labelColor} 
                  fontSize={isWeb ? 16 : 14} 
                  fontWeight={isWeb ? "600" : "500"}
                >
                  Show games in calendar
                </Text>
                <Text 
                  fontFamily="$body" 
                  color={buttonTextColor} 
                  fontSize={14}
                  mt="$1"
                  opacity={isWeb ? 0.9 : undefined}
                >
                  Display team logo on game days
                </Text>
              </YStack>
              <XStack alignItems="center" gap="$2">
                <Text 
                  fontFamily="$body" 
                  color={showNBAGamesInCalendar ? (isWeb ? buttonColor : "#fff") : buttonTextColor}
                  fontWeight="bold"
                  fontSize={isWeb ? 14 : undefined}
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
          mt={isWeb ? "$-2" : "$2"}
          mb={isWeb ? undefined : "$2"}
          color={buttonColor}
          hoverStyle={{
            opacity: 0.8
          }}
          pressStyle={{
            scale: 0.97
          }}
        >
          <Text fontFamily="$body" fontSize={isWeb ? 15 : undefined}>or skip for now</Text>
        </Button>
      </ScrollView>
    </YStack>
  )
}