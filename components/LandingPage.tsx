import React, { useEffect, useState, useCallback } from 'react'
import { View, useWindowDimensions, Image, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import MyTracker from '@splicer97/react-native-mytracker'
import { useUserStore } from '@/store/UserStore'
import { useProjectStore, useStoreHydrated, Task } from '@/store/ToDo'
import { LinearGradient } from 'expo-linear-gradient'
import { YStack, Text, Stack, XStack, ScrollView, Button } from 'tamagui'
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated'
import { TaskCard } from './TaskCard'
import { NewTaskModal } from './NewTaskModal'
import { getCategoryColor } from './utils'
import { getWallpaperPath } from '../constants/Backgrounds'
import { TemperatureCard } from '../utils/TemperatureCard'
import { WifiCard } from '../utils/WifiCard'
import { PortfolioCard } from '../utils/PortfolioCard'
import { TemperatureModal } from './cardModals/TemperatureModal'
import { WifiModal } from './cardModals/WifiModal'
import { PortfolioModal } from './cardModals/PortfolioModal'
import { TaskListModal } from './cardModals/TaskListModal'
import { ClockCard } from '../utils/ClockCard'
import { QuoteSection } from '@/components/home/QuoteSection'
import { Ionicons } from '@expo/vector-icons'

type ProjectState = {
  toggleTaskCompletion: (id: string) => void
  todaysTasks: Task[]
}

export function LandingPage() {
  useEffect(() => {
    MyTracker.initTracker('initTracker')
  }, [])

  const username = useUserStore(s => s.preferences.username)
  const primaryColor = useUserStore(s => s.preferences.primaryColor)
  const backgroundStyle = useUserStore(s => s.preferences.backgroundStyle)
  const userHydrated = useUserStore(s => s.hydrated)

  const toggleTaskCompletion = useProjectStore(React.useCallback((s: ProjectState) => s.toggleTaskCompletion, []))
  const projectHydrated = useStoreHydrated()
  const todaysTasks = useProjectStore(React.useCallback((s: ProjectState) => s.todaysTasks, []))

  // If either store hasn't hydrated, show "Loading..."
  if (!userHydrated || !projectHydrated) {
    return (
      <Stack flex={1} backgroundColor="black" alignItems="center" justifyContent="center">
        <Text color="white">Loading...</Text>
      </Stack>
    )
  }

  // Modal states
  const [sheetOpen, setSheetOpen] = useState(false)
  const [tempModalOpen, setTempModalOpen] = useState(false);
  const [wifiModalOpen, setWifiModalOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [taskListModalOpen, setTaskListModalOpen] = useState(false);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours()
    switch (Math.floor(hour / 2)) {
      case 0:
        return "I AINT NO"
      case 1:
        return 'Still up'
      case 2:
        return 'Early bird'
      case 3:
        return 'Rise and shine'
      case 4:
        return 'Gm'
      case 5:
        return 'Gm'
      case 6:
        return 'Lunch time'
      case 7:
        return 'Good afternoon'
      case 8:
        return 'Whats good'
      case 9:
        return 'Good evening'
      case 10:
        return 'Gn'
      default:
        return 'Gn'
    }
  }, [])

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
    setTempModalOpen(true);
  };
  
  const handleWifiPress = () => {
    setWifiModalOpen(true);
  };
  
  const handlePortfolioPress = () => {
    setPortfolioModalOpen(true);
  };

  const adjustColor = useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }, [])

  // Memoize the completed tasks count
  const completedTasksCount = React.useMemo(() => 
    todaysTasks.filter((t: Task) => t.completed).length
  , [todaysTasks])

  // Memoize background render function with all dependencies
  const background = React.useMemo(() => {
    switch (backgroundStyle) {
      case 'gradient': {
        const lighterColor = adjustColor(primaryColor, 100)
        const darkerColor = adjustColor(primaryColor, -250)
        return (
          <LinearGradient
            colors={[lighterColor, primaryColor, darkerColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            locations={[0, 0.5, 1]}
          />
        )
      }
      case 'opaque':
        return (
          <Stack backgroundColor={primaryColor} position="absolute" width="100%" height="100%">
            <Stack
              position="absolute"
              width="100%"
              height="100%"
            />
          </Stack>
        )
        
      default:
        if (backgroundStyle.startsWith('wallpaper-')) {
          const wallpaper = getWallpaperPath(backgroundStyle);
          
          return wallpaper ? (
            <Stack position="absolute" width="100%" height="100%">
              <Image
                source={wallpaper}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
                onError={(error) => {
                  console.warn('Wallpaper load error:', error.nativeEvent);
                  if (backgroundStyle === 'wallpaper-1') {
                    useUserStore.getState().setPreferences({
                      backgroundStyle: 'gradient'
                    });
                  }
                }}
                loadingIndicatorSource={wallpaper}
              />
              <BlurView
                intensity={10}
                tint="dark"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                }}
              />
            </Stack>
          ) : null;
        }
        return null;
      }
  }, [backgroundStyle, primaryColor, adjustColor])

  // Starfield animation
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  // Setup animation only once
  useEffect(() => {
    const animationConfig = { duration: 60000 }
    translateX.value = withRepeat(withTiming(-screenWidth, animationConfig), -1, false)
    translateY.value = withRepeat(withTiming(-screenHeight / 2, animationConfig), -1, false)
    
    return () => {
      translateX.value = 0
      translateY.value = 0
    }
  }, [])

  const starsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }))

  const stars = React.useMemo(() => (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: screenWidth * 2,
          height: screenHeight * 2,
          zIndex: 1,
        },
        starsAnimatedStyle,
      ]}
    >
      {[...Array(100)].map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 1,
            left: Math.random() * screenWidth * 2,
            top: Math.random() * screenHeight * 2,
          }}
        />
      ))}
    </Animated.View>
  ), [screenWidth, screenHeight, starsAnimatedStyle])

  return (
    <Stack flex={1} backgroundColor="black">
      {background}
      {stars}

      <ScrollView flex={1} paddingHorizontal="$3" contentContainerStyle={{ paddingBottom: 80 }}>
        <YStack paddingTop={100} gap="$2">
          <Stack backgroundColor="rgba(0, 0, 0, 0.7)" borderRadius={12} padding="$4"borderColor="rgba(255, 255, 255, 0.1)" borderWidth={2}>
            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" gap="$2">
                <XStack alignItems="center" gap="$1">
                  <Text
                    fontFamily="$SpaceMono"
                    fontSize={20}
                    color="#dbd0c6"
                    fontWeight="bold"
                    numberOfLines={1}
                    style={{
                      textShadowColor: 'rgba(0, 0, 0, 0.5)',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 3,
                    }}
                  >
                    {getGreeting()},
                  </Text>
                  <Text
                    fontFamily="$SpaceMono"
                    fontSize={20}
                    color="#dbd0c6"
                    fontWeight="bold"
                    numberOfLines={1}
                    style={{
                      textShadowColor: 'rgba(0, 0, 0, 0.5)',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 3,
                    }}
                  >
                    {' '}{username}
                  </Text>
                </XStack>
              </XStack>
              <ClockCard />
            </XStack>

            <XStack marginTop="$3" gap="$3" flexWrap="nowrap">
            <Pressable onPress={handlePortfolioPress}>
                <PortfolioCard />
              </Pressable>
              <Pressable onPress={handleTemperaturePress}>
                <TemperatureCard />
              </Pressable>
              <Pressable onPress={handleWifiPress}>
                <WifiCard />
              </Pressable>
            </XStack>
          </Stack>
          <Stack
            backgroundColor="rgba(0, 0, 0, 0.7)"
            borderRadius={12}
            padding="$3"
            borderWidth={2}
            borderColor="rgba(255, 255, 255, 0.1)"
            minHeight={300} 
          >
            <Text
              color="#dbd0c6"
              fontSize={17}
              fontWeight="bold"
              marginBottom="$2"
              paddingLeft={4}
            >
              <XStack alignItems="center" justifyContent="space-between" width="100%">
                <Text
                  color="#dbd0c6"
                  fontSize={17}
                  fontWeight="bold"
                >
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Pressable
                  onPress={() => setTaskListModalOpen(true)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    padding: 4,
                  })}
                >
                  <Ionicons name="list-circle-outline" size={24} color="#dbd0c6" />
                </Pressable>
              </XStack>
            </Text>

            <XStack
              justifyContent="space-between"
              alignItems="center"
              marginBottom="$2"
              backgroundColor="rgba(0, 0, 0, 0.0)"
              borderRadius={8}
              paddingHorizontal="$3"
            >
              <Text color="#dbd0c6" fontSize={14} fontWeight="bold">
                Todays Tasks ({completedTasksCount}/{todaysTasks.length})
              </Text>
              <Button
                backgroundColor="rgba(255, 255, 255, 0.00)"
                borderRadius={8}
                paddingHorizontal="$2"
                onPress={handleNewTaskPress}
              >
                <Text color="#fff" fontSize={14} fontWeight="400" backgroundColor="#transparent">
                  + New Task
                </Text>
              </Button>
            </XStack>

            <Stack gap="$1" paddingHorizontal={10} flex={1}> 
              {todaysTasks.length === 0 ? (
                <Stack
                  borderRadius={8}
                  padding="$4"
                  alignItems="center"
                  flex={1} 
                  justifyContent="center"  
                >
                </Stack>
              ) : (
                todaysTasks.map((task: Task) => (
                  <TaskCard
                    key={task.id}
                    title={task.name}
                    time={task.time}
                    category={task.category}
                    status={task.isOneTime ? 'One-time' : 'Recurring'}
                    categoryColor={getCategoryColor(task.category)}
                    checked={task.completed}
                    onCheck={() => toggleTaskCompletion(task.id)}
                  />
                ))
              )}
            </Stack>
          </Stack>
          <Stack
            backgroundColor="rgba(0, 0, 0, 0.7)"
            borderRadius={12}
            padding="$3"
            borderWidth={2}
            borderColor="rgba(255, 255, 255, 0.1)"
          >
            <QuoteSection />
          </Stack>
        </YStack>
      </ScrollView>

      {/* Modals */}
      <TemperatureModal 
        open={tempModalOpen}
        onOpenChange={setTempModalOpen}
        temperature="21°F"
      />
      
      <WifiModal 
        open={wifiModalOpen}
        onOpenChange={setWifiModalOpen}
        speed="169ms"
      />
      
      <PortfolioModal 
        open={portfolioModalOpen}
        onOpenChange={setPortfolioModalOpen}
        value="$1,234.56"
        change="+$123.45"
        changePercentage="10.0%"
      />

      {sheetOpen && <NewTaskModal open={sheetOpen} onOpenChange={setSheetOpen} />}
      <TaskListModal open={taskListModalOpen} onOpenChange={setTaskListModalOpen} />
    </Stack>
  )
}
