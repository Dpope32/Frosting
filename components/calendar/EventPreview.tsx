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
      marginRight: 40, // Keep space for delete icon
      marginBottom: 4, // Reduced space below title
    },
    chip: { // Base style for all chips
      borderRadius: 12,
      paddingVertical: 3, // Reduced vertical padding
      paddingHorizontal: 7, // Reduced horizontal padding
      marginRight: 6, // Reduced spacing between chips
      marginBottom: 4, // Reduced spacing below chips
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1, // Add border for consistency
    },
    chipText: { // Base text style for chips
      fontSize: 10, // Slightly smaller text
      fontWeight: '500',
      marginLeft: 3, // Reduced space after icon
    },
    timeChip: { // Specific styles merged with base 'chip'
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderColor: "rgb(52, 54, 55)",
    },
    timeChipText: { // Specific text styles merged with base 'chipText'
      color: "rgb(157, 157, 157)",
    },
    typeChip: { // Specific styles merged with base 'chip'
      // Background color set dynamically
      borderColor: 'transparent', // Remove border if background is set
    },
    typeChipText: { // Specific text styles merged with base 'chipText'
      // Color set dynamically
    },
    priorityChip: { // Specific styles merged with base 'chip'
      // Background color set dynamically
      borderColor: 'transparent', // Remove border if background is set
    },
    priorityChipText: { // Specific text styles merged with base 'chipText'
      // Color set dynamically
    },
    description: {
      color: isDark ? '#cccccc' : '#555555',
      fontSize: 14, // Slightly smaller description
      lineHeight: 18,
      marginTop: 4 // Reduced space above description
    },
    notificationIcon: {
      marginRight: 6,
      marginBottom: 4 // Match chip margin
    },
    metaInfo: {
      color: isDark ? '#999999' : '#777777',
      fontSize: 12,
      marginTop: 4 // Reduced space
    },
    icon: {
      color: isDark ? '#ffffff' : '#010101'
    },
    editIcon: { // Specific style for edit icon alignment
       color: isDark ? '#cccccc' : '#555555', // Match description color
       marginLeft: 'auto', // Push to the right
       paddingLeft: 8, // Space before icon
    },
    closeIcon: {
      color: '#F44336'
    },
    infoRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      // marginTop: 6 // Removed marginTop, handled by title marginBottom
    }
  })

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>{formatNbaGameTitle(event.title)}</Text> 
      {!isBirthday && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteIconButton}>
          <Ionicons name="close" size={18} style={dynamicStyles.closeIcon} /> 
        </TouchableOpacity>
      )}
      <View style={dynamicStyles.infoRow}> 
          {event.time && !isBirthday && (
            <View style={[dynamicStyles.chip, dynamicStyles.timeChip]}> 
              <Ionicons 
                name="time-outline" 
                size={9} 
                color="rgb(157, 157, 157)" 
              />
              <Text style={[dynamicStyles.chipText, dynamicStyles.timeChipText]}> 
                {formatTime(event.time)}
              </Text>
            </View>
          )}
          
          {event.type && !isBirthday && (
            <View style={[
              dynamicStyles.chip,
              dynamicStyles.typeChip, 
              { backgroundColor: `${getCategoryColor(event.type as TaskCategory)}15` } 
            ]}>
              <Ionicons 
                name="bookmark" 
                size={9} 
                color={getCategoryColor(event.type as TaskCategory)} 
              />
              <Text style={[
                dynamicStyles.chipText, 
                dynamicStyles.typeChipText, 
                { color: getCategoryColor(event.type as TaskCategory) } 
              ]}>
                {event.type.toLowerCase()}
              </Text>
            </View>
          )}
          
          {event.priority && !isBirthday && (
            <View style={[
              dynamicStyles.chip, 
              dynamicStyles.priorityChip, 
              { backgroundColor: `${getPriorityColor(event.priority as TaskPriority)}15` }
            ]}>
              <Ionicons 
                name={getPriorityIcon(event.priority as TaskPriority) as any} 
                size={9} 
                color={getPriorityColor(event.priority as TaskPriority)} 
              />
              <Text style={[
                dynamicStyles.chipText, 
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
              size={12} 
              color={primaryColor}
              style={dynamicStyles.notificationIcon}
            />
          )}

          {!isBirthday && ( 
            <TouchableOpacity onPress={onEdit} style={dynamicStyles.editIcon}> 
              <Ionicons name="pencil" size={14} /> 
            </TouchableOpacity>
          )}
        </View> 
        
        {event.description && (
          <Text numberOfLines={2} style={dynamicStyles.description}>
            {formatNbaGameTitle(event.description)} 
          </Text>
        )}
      
    </View>
  )
}

const styles = StyleSheet.create({
  deleteIconButton: {
    position: 'absolute',
    top: 6, 
    right: 6, 
    padding: 4 
  }
})
