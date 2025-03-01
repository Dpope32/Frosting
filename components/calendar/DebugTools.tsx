import React from 'react';
import { View, TouchableOpacity, Alert, Platform } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCalendarStore, CalendarEvent } from '@/store/CalendarStore';
import { useBillStore } from '@/store/BillStore';
import { useToastStore } from '@/store/ToastStore';
import { useVaultStore } from '@/store/VaultStore';
import { vaultStorage } from '@/utils/Storage';
import { VAULT_DATA } from '@/constants/vaultData';
import { generateBillEvents, generateRandomDate, generateRandomTime } from '@/services/calendarService';
import { calendarStyles } from './CalendarStyles';

interface DebugToolsProps {
  openDebugModal: (data: any) => void;
  isDev: boolean;
}

export const DebugTools: React.FC<DebugToolsProps> = ({ openDebugModal, isDev }) => {
  const { showToast } = useToastStore();

  if (!isDev) return null;

  const handleShowDebugInfo = async () => {
    try {
      const store = useCalendarStore.getState();
      
      const vaultDataStr = await vaultStorage.getString('vault-data');
      
      const vaultData = vaultDataStr ? JSON.parse(vaultDataStr) : VAULT_DATA;
      
      const info = {
        totalEvents: store.events.length,
        eventsByType: store.events.reduce((acc, event) => {
          const type = event.type || 'personal';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, { personal: 0, work: 0, family: 0, birthday: 0, bill: 0 }),
        vaultEntries: vaultData.totalItems,
        upcomingEvents: store.events
          .filter((event) => new Date(event.date) >= new Date())
          .slice(0, 5)
          .map((event) => ({
            title: event.title,
            date: event.date,
            type: event.type || 'personal',
          })),
      };
      
      openDebugModal(info);
    } catch (error) {
      console.error('Error loading debug data:', error);
      showToast('Error loading debug information', 'error');
    }
  };

  const handleGenerateTestData = async () => {
    try {
      const { addEvent } = useCalendarStore.getState();

      const personalEvents = [
        'Gym Session', 'Doctor Appointment', 'Haircut', 'Coffee with Friend',
        'Movie Night', 'Shopping Trip', 'Dentist Appointment', 'Yoga Class',
        'Book Club Meeting', 'Personal Project Time'
      ];

      const workEvents = [
        'Team Meeting', 'Project Deadline', 'Client Presentation', 'Performance Review',
        'Training Session', 'Conference Call', 'Workshop', 'Strategy Planning',
        'Budget Review', 'Department Meeting'
      ];

      const familyEvents = [
        'Family Dinner', 'Kids Soccer Game', 'Parent Teacher Meeting', 'Family Movie Night',
        'Weekend Getaway', 'Grocery Shopping', 'House Cleaning', 'Family BBQ',
        'Park Visit', 'Swimming Lessons'
      ];

      const bills = [
        'Rent Payment', 'Electricity Bill', 'Water Bill', 'Internet Bill',
        'Phone Bill', 'Car Insurance', 'Health Insurance', 'Credit Card Payment',
        'Gym Membership', 'Streaming Services'
      ];

      const passwords = [
        { name: 'Gmail', username: 'user@gmail.com', password: 'TestPass123!' },
        { name: 'Facebook', username: 'user.fb', password: 'FBTest456#' },
        { name: 'Twitter', username: 'user_twitter', password: 'TweetPass789$' },
        { name: 'Instagram', username: 'user.insta', password: 'InstaTest321@' },
        { name: 'LinkedIn', username: 'user.linkedin', password: 'LinkedTest654!' },
        { name: 'Amazon', username: 'user.amazon', password: 'AmazonPass987#' },
        { name: 'Netflix', username: 'user.netflix', password: 'NetflixTest234$' },
        { name: 'Spotify', username: 'user.spotify', password: 'SpotifyPass567@' },
        { name: 'GitHub', username: 'user.github', password: 'GitTest890!' },
        { name: 'Dropbox', username: 'user.dropbox', password: 'DropTest432#' }
      ];

      const generateEvents = (events: string[], type: CalendarEvent['type']) => {
        return events.map(title => ({
          date: generateRandomDate().toISOString().split('T')[0],
          time: generateRandomTime(),
          title,
          type,
          description: `Test ${type} event: ${title}`
        }));
      };

      const newEvents = [
        ...generateEvents(personalEvents, 'personal'),
        ...generateEvents(workEvents, 'work'),
        ...generateEvents(familyEvents, 'family')
      ];

      newEvents.forEach(event => addEvent(event));
      
      const billStore = useBillStore.getState();
      bills.forEach(billName => {
        const dueDate = Math.floor(Math.random() * 28) + 1;
        
        billStore.addBill({
          name: billName,
          amount: Math.floor(Math.random() * 200) + 50, 
          dueDate,
        });
        const billEvents = generateBillEvents(billName, dueDate);
        billEvents.forEach(event => addEvent(event));
      });

      // Use VaultStore to add password entries
      const { addEntry } = useVaultStore.getState();
      
      // Add each password entry using the store's method
      for (const entry of passwords) {
        await addEntry(entry);
      }

      showToast('Added test events, bills, and vault entries', 'success');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error adding test data:', error);
      showToast('Error adding test data', 'error');
    }
  };

  const handleClearAllData = () => {
    // For web platform, use browser's native confirm dialog
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to clear all events? This cannot be undone.');
      if (confirmed) {
        useCalendarStore.getState().clearAllEvents();
        useBillStore.getState().clearBills();
        
        // Clear vault entries using VaultStore
        const vaultStore = useVaultStore.getState();
        const currentEntries = vaultStore.getEntries();
        for (const entry of currentEntries) {
          vaultStore.deleteEntry(entry.id);
        }
        
        showToast('Cleared all events, bills, and vault entries', 'success');
      }
    } else {
      // For mobile platforms, use React Native's Alert
      Alert.alert(
        'Clear All Events',
        'Are you sure you want to clear all events? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear All', 
            style: 'destructive',
            onPress: () => {
              useCalendarStore.getState().clearAllEvents();
              useBillStore.getState().clearBills();
              
              // Clear vault entries using VaultStore
              const vaultStore = useVaultStore.getState();
              const currentEntries = vaultStore.getEntries();
              for (const entry of currentEntries) {
                vaultStore.deleteEntry(entry.id);
              }
              
              showToast('Cleared all events, bills, and vault entries', 'success');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        ]
      );
    }
  };

  return (
    <View style={{ position: 'absolute', bottom: 32, left: 24, zIndex: 1000, flexDirection: 'row', gap: 12 }}>
      <TouchableOpacity
        style={[calendarStyles.debugButton, { backgroundColor: '#666666' }]}
        onPress={handleShowDebugInfo}
      >
        <MaterialIcons name="bug-report" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[calendarStyles.debugButton, { backgroundColor: '#ff6b6b' }]}
        onPress={handleGenerateTestData}
      >
        <FontAwesome5 name="database" size={20} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[calendarStyles.debugButton, { backgroundColor: '#e74c3c' }]}
        onPress={handleClearAllData}
      >
        <MaterialIcons name="clear-all" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};
