
// *** Sports.tsx ***
import React, { useState } from 'react'
import { useColorScheme } from '@/hooks/useColorScheme'
import { YStack, Text } from 'tamagui'
import { Tabs } from '@tamagui/tabs'
import { Platform } from 'react-native'
import ThunderPage from '@/components/sports/thunder'
import OUPage from '@/components/sports/ou'

export default function Sports() {
  const [activeTab, setActiveTab] = useState('thunder')
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'

  return (
    <YStack
      flex={1}
      marginTop={Platform.OS === 'web' ? 40 : 100}
      bg={isDark ? '#000000' : '#ffffff'}
    >
      <Tabs
        defaultValue="OKC"
        orientation="horizontal"
        flexDirection="column-reverse"
        flex={1}
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <Tabs.List paddingTop="$2" paddingBottom="$4" borderTopWidth={1} borderColor="$gray11">
          <Tabs.Tab
            value="thunder"
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
                ⚡
              </Text>
              <YStack
                backgroundColor="$blue10"
                height={5}
                width={40}
                marginTop="$1"
                display={activeTab === 'thunder' ? 'flex' : 'none'}
              />
            </YStack>
          </Tabs.Tab>
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
        </Tabs.List>

        <YStack flex={1}>
          <Tabs.Content value="thunder" flex={1}>
            {activeTab === 'thunder' && <ThunderPage />}
          </Tabs.Content>
          <Tabs.Content value="ou" flex={1}>
            {activeTab === 'ou' && <OUPage />}
          </Tabs.Content>
        </YStack>
      </Tabs>
    </YStack>
  )
}
