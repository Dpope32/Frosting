
// *** GameCardSkeleton.tsx ***
// (Mostly unchanged except for fontFamily if you like, but here's an example with minimal additions.)
import React from 'react'
import { StyleSheet, View, Animated, Dimensions, useColorScheme } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

export const GameCardSkeleton = () => {
  const animatedValue = React.useRef(new Animated.Value(0)).current
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  })

  return (
    <View
      style={[
        styles.gameCard,
        {
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          borderColor: isDark ? '#333' : '#e0e0e0',
        },
      ]}
    >
      <View style={styles.shimmerContainer}>
        <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]}>
          <LinearGradient
            colors={[
              'transparent',
              isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <View style={styles.dateTimeContainer}>
        <View style={[styles.dateSkeleton, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
        <View style={[styles.timeSkeleton, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
      </View>

      <View style={styles.teamsContainer}>
        <View style={[styles.teamSkeleton, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
        <View style={[styles.vsSkeleton, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
        <View style={[styles.teamSkeleton, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  gameCard: {
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateSkeleton: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  timeSkeleton: {
    width: 60,
    height: 14,
    borderRadius: 4,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  teamSkeleton: {
    width: 120,
    height: 15,
    borderRadius: 4,
  },
  vsSkeleton: {
    width: 20,
    height: 13,
    borderRadius: 4,
    marginHorizontal: 12,
  },
})
