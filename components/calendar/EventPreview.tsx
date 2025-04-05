import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { CalendarEvent } from '@/store/CalendarStore'
import { Ionicons } from '@expo/vector-icons'
import { TaskPriority, TaskCategory } from '@/types/task' // Added TaskCategory
import { formatNbaGameTitle } from '@/utils/stringUtils'
import { getCategoryColor, getPriorityColor, getPriorityIcon } from '@/utils/styleUtils' // Import style utils

export const EventPreview: React.FC<{
  event: CalendarEvent
  onEdit: () => void
  onDelete: () => void
  isDark: boolean
  primaryColor: string
}> = ({ event, onEdit, onDelete, isDark, primaryColor }) => {
  const isBirthday = event.type === 'birthday'
  
  // Removed local definitions of getCategoryColor, getPriorityColor, getPriorityIcon
  
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
      marginBottom: 8,
      position: 'relative',
      padding: 12,
      ...(isBirthday && { borderColor: primaryColor })
    },
    title: {
      color: isDark ? '#ffffff' : '#010101',
      fontSize: 16,
      fontWeight: '600',
      marginRight: 40
    },
    timeChip: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
      marginRight: 8,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: "rgb(52, 54, 55)",
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeChipText: {
      color: "rgb(157, 157, 157)",
      fontSize: 11,
      fontWeight: '500',
      marginLeft: 4,
    },
    typeChip: {
      borderRadius: 12,
      paddingVertical: 4, 
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
      marginRight: 8,
      marginBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    typeChipText: {
      fontSize: 11,
      fontWeight: '500',
      marginLeft: 4,
    },
    priorityChip: {
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
      marginRight: 8,
      marginBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    priorityChipText: {
      fontSize: 11,
      fontWeight: '500',
      marginLeft: 4,
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
      color: isDark ? '#ffffff' : '#010101'
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
      {/* Apply formatting to the title */}
      <Text style={dynamicStyles.title}>{formatNbaGameTitle(event.title)}</Text> 
      {!isBirthday && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteIconButton}>
          <Ionicons name="close" size={20} style={dynamicStyles.closeIcon} />
        </TouchableOpacity>
      )}
      <View style={styles.detailsRow}>
        <View style={dynamicStyles.infoRow}>
          {event.time && !isBirthday && (
            <View style={dynamicStyles.timeChip}>
              <Ionicons 
                name="time-outline" 
                size={10} 
                color="rgb(157, 157, 157)" 
                style={{ marginTop: 1 }}
              />
              <Text style={dynamicStyles.timeChipText}>
                {formatTime(event.time)}
              </Text>
            </View>
          )}
          
          {event.type && !isBirthday && (
            <View style={[
              dynamicStyles.typeChip, 
              // Use imported function, cast type
              { backgroundColor: `${getCategoryColor(event.type as TaskCategory)}15` } 
            ]}>
              <Ionicons 
                name="bookmark" 
                size={10} 
                // Use imported function, cast type
                color={getCategoryColor(event.type as TaskCategory)} 
                style={{ marginTop: 1 }}
              />
              <Text style={[
                dynamicStyles.typeChipText, 
                // Use imported function, cast type
                { color: getCategoryColor(event.type as TaskCategory) } 
              ]}>
                {event.type.toLowerCase()}
              </Text>
            </View>
          )}
          
          {event.priority && !isBirthday && (
            <View style={[
              dynamicStyles.priorityChip, 
              { backgroundColor: `${getPriorityColor(event.priority as TaskPriority)}15` }
            ]}>
              <Ionicons 
                name={getPriorityIcon(event.priority as TaskPriority) as any} // Cast to any to fix TS error
                size={10} 
                color={getPriorityColor(event.priority as TaskPriority)} 
                style={{ marginTop: 1 }}
              />
              <Text style={[
                dynamicStyles.priorityChipText, 
                { color: getPriorityColor(event.priority as TaskPriority) }
              ]}>
                {(event.priority as string).toLowerCase()}
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
            {/* Apply formatting to the description */}
            {formatNbaGameTitle(event.description)} 
          </Text>
        )}
      </View>
      
      {!isBirthday && (
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
