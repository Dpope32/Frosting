import React from 'react';
import { Image, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ThemedView } from '../../theme/ThemedView';
import { useSportsAPI } from '../../hooks/useSportsAPI';
import { format, isSameDay } from 'date-fns';
import type { Game } from '../../store/ThunderStore';
import { GameCardSkeleton } from './GameCardSkeleton';

const THUNDER_BLUE = '#007AFF';

export default function ThunderPage() {
  const { data: schedule, isLoading, error } = useSportsAPI();
  const today = new Date();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderGame = ({ item: game }: { item: Game }) => {
    const isHome = game.homeTeam.includes('Thunder');
    const gameDate = new Date(game.date);
    const isToday = isSameDay(gameDate, today);
    const formattedDate = isToday ? 'Today' : format(gameDate, 'MMM d');
    const formattedTime = format(gameDate, 'h:mm a');
  
    return (
      <View style={[
        styles.gameCard,
        { 
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          borderColor: isDark ? '#333' : '#e0e0e0'
        }
      ]}>
        <View style={styles.dateTimeContainer}>
          <Text style={[
            styles.date,
            isToday && styles.todayDate,
            !isToday && { color: isDark ? '#fff' : '#000' }
          ]}>
            {formattedDate}
          </Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
        
        <View style={styles.teamsContainer}>
          <View style={styles.teamWrapper}>
            {game.homeTeam.includes('Thunder') && (
              <Image 
                source={require('../../assets/images/okc.png')}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
            <Text 
              style={[
                styles.team,
                styles.homeTeam,
                game.homeTeam.includes('Thunder') ? styles.thunderTeam : [styles.opposingTeam, { color: isDark ? '#fff' : '#000' }]
              ]} 
              numberOfLines={1}
            >
              {game.homeTeam.replace('Oklahoma City ', '')}
            </Text>
          </View>
          <Text style={styles.vs}>@</Text>
          <View style={[styles.teamWrapper, styles.awayWrapper]}>
            {game.awayTeam.includes('Thunder') && (
              <Image 
                source={require('../../assets/images/okc.png')}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
            <Text 
              style={[
                styles.team,
                styles.awayTeam,
                game.awayTeam.includes('Thunder') ? styles.thunderTeam : [styles.opposingTeam, { color: isDark ? '#fff' : '#000' }]
              ]} 
              numberOfLines={1}
            >
              {game.awayTeam.replace('Oklahoma City ', '')}
            </Text>
          </View>
        </View>
  
        {game.status === 'finished' && (
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color: isDark ? '#fff' : '#000' }]}>
              {game.homeScore} - {game.awayScore}
            </Text>
            <Text style={styles.finalText}>Final</Text>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/okc.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>2024-2025 Schedule</Text>
      </View>
      
      {error ? (
        <Text style={styles.errorText}>Error loading schedule: {error.message}</Text>
      ) : (
        <FlashList
          data={isLoading ? Array(6).fill({}) : schedule || []}
          renderItem={isLoading ? 
            () => <GameCardSkeleton /> : 
            renderGame
          }
          estimatedItemSize={80}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  listContent: {
    padding: 12,
  },
  gameCard: {
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
  },
  todayDate: {
    color: THUNDER_BLUE,
  },
  time: {
    fontSize: 14,
    color: '#888',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  teamWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  awayWrapper: {
    justifyContent: 'flex-end',
  },
  teamLogo: {
    width: 20,
    height: 20,
    marginHorizontal: 4,
  },
  team: {
    fontSize: 15,
  },
  thunderTeam: {
    color: THUNDER_BLUE,
  },
  opposingTeam: {},
  homeTeam: {
    textAlign: 'left',
  },
  awayTeam: {
    textAlign: 'right',
  },
  vs: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 12,
    width: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalText: {
    fontSize: 13,
    color: '#666',
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
  },
});
