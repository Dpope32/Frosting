// ou.tsx
import React from 'react'
import { GameCardSkeleton } from './GameCardSkeleton'
import { Image, StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { ThemedView } from '../../theme/ThemedView'
import { useOUSportsAPI } from '../../hooks/useOUSportsAPI'
import { format } from 'date-fns'
import type { Game } from '../../types/espn'

const OU_CRIMSON = '#841617'

export default function OUPage() {
  const { data: schedule, isLoading, error } = useOUSportsAPI()

  const renderGame = ({ item: game }: { item: Game }) => {
    const competition = game.competitions?.[0]
    if (!competition) return null

    const homeCompetitor = competition.competitors?.find(c => c.homeAway === 'home')
    const awayCompetitor = competition.competitors?.find(c => c.homeAway === 'away')
    if (!homeCompetitor || !awayCompetitor) return null

    const homeTeam = homeCompetitor.team.shortDisplayName || 'TBD'
    const awayTeam = awayCompetitor.team.shortDisplayName || 'TBD'
    const venue = competition.venue?.fullName || 'TBD'
    const gameDate = new Date(game.date)
    const formattedDate = format(gameDate, 'E, MMM d')
    const gameTime = competition.status?.type?.shortDetail || 'TBD'
    const formattedTime = gameTime === 'TBD' ? 'TBD' : format(gameDate, 'h:mm a')

    return (
      <View style={styles.gameCard}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
        <View style={styles.teamsContainer}>
          <View style={styles.teamWrapper}>
            {homeTeam.includes('Oklahoma') && (
              <Image
                source={require('../../assets/images/ou.png')}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
            <Text
              style={[
                styles.team,
                styles.homeTeam,
                homeTeam.includes('Oklahoma') ? styles.highlight : styles.opposingTeam,
              ]}
              numberOfLines={1}
            >
              {homeTeam}
            </Text>
          </View>
          <Text style={styles.at}>@</Text>
          <View style={[styles.teamWrapper, styles.awayWrapper]}>
            {awayTeam.includes('Oklahoma') && (
              <Image
                source={require('../../assets/images/ou.png')}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
            <Text
              style={[
                styles.team,
                styles.awayTeam,
                awayTeam.includes('Oklahoma') ? styles.highlight : styles.opposingTeam,
              ]}
              numberOfLines={1}
            >
              {awayTeam}
            </Text>
          </View>
        </View>
        <Text style={styles.venue}>{venue}</Text>
      </View>
    )
  }

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
          data={isLoading ? Array(6).fill({}) : schedule || []}
          renderItem={isLoading ? 
            () => <GameCardSkeleton /> : 
            renderGame
          }
          estimatedItemSize={100}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
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
    paddingHorizontal: 4,
    marginBottom: 4,
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
  homeTeam: {
    textAlign: 'left',
  },
  awayTeam: {
    textAlign: 'right',
  },
  highlight: {
    color: OU_CRIMSON,
    fontWeight: '600',
  },
  opposingTeam: {
    color: '#fff',
  },
  at: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 12,
    width: 20,
    textAlign: 'center',
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
})
