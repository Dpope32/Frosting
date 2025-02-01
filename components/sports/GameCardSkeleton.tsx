// components/sports/GameCardSkeleton.tsx
import React from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const GameCardSkeleton = () => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

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
    ).start();
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.gameCard]}>
      <View style={styles.shimmerContainer}>
        <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* Date and Time Row */}
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateSkeleton} />
        <View style={styles.timeSkeleton} />
      </View>

      {/* Teams Row */}
      <View style={styles.teamsContainer}>
        <View style={styles.teamSkeleton} />
        <View style={styles.vsSkeleton} />
        <View style={styles.teamSkeleton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gameCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
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
    backgroundColor: '#333',
    borderRadius: 4,
  },
  timeSkeleton: {
    width: 60,
    height: 14,
    backgroundColor: '#333',
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
    backgroundColor: '#333',
    borderRadius: 4,
  },
  vsSkeleton: {
    width: 20,
    height: 13,
    backgroundColor: '#333',
    borderRadius: 4,
    marginHorizontal: 12,
  },
});