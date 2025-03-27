// --------------------------------------------------------------
// OUPage.tsx
// --------------------------------------------------------------
import React from 'react'
import { GameCardSkeleton } from '../GameCardSkeleton'
import { Image, StyleSheet, Text, View, useColorScheme, Platform, ScrollView } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useOUSportsAPI } from '../../../hooks/useOUSportsAPI'
import { format, parseISO, addDays } from 'date-fns'
import type { Game } from '../../../types/espn'

const OU_CRIMSON = '#841617'

export default function OUPage() {
  const { data: schedule, isLoading, error } = useOUSportsAPI()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'

  const renderGameCard = (game: Game, index: number) => {
    if (!game.competitions || game.competitions.length === 0) return null
    const competition = game.competitions[0]
    const competitors = competition.competitors || []

    const ouTeam = competitors.find((c) => c.team.shortDisplayName === 'Oklahoma')
    const opposingTeam = competitors.find((c) => c.team.shortDisplayName !== 'Oklahoma')
    if (!ouTeam || !opposingTeam) return null

    const isOUHome = ouTeam.homeAway === 'home'
    const homeTeam = isOUHome ? ouTeam.team.shortDisplayName : opposingTeam.team.shortDisplayName
    const awayTeam = isOUHome ? opposingTeam.team.shortDisplayName : ouTeam.team.shortDisplayName
    const venue = competition.venue?.fullName || 'TBD'
    const date = parseISO(game.date)
    const localDate = addDays(date, 1)
    const formattedDate = `${format(localDate, 'MMM d')} (${format(localDate, 'EEE')})`

    return (
      <View
        key={index}
        style={[
          styles.gameCard,
          isWeb && styles.webGameCard,
          {
            backgroundColor: isDark ? '#1A1A1A' : '#f5f5f5',
            borderColor: isDark ? '#333' : '#e0e0e0',
          }
        ]}
      >
        <View style={styles.dateContainer}>
          <Text style={[styles.date, { color: isDark ? '#fff' : '#000', fontFamily: '$body' }]}>
            {formattedDate}
          </Text>
          <Text style={[styles.venue, { fontFamily: '$body' }]}>{venue}</Text>
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
                { fontFamily: '$body' },
                homeTeam === 'Oklahoma'
                  ? styles.highlight
                  : [styles.opposingTeam, { color: isDark ? '#fff' : '#000' }],
              ]}
              numberOfLines={1}
            >
              {homeTeam}
            </Text>
          </View>
          <Text style={[styles.at, { fontFamily: '$body' }]}>@</Text>
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
                { fontFamily: '$body' },
                awayTeam === 'Oklahoma'
                  ? styles.highlight
                  : [styles.opposingTeam, { color: isDark ? '#fff' : '#000' }],
              ]}
              numberOfLines={1}
            >
              {awayTeam}
            </Text>
          </View>
        </View>
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
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

  return (
    <ScrollView
      style={styles.container}
    >
      <View style={styles.header}>
        <Image source={require('../../assets/images/ou.png')} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000', fontFamily: '$body' }]}>
          2024-25 Schedule
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'web' ? 20 : 0, // reduce top margin on web
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
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
  webScrollView: {
    flex: 1,
    width: '100%',
  },
  webScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
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
    width: 24,
    height: 24,
    marginHorizontal: 4,
  },
  team: {
    fontSize: 16,
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
  opposingTeam: {},
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
