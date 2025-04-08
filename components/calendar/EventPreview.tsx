import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { CalendarEvent } from '@/store/CalendarStore'
import { Ionicons } from '@expo/vector-icons'
import { TaskPriority } from '@/types/task'

export const EventPreview: React.FC<{
  event: CalendarEvent
  onEdit: () => void
  onDelete: () => void
  isDark: boolean
  primaryColor: string
  isDeviceEvent?: boolean
}> = ({ event, onEdit, onDelete, isDark, primaryColor, isDeviceEvent = false }) => {
  const isBirthday = event.type === 'birthday'
  const isNBAEvent = event.type === 'nba'
  
  // Get category color based on type
  const getCategoryColor = (type: string): string => {
    const colors: Record<string, string> = {
      personal: '#9C27B0', // Purple
      work: '#2196F3',     // Blue
      family: '#FF9800',   // Orange
      task: '#4CAF50',     // Green
      health: '#f1c40f',   // Yellow
      wealth: '#607D8B',   // Blue Gray
      bill: '#795548',     // Brown
      nba: '#FF6B00'       // NBA Orange
    };
    return colors[type] || primaryColor;
  };
  
  // Get priority color function
  const getPriorityColor = (priority?: TaskPriority): string => {
    if (!priority) return '#607d8b';
    const colors: Record<TaskPriority, string> = {
      high: '#F44336', // Red
      medium: '#FF9800', // Orange
      low: '#4CAF50', // Green
    };
    return colors[priority];
  };

  // Get priority icon function
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

  // Format NBA team names to be shorter
  const formatNBATitle = (title: string): string => {
    if (!isNBAEvent) return title;
    
    // Replace full team names with shorter versions
    const replacements: Record<string, string> = {
      'Oklahoma City Thunder': 'Thunder',
      'Los Angeles Lakers': 'Lakers',
      'Los Angeles Clippers': 'Clippers',
      'Golden State Warriors': 'Warriors',
      'Phoenix Suns': 'Suns',
      'Sacramento Kings': 'Kings',
      'Portland Trail Blazers': 'Blazers',
      'Denver Nuggets': 'Nuggets',
      'Minnesota Timberwolves': 'Timberwolves',
      'Utah Jazz': 'Jazz',
      'San Antonio Spurs': 'Spurs',
      'Houston Rockets': 'Rockets',
      'Dallas Mavericks': 'Mavericks',
      'Memphis Grizzlies': 'Grizzlies',
      'New Orleans Pelicans': 'Pelicans',
      'Miami Heat': 'Heat',
      'Orlando Magic': 'Magic',
      'Atlanta Hawks': 'Hawks',
      'Washington Wizards': 'Wizards',
      'Charlotte Hornets': 'Hornets',
      'Detroit Pistons': 'Pistons',
      'Indiana Pacers': 'Pacers',
      'Cleveland Cavaliers': 'Cavaliers',
      'Chicago Bulls': 'Bulls',
      'Milwaukee Bucks': 'Bucks',
      'Toronto Raptors': 'Raptors',
      'Boston Celtics': 'Celtics',
      'New York Knicks': 'Knicks',
      'Philadelphia 76ers': '76ers',
      'Brooklyn Nets': 'Nets'
    };
    
    let formattedTitle = title;
    Object.entries(replacements).forEach(([fullName, shortName]) => {
      formattedTitle = formattedTitle.replace(fullName, shortName);
    });
    
    return formattedTitle;
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#111' : '#fafafa',
      borderColor: isDark ? '#444444' : '#dddddd',
      borderWidth: isBirthday ? 2 : 1,
      borderRadius: 10,
      marginRight: 8,
      marginLeft: 6,
      position: 'relative',
      padding: 12,
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
      fontSize: 15,
      lineHeight: 20,
      marginLeft: 4,
      marginTop: 8,
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
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>{formatNBATitle(event.title)}</Text>
      {!isBirthday && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteIconButton}>
          <Ionicons name="close" size={20} style={dynamicStyles.closeIcon} />
        </TouchableOpacity>
      )}
       {event.description && (
          <Text numberOfLines={2} style={dynamicStyles.description}>
            {formatNBATitle(event.description)}
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
              { backgroundColor: `${getCategoryColor(event.type)}15` }
            ]}>
              <Ionicons 
                name="bookmark" 
                size={10} 
                color={getCategoryColor(event.type)} 
                style={{ marginTop: 1 }}
              />
              <Text style={[
                dynamicStyles.typeChipText, 
                { color: getCategoryColor(event.type) }
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
      
      {!isBirthday && !isDeviceEvent && !isNBAEvent && event.type !== 'bill' && (
        <TouchableOpacity 
          onPress={() => {
            console.log('Edit icon clicked for event:', {
              id: event.id,
              title: event.title,
              type: event.type,
              isDeviceEvent,
              isNBAEvent
            });
            onEdit();
          }} 
          style={styles.editIconButton}
        >
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
