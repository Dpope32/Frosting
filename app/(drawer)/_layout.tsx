import React, { useState, useCallback } from 'react'
import { Dimensions, View, Text, Image, TouchableOpacity } from 'react-native'
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withTiming,
  runOnJS
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useUserStore } from '@/store/UserStore'
import { useColorScheme } from '@/hooks/useColorScheme'

const { width: screenWidth } = Dimensions.get('window')
const drawerWidth = screenWidth * 0.6

type ContextType = {
  startX: number
}

export default function CustomDrawerLayout({ navigation, children }: { navigation: any, children: React.ReactNode }) {
  const colorScheme = useColorScheme()
  const { primaryColor, username, profilePicture } = useUserStore(s => s.preferences)
  const translationX = useSharedValue(-drawerWidth)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const openDrawer = useCallback(() => {
    translationX.value = withTiming(0, { duration: 300 })
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    translationX.value = withTiming(-drawerWidth, { duration: 300 })
    setDrawerOpen(false)
  }, [])

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, ContextType>({
    onStart: (_, context) => {
      context.startX = translationX.value
    },
    onActive: (event, context) => {
      let newVal = context.startX + event.translationX
      if (newVal > 0) newVal = 0
      if (newVal < -drawerWidth) newVal = -drawerWidth
      translationX.value = newVal
    },
    onEnd: (event) => {
      if (translationX.value > -drawerWidth / 2) {
        translationX.value = withTiming(0, { duration: 200 })
        runOnJS(setDrawerOpen)(true)
      } else {
        translationX.value = withTiming(-drawerWidth, { duration: 200 })
        runOnJS(setDrawerOpen)(false)
      }
    }
  })

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }]
  }))

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <Animated.View style={[{ width: drawerWidth, position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(30,30,30,0.95)', zIndex: 2 }, drawerStyle]}>
        <View style={{ paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center' }}>
          <Image source={profilePicture ? { uri: profilePicture } : require('@/assets/images/adaptive-icon.png')} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }} />
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{username || 'User'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => { closeDrawer(); navigation.navigate('(tabs)/index') }} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <MaterialCommunityIcons name="castle" size={24} color="#fff" style={{ marginRight: 20 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { closeDrawer(); navigation.navigate('calendar') }} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <MaterialIcons name="calendar-today" size={24} color="#fff" style={{ marginRight: 20 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { closeDrawer(); navigation.navigate('sports') }} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <MaterialIcons name="sports-baseball" size={24} color="#fff" style={{ marginRight: 20 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Sports</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { closeDrawer(); navigation.navigate('chatbot') }} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <MaterialIcons name="code" size={24} color="#fff" style={{ marginRight: 20 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Chatbot</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { closeDrawer(); navigation.navigate('crm') }} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <MaterialIcons name="person" size={24} color="#fff" style={{ marginRight: 20 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>CRM</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { closeDrawer(); navigation.navigate('storage') }} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <MaterialIcons name="person" size={24} color="#fff" style={{ marginRight: 20 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Storage</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { closeDrawer(); navigation.navigate('vault') }} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <MaterialIcons name="lock" size={24} color="#fff" style={{ marginRight: 20 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Vault</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { closeDrawer(); navigation.navigate('bills') }} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <MaterialIcons name="attach-money" size={24} color="#fff" style={{ marginRight: 20 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Bills</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={{ flex: 1, zIndex: 1 }}>
          {children}
          <TouchableOpacity onPress={openDrawer} style={{ position: 'absolute', top: 40, left: 10, zIndex: 3 }}>
            <MaterialIcons name="menu" size={28} color={colorScheme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
      <BlurView intensity={20} style={{ position: 'absolute', left: 0, width: drawerWidth, top: 0, bottom: 0 }} />
    </View>
  )
}