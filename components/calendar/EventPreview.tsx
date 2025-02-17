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
      <View style={[
        styles.iconButton,
        isBirthday && { backgroundColor: '#FFD700' }  
      ]}>
        <Ionicons
          name={isBirthday ? 'gift' : 'filter'}
          size={20}
          color={isBirthday ? '#FF69B4' : '#000000'}
        />
      </View>
      <View style={styles.eventInfo}>
        <View>
          <Text 
            numberOfLines={1}
            style={[
              styles.eventTitle,
              { color: isDark ? '#ffffff' : '#000000' }
            ]}
          >
            {event.title}
          </Text>
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
        </View>
        {event.description && (
          <Text style={[
            styles.eventDescription,
            { color: isDark ? '#dddddd' : '#666666' }
          ]}>
            {event.description}
          </Text>
        )}
        {!isBirthday && (
          <Text style={[styles.eventMetadata, { color: isDark ? '#bbbbbb' : '#888888' }]}>
            Created: {new Date(event.createdAt).toLocaleDateString()}
          </Text>
        )}
      </View>
      {!isBirthday && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: 'transparent' }]} 
            onPress={onEdit}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: 'transparent' }]} 
            onPress={onDelete}
          >
            <Ionicons name="close" size={18} color="#F44336" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  eventInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500'
  },
  eventDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  eventMetadata: {
    fontSize: 12,
    marginTop: 4,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  }
});
