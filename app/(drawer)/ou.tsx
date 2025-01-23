
// pages/ou.tsx
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ThemedView } from '../../components/theme/ThemedView';
import { useOUSportsAPI } from '../../hooks/useOUSportsAPI';
import { format } from 'date-fns';
import type { Game } from '../../types/espn';

const OU_CRIMSON = '#841617';  // OU's official crimson color

export default function OUPage() {
  const { data: schedule, isLoading, error } = useOUSportsAPI();

  const renderGame = ({ item: game }: { item: Game }) => {
    const competition = game.competitions?.[0];
    if (!competition) return null;

    const homeCompetitor = competition.competitors?.find(c => c.homeAway === 'home');
    const awayCompetitor = competition.competitors?.find(c => c.homeAway === 'away');
    
    if (!homeCompetitor || !awayCompetitor) return null;

    const isHome = homeCompetitor.id === '201';
    const homeTeam = homeCompetitor.team.shortDisplayName || 'TBD';
    const awayTeam = awayCompetitor.team.shortDisplayName || 'TBD';
    const venue = competition.venue?.fullName || 'TBD';
    
    const gameDate = new Date(game.date);
    const formattedDate = format(gameDate, 'E, MMM d');
    const gameTime = game.status?.type?.shortDetail || 'TBD';
    const formattedTime = gameTime === 'TBD' ? 'TBD' : format(gameDate, 'h:mm a');

    const renderTeam = (teamName: string, isOU: boolean) => (
      <View style={styles.teamContainer}>
        {isOU && (
          <Image 
            source={require('../../assets/images/ou.png')}
            style={styles.teamLogo}
            resizeMode="contain"
          />
        )}
        <Text style={[
          styles.team, 
          isOU && styles.highlight
        ]}>{teamName}</Text>
      </View>
    );

    return (
      <View style={styles.gameCard}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
        
        <View style={styles.teamsContainer}>
          {renderTeam(awayTeam, !isHome)}
          <Text style={styles.at}>@</Text>
          {renderTeam(homeTeam, isHome)}
        </View>
        
        <Text style={styles.venue}>{venue}</Text>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/ou.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>2024-25 Schedule</Text>
      </View>

      {error ? (
        <Text style={styles.errorText}>Error loading schedule: {error.message}</Text>
      ) : (
        <FlashList
          data={schedule || []}
          renderItem={renderGame}
          estimatedItemSize={100}
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
    paddingTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  logo: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  listContent: {
    padding: 12,
  },
  gameCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    color: '#888',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  team: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  teamLogo: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  highlight: {
    color: OU_CRIMSON,
    fontWeight: '600',
  },
  at: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 12,
  },
  venue: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});