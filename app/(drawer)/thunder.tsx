// ThunderPage.tsx
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ThemedView } from '../../theme/ThemedView';
import { useSportsAPI } from '../../hooks/useSportsAPI';
import { format, isSameDay } from 'date-fns';
import type { Game } from '../../store/ThunderStore';

export default function ThunderPage() {
  const { data: schedule, isLoading, error } = useSportsAPI();
  const today = new Date();

  const renderGame = ({ item: game }: { item: Game }) => {
    const isHome = game.homeTeam.includes('Thunder');
    const gameDate = new Date(game.date);
    const isToday = isSameDay(gameDate, today);
    const formattedDate = isToday ? 'Today' : format(gameDate, 'MMM d');
    const formattedTime = format(gameDate, 'h:mm a');
  
    return (
      <View style={styles.gameCard}>
        <View style={styles.dateTimeContainer}>
          <Text style={[styles.date, isToday && styles.todayDate]}>{formattedDate}</Text>
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
                game.homeTeam.includes('Thunder') ? styles.thunderTeam : styles.opposingTeam
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
                game.awayTeam.includes('Thunder') ? styles.thunderTeam : styles.opposingTeam
              ]} 
              numberOfLines={1}
            >
              {game.awayTeam.replace('Oklahoma City ', '')}
            </Text>
          </View>
        </View>
  
        {game.status === 'finished' && (
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>
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
        <Text style={styles.headerTitle}>2024-2025 Schedule</Text>
      </View>
      
      {error ? (
        <Text style={styles.errorText}>Error loading schedule: {error.message}</Text>
      ) : (
        <FlashList
          data={schedule || []}
          renderItem={renderGame}
          estimatedItemSize={80}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            isLoading ? (
              <Text style={styles.loadingText}>Loading schedule...</Text>
            ) : (
              <Text style={styles.emptyText}>No games found</Text>
            )
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 100,  // Restored paddingTop
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  todayDate: {
    color: '#007AFF',
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
    color: '#007AFF',
  },
  opposingTeam: {
    color: '#fff',
  },
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
    color: '#fff',
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
