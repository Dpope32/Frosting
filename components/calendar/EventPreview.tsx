import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { CalendarEvent } from '@/store/CalendarStore'
import { Ionicons } from '@expo/vector-icons'
import { format, parse } from 'date-fns'

export const EventPreview: React.FC<{
  event: CalendarEvent
  onEdit: () => void
  onDelete: () => void
  isDark: boolean
  primaryColor: string
}> = ({ event, onEdit, onDelete, isDark, primaryColor }) => {
  const isBirthday = event.type === 'birthday';
  const isTask = event.type === 'task';
  
  // Format time to 12-hour format if it exists and is in 24-hour format
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    
    // If already in 12-hour format (contains AM/PM), return as is
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    try {
      // Try to parse the time string as 24-hour format
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
      }
      return timeString;
    } catch (error) {
      // If parsing fails, return the original string
      return timeString;
    }
  };

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
    typeChip: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
      borderRadius: 12,
      paddingVertical: 2,
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
      marginRight: 6,
      marginBottom: 4
    },
    typeChipText: {
      color: isDark ? '#ffffff' : '#000000',
      fontFamily: '$body',
      fontSize: 12
    },
    notificationIcon: {
      marginRight: 4,
      marginBottom: 4
    },
    metaInfo: {
      color: isDark ? '#999999' : '#777777',
      fontFamily: '$body',
      fontSize: 11,
      marginTop: 4
    },
    icon: {
      color: isDark ? '#ffffff' : '#000000'
    },
    closeIcon: {
      color: '#F44336'
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: 4
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
