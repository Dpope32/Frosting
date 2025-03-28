
// *** Sports.tsx ***
import React from 'react'
import { useColorScheme } from '@/hooks/useColorScheme'
import { YStack } from 'tamagui'

import { Platform } from 'react-native'
import NBATeamPage from '../../../app/(drawer)/nba'
//import OUPage from '@/components/sports/dev/ou'
//import { Tabs } from '@tamagui/tabs'

export default function Sports() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  //const getTeamEmoji = () => { return '🏀'};
  //const [activeTab, setActiveTab] = useState('nba');

    return (
      <YStack flex={1} mt={Platform.OS === 'web' ? 0 : 85} bg={isDark ? '#000000' : '#fffbf7'}>
        <NBATeamPage />
      </YStack>
    );
  }

  // Only for me, none of this will ever be used in production
  /*
  return (
    <YStack flex={1} mt={Platform.OS === 'web' ? 0 : 80} bg={isDark ? '#000000' : '#fffbf7'}>
      <Tabs defaultValue="nba" orientation="horizontal" flexDirection="column-reverse"  flex={1}  value={activeTab} onValueChange={setActiveTab} >
        <Tabs.List paddingTop="$1" paddingBottom="$4" borderTopWidth={1} borderColor="$gray11">
          <Tabs.Tab value="nba" flex={1} backgroundColor="transparent" pressStyle={{ backgroundColor: '$gray12', }}>
            <YStack alignItems="center">
              <Text fontSize="$5" fontFamily="$body" color={isDark ? 'white' : 'black'}> {getTeamEmoji()} </Text>
              <YStack backgroundColor="$blue10" height={3} width={40} mt="$1" display={activeTab === 'nba' ? 'flex' : 'none'}/>
            </YStack>
          </Tabs.Tab>
          
          <Tabs.Tab value="ou" flex={1} backgroundColor="transparent" pressStyle={{backgroundColor: '$gray12',}}>
            <YStack alignItems="center">
              <Text fontSize="$5" fontFamily="$body" color={isDark ? 'white' : 'black'}> ⭕</Text>
              <YStack backgroundColor="#990000" height={5} width={40} mt="$1"  display={activeTab === 'ou' ? 'flex' : 'none'}/>
            </YStack>
          </Tabs.Tab>
        </Tabs.List>

        <YStack flex={1}>
          <Tabs.Content value="nba" flex={1}>
            {activeTab === 'nba' && <NBATeamPage />}
          </Tabs.Content>
          
          <Tabs.Content value="ou" flex={1}>
            {activeTab === 'ou' && <OUPage />}
          </Tabs.Content>
        </YStack>
      </Tabs>
    </YStack>
  );
  */
