import React from 'react'
import { Image, StyleSheet, Text, View, useColorScheme, Platform, ScrollView } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { ThemedView } from '../../theme/ThemedView'
import { useSportsAPI } from '../../hooks/useSportsAPI'
import { format, isSameDay } from 'date-fns'
import { useNBAStore } from '../../store/NBAStore'
import type { Game } from '../../store/NBAStore'
import { GameCardSkeleton } from './GameCardSkeleton'
import { nbaTeams } from '../../constants/nba'

export default function NBATeamPage() {
  const { data: schedule, isLoading, error } = useSportsAPI()
  const { teamCode, teamName } = useNBAStore()
  const today = new Date()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'

  // Find the team in the nbaTeams array
  const team = nbaTeams.find(t => t.code === teamCode)
  const teamColor = '#007AFF' // Default to blue if team not found

  const renderGameCard = (game: Game, index: number) => {
    const gameDate = new Date(game.date)
    const isToday = isSameDay(gameDate, today)
    const formattedDate = isToday ? 'Today' : format(gameDate, 'MMM d')
    const formattedTime = format(gameDate, 'h:mm a')

    // Get the short team name (without city)
    const shortTeamName = teamName.split(' ').pop() || teamName

    return (
      <View
        key={index}
        style={[
          styles.gameCard,
          isWeb && styles.webGameCard,
          {
            backgroundColor: isDark ? '#1A1A1A' : '#f5f5f5',
            borderColor: isDark ? '#333' : '#e0e0e0',
          },
        ]}
      >
        <View style={styles.dateTimeContainer}>
          <Text
            style={[
              styles.date,
              { fontFamily: '$body' },
              isToday && [styles.todayDate, { color: teamColor }],
              !isToday && { color: isDark ? '#fff' : '#000' },
            ]}
          >
            {formattedDate}
          </Text>
          <Text style={[styles.time, { fontFamily: '$body' }]}>{formattedTime}</Text>
        </View>

        <View style={styles.teamsContainer}>
          <View style={styles.teamWrapper}>
            {game.homeTeam.includes(teamName) && (
              <Image
                source={{ uri: team?.logo }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
            <Text
              style={[
                styles.team,
                { fontFamily: '$body' },
                game.homeTeam.includes(teamName)
                  ? [styles.teamHighlight, { color: teamColor }]
                  : [styles.opposingTeam, { color: isDark ? '#fff' : '#000' }],
              ]}
              numberOfLines={1}
            >
              {game.homeTeam.replace(`${teamName} `, '')}
            </Text>
          </View>
          <Text style={[styles.vs, { fontFamily: '$body' }]}>@</Text>
          <View style={[styles.teamWrapper, styles.awayWrapper]}>
            {game.awayTeam.includes(teamName) && (
              <Image
                source={{ uri: team?.logo }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
            <Text
              style={[
                styles.team,
                { fontFamily: '$body' },
                game.awayTeam.includes(teamName)
                  ? [styles.teamHighlight, { color: teamColor }]
                  : [styles.opposingTeam, { color: isDark ? '#fff' : '#000' }],
              ]}
              numberOfLines={1}
            >
              {game.awayTeam.replace(`${teamName} `, '')}
            </Text>
          </View>
        </View>

        {game.status === 'finished' && (
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color: isDark ? '#fff' : '#000', fontFamily: '$body' }]}>
              {game.homeScore} - {game.awayScore}
            </Text>
            <Text style={[styles.finalText, { fontFamily: '$body' }]}>Final</Text>
          </View>
        )}
      </View>
    )
  }

  const renderGame = ({ item: game }: { item: Game }) => {
    return renderGameCard(game, 0)
  }

  // Web grid layout
  const renderWebLayout = () => {
    if (isLoading) {
      return (
        <View style={isWeb ? styles.webGridContainer : {}}>
          {Array(6).fill(0).map((_, index) => (
            <GameCardSkeleton key={index} />
          ))}
        </View>
      )
    }

    return (
      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={isWeb ? styles.webGridContainer : {}}>
          {schedule?.map((game, index) => renderGameCard(game, index))}
        </View>
      </ScrollView>
    )
  }

  // Mobile list layout
  const renderMobileLayout = () => {
    return (
      <FlashList
        data={isLoading ? Array(6).fill({}) : schedule || []}
        renderItem={isLoading ? () => <GameCardSkeleton /> : renderGame}
        estimatedItemSize={100}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    )
  }

  const season = new Date().getFullYear()
  const nextSeason = season + 1
  const seasonText = `${season}-${nextSeason} Schedule`

  return (
    <ThemedView
      style={styles.container}
      darkColor="#000000"
      lightColor="#ffffff"
    >
      <View style={styles.header}>
        <Image
          source={{ uri: team?.logo }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000', fontFamily: '$body' }]}>
          {seasonText}
        </Text>
      </View>

      {error ? (
        <Text style={[styles.errorText, { fontFamily: '$body' }]}>
          Error loading schedule: {error.message}
        </Text>
      ) : (
        <View style={styles.contentContainer}>
          {isWeb ? renderWebLayout() : renderMobileLayout()}
        </View>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'web' ? 12 : 0, // reduce top margin on web
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 12,
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
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  listContainer: {
    flex: 1,
    height: '100%',
    minHeight: 200,
  },
  listContent: {
    padding: 8,
    paddingBottom: 20,
  },
  gameCard: {
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  // Web-specific styles
  webGameCard: {
    width: '30%',
    margin: 8,
    minWidth: 200,
  },
  webGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 8,
    maxWidth: 1800,
    marginHorizontal: 'auto',
    width: '100%',
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
  teamHighlight: {
    color: '#007AFF',
  },
  opposingTeam: {},
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
})
