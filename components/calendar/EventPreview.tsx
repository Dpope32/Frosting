import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { CalendarEvent } from '@/store/CalendarStore'
import { Ionicons } from '@expo/vector-icons'
import { TaskPriority } from '@/types/task'
import { useCustomCategoryStore } from '@/store/CustomCategoryStore'
import { useUserStore } from '@/store/UserStore'
import { getCategoryColor, getPriorityColor } from '@/utils/styleUtils'
import { LongPressDelete } from '../common/LongPressDelete'
import { isIpad } from '@/utils/deviceUtils'

export const EventPreview: React.FC<{
  event: CalendarEvent
  onEdit: () => void
  onDelete: () => void
  isDark: boolean
  primaryColor: string
  isDeviceEvent?: boolean
}> = ({ event, onEdit, onDelete, isDark, primaryColor, isDeviceEvent = false }) => {
  const isBirthday = event.type === 'birthday'
  const customCategories = useCustomCategoryStore((s) => s.categories)
  const userColor = useUserStore(s => s.preferences.primaryColor)
  const isCustom = event.type && customCategories.some(catObj => catObj.name === event.type)

  const getPriorityIcon = (priority?: TaskPriority) => {
    if (!priority) return 'flag-outline';
    const icons: Record<TaskPriority, any> = {
      high: 'alert-circle',
      medium: 'alert',
      low: 'information-circle-outline',
    };
    return icons[priority];
  };
  
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
      marginRight: 8,
      marginLeft: 6,
      position: 'relative',
      paddingHorizontal: isIpad() ? 12 : 12,
      paddingVertical: isIpad() ? 12 : 4,
      paddingTop: isIpad() ? 12 : 12,
      ...(isBirthday && { borderColor: primaryColor })
    },
    title: {
      color: isDark ? '#ffffff' : '#010101',
      fontSize: 16,
      fontWeight: '600',
      marginRight: 40,
      marginLeft: 4,
    },
    timeChip: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 12,
      paddingVertical: 3,
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
      marginRight: 8,
      marginBottom: 0,
      borderWidth: 1,
      borderColor: "rgb(52, 54, 55)",
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 4,
    },
    timeChipText: {
      color: "rgb(157, 157, 157)",
      fontSize: 11,
      fontWeight: '500',
      marginLeft: 4,
    },
    typeChip: {
      borderRadius: 12,
      paddingVertical: 5, 
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
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignSelf: 'flex-start',
      marginRight: 8,
      marginBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 4,
    },
    priorityChipText: {
      fontSize: 11,
      fontWeight: '500',
      marginLeft: 4,
    },
    description: {
      color: isDark ? '#cccccc' : '#555555',
      fontSize: isIpad() ? 15 : 13,
      lineHeight: isIpad() ? 20 : 18,
      marginLeft: 4,
      marginTop: isIpad() ? 8 : 4,
    },
    notificationIcon: {
      marginRight: 6,
      marginBottom: 6
    },
    metaInfo: {
      color: isDark ? '#999999' : '#777777',
      fontSize: 12,
      marginLeft: 3,
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
      marginLeft: 2,
    }
  })

  return (
    <LongPressDelete 
      onDelete={onDelete}
    >
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.title}>{(event.title)}</Text>
       {!isBirthday && !isDeviceEvent && event.type !== 'bill' && (
          <TouchableOpacity 
            onPress={() => {
              console.log('Edit icon clicked for event:', {
                id: event.id,
                title: event.title,
                type: event.type,
                isDeviceEvent,
              });
              onEdit();
            }} 
            style={styles.editIconButton}
          >
            <Ionicons name="pencil" size={17} color={isDark ? '#f9f9f9' : '#010101'} style={dynamicStyles.icon} />
          </TouchableOpacity>
        )}
       {event.description && (
          <Text numberOfLines={2} style={dynamicStyles.description}>
            {(event.description)}
          </Text>
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
              { backgroundColor: isCustom ? `${userColor}15` : `${getCategoryColor(event.type)}15` }
            ]}>
              {!isCustom && (
                <Ionicons 
                  name="bookmark" 
                  size={10} 
                  color={getCategoryColor(event.type)} 
                  style={{ marginTop: 1 }}
                />
              )}
              <Text style={[
                dynamicStyles.typeChipText, 
                { color: isCustom ? '#a1a1aa' : getCategoryColor(event.type) }
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
                name={getPriorityIcon(event.priority as TaskPriority)} 
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
      </View>
    </View>
    </LongPressDelete>
  )
}

const styles = StyleSheet.create({
  editIconButton: {
    position: 'absolute',
    top: 8,
    right: isIpad() ? 16 : 12,
    padding: 6,
    color: '#333333'
  },
  detailsRow: {
    marginTop: 8
  }
})
