import React from 'react'
import { format, isSameDay } from 'date-fns'
import { View, Text } from 'tamagui'
import { isWeb } from 'tamagui'
import { styles } from './nbaStyles'
import { Game, useNBAStore } from '@/store/NBAStore'

export const renderGameCard = (game: Game, index: number, teamColor: string, isDark: boolean, teamName: string) => {
    const gameDate = new Date(game.date)
    const today = new Date()
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