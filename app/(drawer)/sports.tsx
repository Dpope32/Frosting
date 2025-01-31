import React from 'react'
import { YStack, Text } from 'tamagui'
import { Tabs } from '@tamagui/tabs'
import ThunderPage from '@/components/sports/thunder'
import OUPage from '@/components/sports/ou'

export default function Sports() {
  return (
    <YStack flex={1} backgroundColor="$background" marginTop={100}>
      <Tabs
        defaultValue="thunder"
        orientation="horizontal"
        flexDirection="column"
        flex={1}
        backgroundColor="$background"
      >
        <Tabs.List 
          backgroundColor="$gray5"
          paddingVertical="$2"
          marginBottom="$2"
        >
          <Tabs.Tab 
            value="thunder"
            flex={1}
            backgroundColor="$transparent"
            pressStyle={{ 
              backgroundColor: '$gray7'
            }}
          >
            <Text color="$color" fontSize="$4">Thunder</Text>
          </Tabs.Tab>
          <Tabs.Tab 
            value="ou"
            flex={1}
            backgroundColor="$transparent"
            pressStyle={{ 
              backgroundColor: '$gray7'
            }}
          >
            <Text color="$color" fontSize="$4">OU</Text>
          </Tabs.Tab>
        </Tabs.List>
        
        <YStack flex={1}>
          <Tabs.Content value="thunder" flex={1}>
            <ThunderPage />
          </Tabs.Content>
          <Tabs.Content value="ou" flex={1}>
            <OUPage />
          </Tabs.Content>
        </YStack>
      </Tabs>
    </YStack>
  )
}