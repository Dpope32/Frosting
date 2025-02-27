import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { CalendarEvent } from '@/store/CalendarStore'
import { Ionicons } from '@expo/vector-icons'

export const EventPreview: React.FC<{
  event: CalendarEvent
  onEdit: () => void
  onDelete: () => void
  isDark: boolean
  primaryColor: string
}> = ({ event, onEdit, onDelete, isDark, primaryColor }) => {
  const isBirthday = event.type === 'birthday'

  const dynamicStyles = StyleSheet.create({
    container: {
      // Darker background in dark mode, lighter in light mode
      backgroundColor: isDark
        ? 'rgba(255,255,255,0.07)'
        : 'rgba(0,0,0,0.03)',
      borderColor: isDark
        ? 'rgba(255,255,255,0.2)'
        : 'rgba(0,0,0,0.2)',
      borderWidth: isBirthday ? 2 : 1,
      borderRadius: 6,
      padding: 10,
      marginBottom: 10,
      ...(isBirthday && { borderColor: primaryColor }), // override border for birthdays
    },
    title: {
      color: isDark ? '#ffffff' : '#000000',
      fontFamily: '$body',
    },
    time: {
      color: isDark ? '#dddddd' : '#666666',
      fontFamily: '$body',
    },
    description: {
      color: isDark ? '#dddddd' : '#666666',
      fontFamily: '$body',
    },
    metadata: {
      color: isDark ? '#bbbbbb' : '#888888',
      fontFamily: '$body',
    },
    pencilIcon: {
      color: '#fff',
    },
    closeIcon: {
      color: '#F44336',
    },
  })

  return (
    <View style={dynamicStyles.container}>
      <View style={styles.titleRow}>
        <Text
          numberOfLines={1}
          style={[styles.eventTitle, dynamicStyles.title]}
        >
          {event.title}
        </Text>
        {!isBirthday && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: 'transparent' }]}
            onPress={onDelete}
          >
            <Ionicons
              name="close"
              size={20}
              style={dynamicStyles.closeIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.eventInfo}>
        {event.time && !isBirthday && (
          <Text style={[styles.eventTime, dynamicStyles.time]}>
            {new Date(`2000-01-01 ${event.time}`).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'America/Chicago',
            })}{' '}
            CT
          </Text>
        )}

        {event.description && (
          <Text
            style={[styles.eventDescription, dynamicStyles.description]}
            numberOfLines={2}
          >
            {event.description}
          </Text>
        )}

        {!isBirthday && (
          <View style={styles.metadataRow}>
            <Text style={[styles.eventMetadata, dynamicStyles.metadata]}>
              Created: {new Date(event.createdAt).toLocaleDateString()}
            </Text>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: 'transparent' }]}
              onPress={onEdit}
            >
              <Ionicons
                name="pencil"
                size={17}
                style={dynamicStyles.pencilIcon}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 3,
  },
  eventInfo: {
    flex: 1,
    paddingHorizontal: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventMetadata: {
    fontSize: 12,
    opacity: 0.7,
  },
  iconButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
