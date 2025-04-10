import React, { useEffect } from 'react'
import { Image, Text, useColorScheme, Platform, ScrollView } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { View } from 'tamagui'

import { useSportsAPI } from '../../hooks/useSportsAPI'
import { format, isSameDay } from 'date-fns'
import { useNBAStore } from '../../store/NBAStore'
import type { Game } from '../../store/NBAStore'
import { GameCardSkeleton } from '../../components/sports/GameCardSkeleton'
import { nbaTeams } from '../../constants/nba'
import { useUserStore } from '../../store/UserStore'
import { styles } from '../../components/sports/nbaStyles'

export default function Sports() {
  const { data: schedule, isLoading, error, refetch, teamStats } = useSportsAPI()
  const { teamCode, teamName, setTeamInfo } = useNBAStore()
  const { preferences } = useUserStore()
  
  useEffect(() => {
    const favoriteTeamCode = preferences.favoriteNBATeam || 'OKC'
    if (favoriteTeamCode !== teamCode) {
      const team = nbaTeams.find(t => t.code === favoriteTeamCode)
      if (team) {
        setTeamInfo(favoriteTeamCode, team.name)
        refetch && refetch()
      }
    }
  }, [preferences.favoriteNBATeam, teamCode, setTeamInfo, refetch])
  
  useEffect(() => {
    if (schedule && schedule.length > 0 && !isLoading) {
      if (preferences.showNBAGamesInCalendar) {
        useNBAStore.getState().syncNBAGames()
      } else {
        useNBAStore.getState().clearNBACalendarEvents()
      }
    }
  }, [schedule, isLoading, preferences.showNBAGamesInCalendar])
  
  const today = new Date()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'
  const team = nbaTeams.find(t => t.code === teamCode)
  const teamColor =  '#007AFF' 
  const teamRecord = teamStats?.team?.record?.items?.[0]?.summary || '0-0'
  const divisionRank = teamStats?.team?.standingSummary || 'N/A'
  const simplifiedRank = divisionRank?.includes('in')  ? divisionRank : `in ${divisionRank}`

  const renderGameCard = (game: Game, index: number) => {
    const gameDate = new Date(game.date)
    const isToday = isSameDay(gameDate, today)
    const formattedDate = isToday ? 'Today' : format(gameDate, 'MMM d')
    const formattedTime = format(gameDate, 'h:mm a')

    return (
      <View
        key={index}
        style={[
          styles.gameCard,
          isWeb && styles.webGameCard,
          {
            backgroundColor: isDark ? '#111' : '#f5f5f5',
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

  const renderMobileLayout = () => {
    return (
      <FlashList
        data={isLoading ? Array(6).fill({}) : schedule || []}
        renderItem={isLoading ? () => <GameCardSkeleton /> : renderGame}
        estimatedItemSize={100}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          ...styles.listContent,
          paddingBottom: !isWeb ? 120 : styles.listContent.paddingBottom
        }}
      />
    )
  }

  const season = new Date().getFullYear()
  const nextSeason = season + 1
  const seasonText = `${season}-${nextSeason} Schedule`

  return (
    <View
      style={[
        styles.container, 
        {
          backgroundColor: isDark ? '#010101' : '#f3f3f3',
          flex: 1,
          marginTop: !isWeb ? 75 : 0
        }
      ]}
    >
      <View style={[
        styles.teamHeader, 
        isWeb && styles.webTeamHeader,
        { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
      ]}>
        {team?.logo ? (
          <Image
            source={{ uri: team.logo }}
            style={[styles.teamLargeLogo, isWeb && styles.webTeamLargeLogo]}
            resizeMode="contain"
            onError={(e) => console.log(`Team logo failed to load: ${team.code}`, e.nativeEvent.error)}
          />
        ) : (
          <View style={[
            styles.teamLargeLogo, 
            isWeb && styles.webTeamLargeLogo,
            { backgroundColor: isDark ? '#333' : '#f0f0f0', alignItems: 'center', justifyContent: 'center' }
          ]}>
            <Text style={{ fontSize: 24 }}>🏀</Text>
          </View>
        )}
        <View style={styles.teamInfoContainer}>
          <Text style={[
            styles.teamName,
            isWeb && styles.webTeamName,
            { color: isDark ? '#ffffff' : '#010101' }
          ]}>
            {teamName}
          </Text>
          <View style={[styles.recordRow, isWeb && styles.webRecordRow]}>
            <Text style={[
              styles.recordText,
              isWeb && styles.webRecordText,
              { color: isDark ? '#dddddd' : '#333333' }
            ]}>
              {teamRecord}
            </Text>
            <Text style={[
              styles.rankingText,
              isWeb && styles.webRankingText,
              { color: isDark ? '#aaaaaa' : '#555555' }
            ]}>
              {simplifiedRank}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.header]}>
        <Text style={[
          styles.headerTitle, 
          { color: isDark ? '#fff' : '#111', fontFamily: '$body' }
        ]}>
          {seasonText}
        </Text>
      </View>

      {error ? (
        <Text style={[styles.errorText, { fontFamily: '$body' }]}>
          Error loading schedule: {error.message}
        </Text>
      ) : (
        <View style={[styles.contentContainer, { flex: 1 }]}>
          {isWeb ? renderWebLayout() : renderMobileLayout()}
        </View>
      )}
    </View>
  )
}
