import React, { useState, useCallback } from 'react'
import { Platform } from 'react-native'
import { useColorScheme } from '@/hooks/useColorScheme';
import { YStack, Text, Stack, ScrollView, XStack, Button } from 'tamagui'

import { NewTaskModal } from './cardModals/NewTaskModal'
import { TemperatureModal } from './cardModals/TemperatureModal'
import { PortfolioModal } from './cardModals/PortfolioModal'
import { TaskListModal } from './cardModals/TaskListModal'
import { WatchlistModal } from './cardModals/WatchlistModal'
import { QuoteModal } from './cardModals/QuoteModal'
import { WifiModal } from './cardModals/WifiModal'

import { useUserStore } from '@/store/UserStore'
import { useProjectStore, useStoreHydrated } from '@/store/ToDo'
import { useNetworkStore } from '@/store/NetworkStore'
import { getWifiDetails } from '@/services/wifiServices'

import { BackgroundSection } from '@/components/home/BackgroundSection'
import { StarsAnimation } from '@/components/home/StarsAnimation'
import { GreetingSection } from '@/components/home/GreetingSection'
import { CardSection } from '@/components/home/CardSection'
import { TaskSection } from '@/components/home/TaskSection'
import { AssetSection } from '@/components/home/AssetSection'

export function LandingPage() {
  const username = useUserStore(s => s.preferences.username)
  const userHydrated = useUserStore(s => s.hydrated)
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const toggleTaskCompletion = useProjectStore(useCallback((s) => s.toggleTaskCompletion, []))
  const deleteTask = useProjectStore(useCallback((s) => s.deleteTask, []))
  const projectHydrated = useStoreHydrated()
  const todaysTasks = useProjectStore(useCallback((s) => s.todaysTasks, []))
  if (!userHydrated || !projectHydrated) {
    return (
      <Stack flex={1} backgroundColor="black" alignItems="center" justifyContent="center">
        <Text color="white">Loading...</Text>
      </Stack>
    )
  }
  const [sheetOpen, setSheetOpen] = useState(false)
  const [tempModalOpen, setTempModalOpen] = useState(false)
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false)
  const [taskListModalOpen, setTaskListModalOpen] = useState(false)
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [wifiModalOpen, setWifiModalOpen] = useState(false)
  const handleNewTaskPress = () => { setSheetOpen(true) }
  const handleTemperaturePress = () => { setTempModalOpen(true) }
  const handlePortfolioPress = () => { setPortfolioModalOpen(true) }
  const handleQuotePress = () => { setQuoteModalOpen(true) }
  const handleWifiPress = () => { setWifiModalOpen(true) }
  return (
    <Stack flex={1} backgroundColor="black">
      <BackgroundSection />
      <StarsAnimation />
      <ScrollView flex={1} paddingHorizontal="$3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack paddingTop={Platform.OS === 'web' ? 10 : 105} gap="$3">
          <Stack backgroundColor="rgba(0, 0, 0, 0.8)" borderRadius={12} padding="$4" borderColor="rgba(255, 255, 255, 0.05)" borderWidth={2} style={Platform.OS === 'web' ? { boxShadow: '0px 0px 10px rgba(255, 255, 255, 0.05)' } : { shadowColor: "rgba(255, 255, 255, 0.05)", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 }}>
            <GreetingSection username={username} />
            <CardSection 
              onPortfolioPress={handlePortfolioPress} 
              onTemperaturePress={handleTemperaturePress} 
              onQuotePress={handleQuotePress}
              onWifiPress={handleWifiPress}
            />
          </Stack>
          <TaskSection todaysTasks={todaysTasks} toggleTaskCompletion={toggleTaskCompletion} deleteTask={deleteTask} onAddTaskPress={handleNewTaskPress} onTaskListPress={() => setTaskListModalOpen(true)} />
          {Platform.OS === 'web' && (
            <Stack backgroundColor="rgba(0, 0, 0, 0.8)" borderRadius={12} padding="$4" marginTop="$2" borderColor="rgba(255, 255, 255, 0.05)" borderWidth={2} minWidth={300} style={{ boxShadow: '0px 0px 10px rgba(255, 255, 255, 0.05)' }}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontFamily="$body" color="#dbd0c6" fontSize={20} fontWeight="bold" marginBottom="$2" paddingLeft="$4" style={{ textShadowColor: 'rgba(219, 208, 198, 0.15)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 }}>
                  Asset Tracker
                </Text>
              </XStack>
              <Stack padding="$2" minHeight={100}>
                <AssetSection onAddToWatchlist={() => setWatchlistModalOpen(true)} />
              </Stack>
            </Stack>
          )}
        </YStack>
      </ScrollView>
      <TemperatureModal open={tempModalOpen} onOpenChange={setTempModalOpen} />
      <PortfolioModal open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen} />
      <WatchlistModal open={watchlistModalOpen} onOpenChange={setWatchlistModalOpen} />
      <QuoteModal open={quoteModalOpen} onOpenChange={setQuoteModalOpen} />
      <WifiModal 
        open={wifiModalOpen} 
        onOpenChange={setWifiModalOpen} 
        speed={useNetworkStore(s => {
          const details = s.details;
          const wifiDetails = getWifiDetails(details);
          const isConnected = details?.isConnected ?? false;
          const isWifi = details?.type === 'wifi';
          
          if (!isConnected) return 'Offline';
          
          if (isWifi && wifiDetails?.linkSpeed && Platform.OS !== 'ios') {
            return `${wifiDetails.linkSpeed} Mbps`;
          }
          
          return '45 ms'; // Default value
        })}
      />
      {sheetOpen && <NewTaskModal open={sheetOpen} onOpenChange={setSheetOpen} />}
      {taskListModalOpen && <TaskListModal open={taskListModalOpen} onOpenChange={setTaskListModalOpen} />}
    </Stack>
  )
}
