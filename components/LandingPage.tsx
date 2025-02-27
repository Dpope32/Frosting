import React, { useState } from 'react'
import { Pressable, Platform } from 'react-native'
import { useUserStore } from '@/store/UserStore'
import { useProjectStore, useStoreHydrated, Task } from '@/store/ToDo'
import { YStack, Text, Stack, ScrollView } from 'tamagui'
import { NewTaskModal } from './NewTaskModal'
import { TemperatureModal } from './cardModals/TemperatureModal'
import { PortfolioModal } from './cardModals/PortfolioModal'
import { TaskListModal } from './cardModals/TaskListModal'
import { QuoteSection } from '@/components/home/QuoteSection'
import { BackgroundSection } from '@/components/home/BackgroundSection'
import { StarsAnimation } from '@/components/home/StarsAnimation'
import { GreetingSection } from '@/components/home/GreetingSection'
import { CardSection } from '@/components/home/CardSection'
import { TaskSection } from '@/components/home/TaskSection'

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

  const handleNewTaskPress = () => {
    const startTime = Date.now()
    setSheetOpen(true)
    setTimeout(() => {
      const endTime = Date.now()
      const duration = endTime - startTime
      console.log('Modal Open Time', `Time taken: ${duration}ms`)
    }, 0)
  }

  const handleTemperaturePress = () => {
    setTempModalOpen(true)
  }

  const handlePortfolioPress = () => {
    setPortfolioModalOpen(true)
  }

  return (
    <Stack flex={1} backgroundColor="black">
      <BackgroundSection />
      <StarsAnimation />
      <ScrollView flex={1} paddingHorizontal="$3" 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack paddingTop={isWeb ? 80 : 95} gap="$2">
          <Stack
            backgroundColor="rgba(0, 0, 0, 0.85)"
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

        </YStack>
      </ScrollView>
      <TemperatureModal open={tempModalOpen} onOpenChange={setTempModalOpen} />
      <PortfolioModal open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen} />
      {sheetOpen && <NewTaskModal open={sheetOpen} onOpenChange={setSheetOpen} />}
      {taskListModalOpen && <TaskListModal open={taskListModalOpen} onOpenChange={setTaskListModalOpen} />}
    </Stack>
  )
}
