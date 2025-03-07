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
  const isBirthday = event.type === 'birthday';
  const isTask = event.type === 'task';

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)',
      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
      borderWidth: isBirthday ? 2 : 1,
      borderRadius: 6,
      paddingVertical: 10,
      paddingLeft: 8,
      marginBottom: 10,
      position: 'relative',
      ...(isBirthday && { borderColor: primaryColor })
    },
    title: {
      color: isDark ? '#ffffff' : '#000000',
      fontFamily: '$body',
      fontSize: 16,
      fontWeight: '500',
      marginRight: 40
    },
    timeChip: {
      backgroundColor: primaryColor,
      borderRadius: 12,
      paddingVertical: 2,
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
      marginBottom: 4
    },
    timeChipText: {
      color: '#ffffff',
      fontFamily: '$body',
      fontSize: 12
    },
    description: {
      color: isDark ? '#cccccc' : '#555555',
      fontFamily: '$body',
      fontSize: 14,
      lineHeight: 18
    },
    icon: {
      color: isDark ? '#ffffff' : '#000000'
    },
    closeIcon: {
      color: '#F44336'
    }
  })

  return (
    <View style={dynamicStyles.container}>
      <View style={styles.titleContainer}>
        <Text style={dynamicStyles.title}>
          {event.title}
        </Text>
        {!isBirthday && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteIconButton}>
            <Ionicons name="close" size={20} style={dynamicStyles.closeIcon} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.detailsRow}>
        {event.time && !isBirthday && (
          <View style={dynamicStyles.timeChip}>
            <Text style={dynamicStyles.timeChipText}>{event.time}</Text>
          </View>
        )}
        {event.description && (
          <Text numberOfLines={2} style={dynamicStyles.description}>
            {event.description}
          </Text>
        )}
      </View>
      {!isBirthday && !isTask && ( 
        <TouchableOpacity onPress={onEdit} style={styles.editIconButton}>
          <Ionicons name="pencil" size={17} style={dynamicStyles.icon} />
        </TouchableOpacity>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  titleContainer: {
    paddingRight: 4
  },
  deleteIconButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4
  },
  editIconButton: {
    position: 'absolute',
    bottom: 12,
    right: 0,
    padding: 4
  },
  detailsRow: {
    marginTop: 10
  }
})
