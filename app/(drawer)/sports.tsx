
// *** Sports.tsx ***
import React, { useState, useEffect } from 'react'
import { useColorScheme } from '@/hooks/useColorScheme'
import { YStack, Text } from 'tamagui'
import { Tabs } from '@tamagui/tabs'
import { Platform, Image } from 'react-native'
import NBATeamPage from '@/components/sports/NBATeamPage'
import OUPage from '@/components/sports/ou'
import { useUserStore } from '@/store/UserStore'
import { useNBAStore } from '@/store/NBAStore'
import { nbaTeams } from '@/constants/nba'

const isDev = process.env.NODE_ENV === 'development' || __DEV__;

export default function Sports() {
  const favoriteNBATeam = useUserStore(state => state.preferences.favoriteNBATeam) || 'OKC';
  const { teamCode, teamName } = useNBAStore();
  
  // Find the team in the nbaTeams array
  const team = nbaTeams.find(t => t.code === teamCode);
  const [activeTab, setActiveTab] = useState(isDev ? 'nba' : 'nba');
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'

  // Get the team emoji based on the team code
  const getTeamEmoji = () => {
    // You could map team codes to specific emojis if desired
    // For now, just use a basketball emoji
    return '🏀';
  };

  return (
    <YStack
      flex={1}
      marginTop={Platform.OS === 'web' ? 0 : 90}
      bg={isDark ? '#000000' : '#ffffff'}
    >
      <Tabs
        defaultValue="nba"
        orientation="horizontal"
        flexDirection="column-reverse"
        flex={1}
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <Tabs.List paddingTop="$1" paddingBottom="$4" borderTopWidth={1} borderColor="$gray11">
          <Tabs.Tab
            value="nba"
            flex={1}
            backgroundColor="transparent"
            pressStyle={{
              backgroundColor: '$gray12',
            }}
          >
            <YStack alignItems="center">
              <Text
                fontSize="$5"
                fontFamily="$body"
                color={isDark ? 'white' : 'black'}
              >
                {getTeamEmoji()}
              </Text>
              <YStack
                backgroundColor="$blue10"
                height={3}
                width={40}
                marginTop="$1"
                display={activeTab === 'nba' ? 'flex' : 'none'}
              />
            </YStack>
          </Tabs.Tab>
          
          {/* Only show OU tab in development mode */}
          {isDev && (
            <Tabs.Tab
              value="ou"
              flex={1}
              backgroundColor="transparent"
              pressStyle={{
                backgroundColor: '$gray12',
              }}
            >
              <YStack alignItems="center">
                <Text
                  fontSize="$5"
                  fontFamily="$body"
                  color={isDark ? 'white' : 'black'}
                >
                  ⭕
                </Text>
                <YStack
                  backgroundColor="#990000"
                  height={5}
                  width={40}
                  marginTop="$1"
                  display={activeTab === 'ou' ? 'flex' : 'none'}
                />
              </YStack>
            </Tabs.Tab>
          )}
        </Tabs.List>

        <YStack flex={1}>
          <Tabs.Content value="nba" flex={1}>
            {activeTab === 'nba' && <NBATeamPage />}
          </Tabs.Content>
          
          {/* Only render OU content in development mode */}
          {isDev && (
            <Tabs.Content value="ou" flex={1}>
              {activeTab === 'ou' && <OUPage />}
            </Tabs.Content>
          )}
        </YStack>
      </Tabs>
    </YStack>
  )
}
