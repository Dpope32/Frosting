import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CalendarEvent } from '@/store/CalendarStore';
import { Ionicons } from '@expo/vector-icons';

export const EventPreview: React.FC<{
  event: CalendarEvent;
  onEdit: () => void;
  onDelete: () => void;
  isDark: boolean;
  primaryColor: string;
}> = ({ event, onEdit, onDelete, isDark, primaryColor }) => {
  const isBirthday = event.type === 'birthday';
  
  return (
    <View style={[
      styles.eventItem,
      isBirthday && { borderColor: primaryColor, borderWidth: 2 }
    ]}>
      <View style={styles.titleRow}>
        <Text 
          numberOfLines={1}
          style={[
            styles.eventTitle,
            { color: isDark ? '#ffffff' : '#000000' }
          ]}
        >
          {event.title}
        </Text>
        {!isBirthday && (
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: 'transparent' }]} 
            onPress={onDelete}
          >
            <Ionicons name="close" size={20} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.eventInfo}>
        {event.time && !isBirthday && (
          <Text style={[
            styles.eventTime,
            { color: isDark ? '#dddddd' : '#666666' }
          ]}>
            {new Date(`2000-01-01 ${event.time}`).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true,
              timeZone: 'America/Chicago' 
            })} CT
          </Text>
        )}
        
        {event.description && (
          <Text 
            style={[
              styles.eventDescription,
              { color: isDark ? '#dddddd' : '#666666' }
            ]}
            numberOfLines={2}
          >
            {event.description}
          </Text>
        )}
        
        {!isBirthday && (
          <View style={styles.metadataRow}>
            <Text style={[styles.eventMetadata, { color: isDark ? '#bbbbbb' : '#888888' }]}>
              Created: {new Date(event.createdAt).toLocaleDateString()}
            </Text>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: 'transparent' }]} 
              onPress={onEdit}
            >
              <Ionicons name="pencil" size={17} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  eventItem: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  eventInfo: {
    flex: 1,
    paddingHorizontal: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 3,
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
  }
});
