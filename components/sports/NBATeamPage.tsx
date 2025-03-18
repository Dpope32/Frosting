import React, { useEffect } from 'react'
import { Image, Text, View, useColorScheme, Platform, ScrollView } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { ThemedView } from '../../theme/ThemedView'
import { useSportsAPI } from '../../hooks/useSportsAPI'
import { format, isSameDay } from 'date-fns'
import { useNBAStore } from '../../store/NBAStore'
import type { Game } from '../../store/NBAStore'
import { GameCardSkeleton } from './GameCardSkeleton'
import { nbaTeams } from '../../constants/nba'
import { useUserStore } from '../../store/UserStore'
import { styles } from './nbaStyles'

export default function NBATeamPage() {
  const { data: schedule, isLoading, error, refetch, teamStats } = useSportsAPI()
  const { teamCode, teamName, setTeamInfo } = useNBAStore()
  const { preferences } = useUserStore()
  
  // Sync the favorite team from user preferences to NBA store if needed
  useEffect(() => {
    const favoriteTeamCode = preferences.favoriteNBATeam || 'OKC'
    if (favoriteTeamCode !== teamCode) {
      const team = nbaTeams.find(t => t.code === favoriteTeamCode)
      if (team) {
        setTeamInfo(favoriteTeamCode, team.name)
        // Refetch schedule with new team
        refetch && refetch()
      }
    }
  }, [preferences.favoriteNBATeam, teamCode, setTeamInfo, refetch])
  
  // Sync NBA games to calendar when schedule is loaded
  useEffect(() => {
    if (schedule && schedule.length > 0 && !isLoading) {
      // Only sync games if the user has enabled showing NBA games in calendar
      if (preferences.showNBAGamesInCalendar) {
        useNBAStore.getState().syncNBAGames()
      } else {
        // Clear any existing NBA events from calendar
        useNBAStore.getState().clearNBACalendarEvents()
      }
    }
  }, [schedule, isLoading, preferences.showNBAGamesInCalendar])
  
  const today = new Date()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'

  // Find the team in the nbaTeams array
  const team = nbaTeams.find(t => t.code === teamCode)
  const teamColor =  '#007AFF' // Use team color or default to blue

  // Extract team record and standings data
  const teamRecord = teamStats?.team?.record?.items?.[0]?.summary || '0-0'
  const divisionRank = teamStats?.team?.standingSummary || 'N/A'
  
  // Simplified division rank
  const simplifiedRank = divisionRank?.includes('in') 
    ? divisionRank
    : `in ${divisionRank}`

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
      lightColor="#f3f3f3"
    >
      {/* Team Header */}
      <View style={styles.teamHeader}>
        <Image
          source={{ uri: team?.logo }}
          style={styles.teamLargeLogo}
          resizeMode="contain"
        />
        <View style={styles.teamInfoContainer}>
          <Text style={styles.teamName}>
            {teamName}
          </Text>
          <View style={styles.recordRow}>
            <Text style={styles.recordText}>
              {teamRecord}
            </Text>
            <Text style={styles.rankingText}>
              {simplifiedRank}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Schedule Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#111', fontFamily: '$body' }]}>
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