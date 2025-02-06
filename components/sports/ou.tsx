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
    if (!game.competitions || game.competitions.length === 0) {
      return null
    }
    
    const competition = game.competitions[0]
    const competitors = competition.competitors || []
    
    // Find Oklahoma's team and their opponent
    const ouTeam = competitors.find(c => c.team.shortDisplayName === 'Oklahoma')
    const opposingTeam = competitors.find(c => c.team.shortDisplayName !== 'Oklahoma')
    
    if (!ouTeam || !opposingTeam) {
      return null
    }

    const isOUHome = ouTeam.homeAway === 'home'
    const homeTeam = isOUHome ? ouTeam.team.shortDisplayName : opposingTeam.team.shortDisplayName
    const awayTeam = isOUHome ? opposingTeam.team.shortDisplayName : ouTeam.team.shortDisplayName
    const venue = competition.venue?.fullName || 'TBD'
    const gameDate = new Date(game.date)
    const formattedDate = format(gameDate, 'E, MMM d')
    const formattedTime = competition.status?.type?.shortDetail || 'TBD'

    return (
      <View style={styles.gameCard}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
        <View style={styles.teamsContainer}>
          <View style={styles.teamWrapper}>
            {homeTeam === 'Oklahoma' && (
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
                homeTeam === 'Oklahoma' ? styles.highlight : styles.opposingTeam,
              ]}
              numberOfLines={1}
            >
              {homeTeam}
            </Text>
          </View>
          <Text style={styles.at}>@</Text>
          <View style={[styles.teamWrapper, styles.awayWrapper]}>
            {awayTeam === 'Oklahoma' && (
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
                awayTeam === 'Oklahoma' ? styles.highlight : styles.opposingTeam,
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
        <View style={styles.listContainer}>
          <FlashList
            data={isLoading ? Array(6).fill({ id: 'skeleton' }) : schedule || []}
            renderItem={({ item }) => {
              if (item.id === 'skeleton') {
                return <GameCardSkeleton />
              }
              return renderGame({ item })
            }}
            estimatedItemSize={100}
            contentContainerStyle={styles.listContent}
          />
        </View>
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
  listContainer: {
    flex: 1,
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
})