import React, { useState, useCallback } from 'react'
import { Platform } from 'react-native'
import { useColorScheme } from '@/hooks/useColorScheme';
import { YStack, Text, Stack, ScrollView, XStack } from 'tamagui'
import * as Haptics from 'expo-haptics';

import { NewTaskModal } from './cardModals/NewTaskModal'
import { TemperatureModal } from './cardModals/TemperatureModal'
import { PortfolioModal } from './cardModals/PortfolioModal'
import { TaskListModal } from './cardModals/TaskListModal'
import { WatchlistModal } from './cardModals/WatchlistModal'
import { QuoteModal } from './cardModals/QuoteModal'
import { WifiModal } from './cardModals/WifiModal'

import { useUserStore } from '@/store/UserStore'
import { useProjectStore, useStoreHydrated } from '@/store/ToDo'
import { BackgroundSection } from '@/components/home/BackgroundSection'
import { StarsAnimation } from '@/components/home/StarsAnimation'
import { GreetingSection } from '@/components/home/GreetingSection'
import { CardSection } from '@/components/home/CardSection'
import { TaskSection } from '@/components/home/TaskSection'
import { AssetSection } from '@/components/home/AssetSection'
import { YearCompleteSection } from '@/components/home/YearCompleteSection'

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
  
  const handleNewTaskPress = () => { 
    setSheetOpen(true) 
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }
  const handleTemperaturePress = () => { 
    setTempModalOpen(true) 
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }
  const handlePortfolioPress = () => { 
     setPortfolioModalOpen(true) 
     if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
    }
  const handleQuotePress = () => { 
    setQuoteModalOpen(true) 
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }
  const handleWifiPress = () => { 
    setWifiModalOpen(true) 
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }
  return (
    <Stack flex={1} backgroundColor="black">
      <BackgroundSection />
      <StarsAnimation />
      <ScrollView flex={1} paddingHorizontal="$3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack paddingTop={Platform.OS === 'web' ? 10 : 105} gap="$3">
          <Stack backgroundColor={isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)"} borderRadius={12} padding="$4" borderColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} borderWidth={2} style={Platform.OS === 'web' ? { boxShadow: isDark ? '0px 0px 10px rgba(255, 255, 255, 0.05)' : '0px 0px 10px rgba(0, 0, 0, 0.05)' } : { shadowColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 }}>
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
            <Stack backgroundColor={isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)"} borderRadius={12} padding="$4" marginTop="$2" borderColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} borderWidth={2} minWidth={300}>
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
          
          {Platform.OS !== 'web' && (
            <Stack backgroundColor={isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)"} borderRadius={12} padding="$4" borderColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} borderWidth={2} style={{ shadowColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 }}>
              <YearCompleteSection />
            </Stack>
          )}

        </YStack>
      </ScrollView>
      <TemperatureModal open={tempModalOpen} onOpenChange={setTempModalOpen} />
      <PortfolioModal open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen} />
      <WatchlistModal open={watchlistModalOpen} onOpenChange={setWatchlistModalOpen} />
      <QuoteModal open={quoteModalOpen} onOpenChange={setQuoteModalOpen} />
      <WifiModal  open={wifiModalOpen}  onOpenChange={setWifiModalOpen}/>
      {sheetOpen && <NewTaskModal open={sheetOpen} onOpenChange={setSheetOpen} />}
      {taskListModalOpen && <TaskListModal open={taskListModalOpen} onOpenChange={setTaskListModalOpen} />}
    </Stack>
  )
}