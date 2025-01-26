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
  }> = ({ event, onEdit, onDelete, isDark, primaryColor }) => (
    <View style={styles.eventItem}>
      <TouchableOpacity style={[styles.iconButton, { backgroundColor: primaryColor }]} onPress={onEdit}>
        <Ionicons name="filter" size={24} color="#666" />
      </TouchableOpacity>
      <View style={styles.eventInfo}>
        <Text style={[styles.eventTitle, { color: isDark ? '#ffffff' : '#000000' }]}>{event.title}</Text>
        {event.description && (
          <Text style={[styles.eventDescription, { color: isDark ? '#dddddd' : '#666666' }]}>
            {event.description}
          </Text>
        )}
        <Text style={[styles.eventMetadata, { color: isDark ? '#bbbbbb' : '#888888' }]}>
          Created: {new Date(event.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity style={[styles.deleteButton]} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    eventItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: '#cccccc',
      borderRadius: 8,
      marginBottom: 8,
    },
    eventInfo: {
      flex: 1,
      marginHorizontal: 12,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '500',
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
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteButton: {
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      padding: 8,
      borderColor: '#F44336',
      borderWidth: 1,
      borderRadius: 6,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    addEventButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteButtonText: {
      color: '#F44336',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });