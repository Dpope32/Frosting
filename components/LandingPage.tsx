import React, { useState } from 'react'
import { Platform } from 'react-native'
import { useUserStore } from '@/store/UserStore'
import { useProjectStore, useStoreHydrated, Task } from '@/store/ToDo'
import { YStack, Text, Stack, ScrollView } from 'tamagui'
import { NewTaskModal } from './cardModals/NewTaskModal'
import { TemperatureModal } from './cardModals/TemperatureModal'
import { PortfolioModal } from './cardModals/PortfolioModal'
import { TaskListModal } from './cardModals/TaskListModal'
import { WatchlistModal } from './cardModals/WatchlistModal'
import { QuoteSection } from '@/components/home/QuoteSection'
import { BackgroundSection } from '@/components/home/BackgroundSection'
import { StarsAnimation } from '@/components/home/StarsAnimation'
import { GreetingSection } from '@/components/home/GreetingSection'
import { CardSection } from '@/components/home/CardSection'
import { TaskSection } from '@/components/home/TaskSection'
import { AssetSection } from '@/components/home/AssetSection'

type ProjectState = {
  toggleTaskCompletion: (id: string) => void
  todaysTasks: Task[]
}

const isWeb = Platform.OS === 'web';

export function LandingPage() {
  const username = useUserStore(s => s.preferences.username)
  const quoteEnabled = useUserStore(s => s.preferences.quoteEnabled ?? true)
  const userHydrated = useUserStore(s => s.hydrated)

  const toggleTaskCompletion = useProjectStore(React.useCallback((s: ProjectState) => s.toggleTaskCompletion, []))
  const deleteTask = useProjectStore(React.useCallback((s: any) => s.deleteTask, []))
  const projectHydrated = useStoreHydrated()
  const todaysTasks = useProjectStore(React.useCallback((s: ProjectState) => s.todaysTasks, []))

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

  const handleNewTaskPress = () => { setSheetOpen(true)
    setTimeout(() => {}, 0)}
  const handleTemperaturePress = () => {setTempModalOpen(true)}
  const handlePortfolioPress = () => {setPortfolioModalOpen(true)}

  return (
    <Stack flex={1} backgroundColor="black">
      <BackgroundSection />
      <StarsAnimation />
      <ScrollView flex={1} paddingHorizontal="$3" 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack paddingTop={isWeb ? 10 : 105} gap="$3">
          <Stack
            backgroundColor="rgba(0, 0, 0, 0.8)"
            borderRadius={12}
            padding="$4"
            borderColor="rgba(255, 255, 255, 0.05)"
            borderWidth={2}
            style={Platform.OS === 'web' ? {
              boxShadow: '0px 0px 10px rgba(255, 255, 255, 0.05)'
            } : {
              shadowColor: "rgba(255, 255, 255, 0.05)",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 10
            }}
          >
            <GreetingSection username={username} />
            <CardSection 
              onPortfolioPress={handlePortfolioPress} 
              onTemperaturePress={handleTemperaturePress} 
            />
            {Boolean(quoteEnabled) && 
              <Stack marginTop={isWeb ?  "-5" : "$2"}>
                <QuoteSection />
              </Stack>
            }
          </Stack>

          <TaskSection 
            todaysTasks={todaysTasks}
            toggleTaskCompletion={toggleTaskCompletion}
            deleteTask={deleteTask}
            onAddTaskPress={handleNewTaskPress}
            onTaskListPress={() => setTaskListModalOpen(true)}
          />

          {isWeb && (
            <Stack
              backgroundColor="rgba(0, 0, 0, 0.8)"
              borderRadius={12}
              padding="$4"
              marginTop="$2"
              borderColor="rgba(255, 255, 255, 0.05)"
              borderWidth={2}
              minWidth={300}
              style={{
                boxShadow: '0px 0px 10px rgba(255, 255, 255, 0.05)'
              }}
            >
              <Text 
                fontFamily="$body"
                color="#dbd0c6" 
                fontSize={20} 
                fontWeight="bold"
                marginBottom="$2"
                paddingLeft="$4"
                style={{
                  textShadowColor: 'rgba(219, 208, 198, 0.15)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 4
                }}
              >
                Asset Tracker
              </Text>
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
      {sheetOpen && <NewTaskModal open={sheetOpen} onOpenChange={setSheetOpen} />}
      {taskListModalOpen && <TaskListModal open={taskListModalOpen} onOpenChange={setTaskListModalOpen} />}
    </Stack>
  )
}
