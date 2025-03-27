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
  const isTask = event.type === 'task'
  const formatTime = (timeString?: string) => {
    if (!timeString) return ''
    if (timeString.includes('AM') || timeString.includes('PM')) return timeString
    try {
      const [hh, mm] = timeString.split(':').map(Number)
      const period = hh >= 12 ? 'PM' : 'AM'
      const hour12 = hh % 12 || 12
      return `${hour12}:${mm.toString().padStart(2, '0')} ${period}`
    } catch {
      return timeString
    }
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#111' : '#fafafa',
      borderColor: isDark ? '#444444' : '#dddddd',
      borderWidth: isBirthday ? 2 : 1,
      borderRadius: 10,
      marginBottom: 16,
      position: 'relative',
      padding: 16,
      ...(isBirthday && { borderColor: primaryColor })
    },
    title: {
      color: isDark ? '#ffffff' : '#000000',
      fontSize: 16,
      fontWeight: '600',
      marginRight: 40
    },
    timeChip: {
      backgroundColor: primaryColor,
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 10,
      alignSelf: 'flex-start',
      marginRight: 8,
      marginBottom: 6
    },
    timeChipText: {
      color: '#ffffff',
      fontSize: 13
    },
    typeChip: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 10,
      alignSelf: 'flex-start',
      marginRight: 8,
      marginBottom: 6
    },
    typeChipText: {
      color: isDark ? '#ffffff' : '#000000',
      fontSize: 13
    },
    description: {
      color: isDark ? '#cccccc' : '#555555',
      fontSize: 15,
      lineHeight: 20,
      marginTop: 6
    },
    notificationIcon: {
      marginRight: 6,
      marginBottom: 6
    },
    metaInfo: {
      color: isDark ? '#999999' : '#777777',
      fontSize: 12,
      marginTop: 6
    },
    icon: {
      color: isDark ? '#ffffff' : '#000000'
    },
    closeIcon: {
      color: '#F44336'
    },
    infoRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginTop: 6
    }
  })

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>{event.title}</Text>
      {!isBirthday && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteIconButton}>
          <Ionicons name="close" size={20} style={dynamicStyles.closeIcon} />
        </TouchableOpacity>
      )}
      <View style={styles.detailsRow}>
        <View style={dynamicStyles.infoRow}>
          {event.time && !isBirthday && (
            <View style={dynamicStyles.timeChip}>
              <Text style={dynamicStyles.timeChipText}>{formatTime(event.time)}</Text>
            </View>
          )}
          {event.type && !isBirthday && !isTask && (
            <View style={dynamicStyles.typeChip}>
              <Text style={dynamicStyles.typeChipText}>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </Text>
            </View>
          )}
          {(event.notifyOnDay || event.notifyBefore) && (
            <Ionicons
              name="notifications"
              size={14}
              color={primaryColor}
              style={dynamicStyles.notificationIcon}
            />
          )}
        </View>
        {event.description && (
          <Text numberOfLines={2} style={dynamicStyles.description}>
            {event.description}
          </Text>
        )}
        {event.updatedAt && !isBirthday && !isTask && (
          <Text style={dynamicStyles.metaInfo}>
            Updated: {new Date(event.updatedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
      {!isBirthday && !isTask && (
        <TouchableOpacity onPress={onEdit} style={styles.editIconButton}>
          <Ionicons name="pencil" size={17} style={dynamicStyles.icon} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  deleteIconButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6
  },
  editIconButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 6
  },
  detailsRow: {
    marginTop: 8
  }
})
