import React, { useState, useEffect } from 'react'
import { YStack, isWeb, Text, Button, XStack, ScrollView, Label, Switch } from 'tamagui'
import { Image, useWindowDimensions, useColorScheme } from 'react-native' 
import { FormData } from '@/types'
import { nbaTeams } from '@/constants'
import { isIpad } from '@/utils';

export default function Step5({
  formData,
  setFormData,
  handleNext,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  handleNext: () => void
}) {
  const colorScheme = useColorScheme(); 
  const isDark = colorScheme === 'dark'; 
  const { width } = useWindowDimensions()
  const [showAllTeams, setShowAllTeams] = useState(isWeb)
  const selectedTeam = formData.favoriteNBATeam || ''
  const [showNBAGamesInCalendar, setShowNBAGamesInCalendar] = useState(true)
  const [showNBAGameTasks, setShowNBAGameTasks] = useState(true) 

  const handleTeamSelect = (teamCode: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteNBATeam: teamCode,
      showNBAGamesInCalendar: showNBAGamesInCalendar,
      showNBAGameTasks: showNBAGameTasks 
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

  const handleToggleNBAGameTasks = (value: boolean) => { 
    setShowNBAGameTasks(value)
    if (selectedTeam) {
      setFormData(prev => ({
        ...prev,
        showNBAGameTasks: value
      }))
    }
  }

  const handleSkip = () => {
    setFormData(prev => ({
      ...prev,
      favoriteNBATeam: 'OKC',
      showNBAGamesInCalendar: false, 
      showNBAGameTasks: false 
    }))
    handleNext()
  }
  
  const popularTeams = ['LAL', 'GSW', 'BOS', 'CHI', 'OKC', 'CLE']
  const initialTeams = nbaTeams.filter(team => popularTeams.includes(team.code))
  const teamsToDisplay = showAllTeams ? nbaTeams : initialTeams
  
  useEffect(() => { 
    if (isWeb || isIpad()) { 
      setShowAllTeams(true)
    }
  }, [isWeb])
  
  const getGridColumns = () => {
    if (!isWeb && !isIpad()) return 2 
    if (width > 1200) return 6
    if (width > 900) return 5
    if (width > 600) return 4
    return 3
  }
  const columns = getGridColumns()
  
  const buttonColor = formData.primaryColor || '#1976D2'; 
  const showAllTeamsButtonBackground = "transparent"; 
  const preferencesBackgroundColor = "transparent"; 
  const switchBorderColor = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)";
  const mobileButtonWidth = 140;
  const mobileButtonHeight = 105;
  const mobileScrollMaxWidth = 600;
  const mobileTopPadding = 20;
  
  return (
    <YStack 
      flex={1} 
      justifyContent="flex-start" 
      alignItems="center" 
      padding={isWeb ? "$4" : "$2"} 
      paddingTop={isWeb ? 0 : mobileTopPadding}
    >
      <YStack 
        position="absolute" 
        top={isWeb ? "2%" : isIpad() ? "7%" : "13%"} 
        left={0} 
        right={0} 
        alignItems="center"
        py={isWeb ? "$4" : "$0"}
        my={isWeb ? "$2" : 0}
      >
        <Label 
          paddingBottom={isWeb ? 20 : isIpad() ? 40 : 40}
          fontFamily="$heading" 
          fontWeight={isWeb ? "500" : "800"} 
          fontSize={isWeb ? "$9" : "$7"} 
          textAlign="center" 
          color={isDark ? "#ffffff" : "#000000"}
        >
          What is {formData.username}s favorite NBA team?
        </Label>
      </YStack>

      <ScrollView 
        style={{ 
          width: '100%', 
          maxWidth: isWeb ? 1200 : isIpad() ? 1200 : mobileScrollMaxWidth,
          marginTop: isWeb ? 90 : isIpad() ? 120 : 140
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
              backgroundColor={selectedTeam === team.code ? buttonColor : (isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)")}
              borderColor={selectedTeam === team.code ? buttonColor : (isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)")}
              borderWidth={2}
              br={isWeb ? 16 : 8} 
              marginVertical="$2"
              width={isWeb ? `${Math.floor(100 / columns) -5}%` : mobileButtonWidth}
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
              <YStack flex={1} justifyContent="center" alignItems="center" paddingTop={isWeb ? 10 : 0}>
                <Image
                  source={{ uri: team.logo }}
                  style={{ 
                    width: isWeb ? 55 : 50, 
                    height: isWeb ? 55 : 50,
                    opacity: selectedTeam === team.code ? 1 : 0.4
                  }}
                  resizeMode="contain"
                />
              </YStack>
              <Text
                fontFamily="$body"
                color={selectedTeam === team.code ? 'white' : (isDark ? "#ffffff" : "#000000")} 
                textAlign="center"
                fontSize={isWeb ? 12 : 12}
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
        
        {!isWeb && !showAllTeams && !isIpad() && (
          <Button
            mt="$2"
            marginBottom="$4"
            size="$3"
            variant="outlined" 
            backgroundColor={showAllTeamsButtonBackground} 
            borderColor={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"} 
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
            <Text fontFamily="$body" color={isDark ? "#ffffff" : "#000000"}>Show All Teams</Text> 
          </Button>
        )}

        <YStack 
          alignItems="center" 
          width="100%" 
          maxWidth={isWeb ? 600 : 400} 
          mt={isWeb ? "$2" : "$1"} 
          mb={isWeb ? "$4" : "$2"}
        >
          {selectedTeam ? (
            isWeb ? (
              <XStack
                width="100%"
                justifyContent="center"
                alignItems="center"
                animation="quick"
                enterStyle={{ opacity: 0, y: -10 }}
                gap="$6" 
              >
                <YStack 
                  backgroundColor={preferencesBackgroundColor} 
                  br={16}
                  padding="$4"
                  borderWidth={2}
                  borderColor={buttonColor} 
                  style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                  animation="quick"
                  enterStyle={{ opacity: 0, scale: 0.95 }}
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack>
                      <Text
                        fontFamily="$heading"
                        color={isDark ? "#ffffff" : "#000000"}
                        fontSize={isWeb ? 20 : isIpad() ? 20 : 16}
                        fontWeight="600"
                      >
                        Show games in calendar?
                      </Text>
                    </YStack>
                      <Switch
                        checked={showNBAGamesInCalendar}
                        onCheckedChange={handleToggleNBAGames}
                        backgroundColor={showNBAGamesInCalendar ? buttonColor : (isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)")}
                        borderColor={switchBorderColor}
                      >
                        <Switch.Thumb
                          animation="bouncy"
                          backgroundColor={isDark ? "#181A20" : "#fff"}
                        />
                      </Switch>
                    </XStack>
                </YStack>
                <YStack
                  backgroundColor={preferencesBackgroundColor}
                  br={16}
                  padding="$4"
                  borderWidth={2}
                  borderColor={buttonColor}
                  style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                  animation="quick"
                  enterStyle={{ opacity: 0, scale: 0.95 }}
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack>
                      <Text
                        fontFamily="$heading"
                        color={isDark ? "#ffffff" : "#000000"}
                        fontSize={isWeb ? 20 : isIpad() ? 20 : 16}
                        fontWeight="600"
                      >
                        Show game days on Home Screen?
                      </Text>
                    </YStack>
                      <Switch
                        checked={showNBAGameTasks}
                        onCheckedChange={handleToggleNBAGameTasks} 
                        backgroundColor={showNBAGameTasks ? buttonColor : (isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)")} 
                        borderColor={switchBorderColor}
                      >
                        <Switch.Thumb
                          animation="bouncy"
                          backgroundColor={isDark ? "#181A20" : "#fff"}
                        />
                      </Switch>
                    </XStack>
                </YStack>
                <Button
                  variant="outlined"
                  size="$3"
                  onPress={handleSkip}
                  br={12}
                  borderColor={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"}
                  backgroundColor="transparent"
                  alignSelf="center"
                  hoverStyle={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  }}
                  pressStyle={{
                    scale: 0.97
                  }}
                >
                  <Text fontFamily="$body" color={buttonColor}>or skip for now</Text>
                </Button>
              </XStack>
            ) : (
              <YStack
                width="100%"
                alignItems="stretch"
                animation="quick"
                enterStyle={{ opacity: 0, y: -10 }}
                gap="$2"
              >
                <YStack 
                  br={8}
                  padding="$3"
                  animation="quick"
                  enterStyle={{ opacity: 0, scale: 0.95 }}
                  width="90%" 
                  alignSelf='center'
                  gap="$3" 
                >
                  <XStack justifyContent="space-between" alignItems="center" flex={1}>
                    <YStack flex={1} marginRight="$2">
                      <Text
                        fontFamily="$body"
                        color={isDark ? "#ffffff" : "#000000"}
                        fontSize={14}
                        fontWeight="500"
                      >
                        Show games in calendar?
                      </Text>
                    </YStack>
                      <Switch
                        checked={showNBAGamesInCalendar}
                        onCheckedChange={handleToggleNBAGames}
                        backgroundColor={showNBAGamesInCalendar ? buttonColor : (isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)")}
                        borderColor={switchBorderColor}
                        size="$3"
                      >
                        <Switch.Thumb
                          animation="bouncy"
                          backgroundColor={isDark ? "#181A20" : "#fff"}
                        />
                      </Switch>
                    </XStack>
                  <XStack justifyContent="space-between" alignItems="center" flex={1}>
                    <YStack flex={1} marginRight="$2">
                      <Text
                        fontFamily="$body"
                        color={isDark ? "#ffffff" : "#000000"}
                        fontSize={14}
                        fontWeight="500"
                      >
                        Show game days on Home?
                      </Text>
                    </YStack>
                      <Switch
                        checked={showNBAGameTasks}
                        onCheckedChange={handleToggleNBAGameTasks} 
                        backgroundColor={showNBAGameTasks ? buttonColor : (isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)")} 
                        borderColor={switchBorderColor}
                        size="$3"
                      >
                        <Switch.Thumb
                          animation="bouncy"
                          backgroundColor={isDark ? "#181A20" : "#fff"}
                        />
                      </Switch>
                    </XStack>
                </YStack>
                <Button
                  chromeless
                  size="$3" 
                  onPress={handleSkip}
                  width="50%"
                  alignSelf="center"
                  pressStyle={{
                    scale: 0.98
                  }}
                  mt="$2"
                  animation="quick"
                  enterStyle={{ opacity: 0, y: 10 }}
                >
                  <Text fontFamily="$body" color={buttonColor} fontSize="$3">or skip for now</Text> 
                </Button>
              </YStack>
            )
          ) : (
            <Button 
              mt={isWeb ? "$6" : "$4"}
              variant="outlined" 
              size="$3" 
              onPress={handleSkip}
              br={isWeb ? 12 : 20}
              borderColor={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"} 
              backgroundColor="transparent" 
              alignSelf="center"
              hoverStyle={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', 
              }}
              pressStyle={{
                scale: 0.97
              }}
              animation="quick"
              enterStyle={{ opacity: 0 }}
            >
              <Text fontFamily="$body" color={isDark ? "#ffffff" : "#000000"} fontSize="$3">Skip selecting a team for now</Text> 
            </Button>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
