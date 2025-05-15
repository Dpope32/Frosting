import React from 'react';
import { View, TouchableOpacity, Alert, Platform } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCalendarStore, CalendarEvent } from '@/store/CalendarStore';
import { useBillStore } from '@/store/BillStore';
import { useToastStore } from '@/store/ToastStore';
import { useVaultStore } from '@/store/VaultStore';
import { generateBillEvents, generateRandomTime } from '@/services';
import { getCalendarStyles } from './CalendarStyles';

interface DebugToolsProps {
  openDebugModal: (data: any) => void;
  isDev: boolean;
  webColumnCount: number;
}

export const DebugTools: React.FC<DebugToolsProps> = ({ openDebugModal, isDev, webColumnCount }) => {
  const { showToast } = useToastStore();
  
  if (!isDev) return null;

  const handleShowDebugInfo = async () => {
    try {
      console.log("Loading debug information");
      const store = useCalendarStore.getState();
      console.log(`Total events in store: ${store.events.length}`);
      
      // Get vault data directly from the store for more accurate count
      const vaultStore = useVaultStore.getState();
      const vaultEntries = vaultStore.getEntries();
      console.log(`Vault entries from store: ${vaultEntries.length}`);
      
      // Log event types distribution
      const eventsByType = store.events.reduce((acc, event) => {
        const type = event.type || 'personal';
        if (!acc[type]) acc[type] = 0;
        acc[type] += 1;
        return acc;
      }, { personal: 0, work: 0, family: 0, birthday: 0, bill: 0, nba: 0, wealth: 0, health: 0, holiday: 0, task: 0 });
      
      console.log("Events by type:", eventsByType);
      
      const info = {
        totalEvents: store.events.length,
        eventsByType,
        vaultEntries: vaultEntries.length, // Use actual length from store
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
      console.log("Starting test data generation");
      const { addEvent } = useCalendarStore.getState();
      const today = new Date();

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
      
      const healthEvents = [
        'Annual Checkup', 'Dentist Cleaning', 'Eye Exam', 'Nutritionist Appointment',
        'Physical Therapy', 'Mental Health Check', 'Yoga Class', 'Meditation Session',
        'Running Plan', 'Meal Prep'
      ];
      
      const wealthEvents = [
        'Investment Review', 'Budget Planning', 'Tax Planning', 'Financial Advisor Meeting',
        'Retirement Planning', 'Mortgage Review', 'Insurance Check', 'Savings Goal Check',
        'Credit Score Review', 'Expense Audit'
      ];

      const bills = [
        'Rent', 'Mortgage', 'Electricity Bill', 'Water Bill', 'Internet Bill',
        'Phone Bill', 'Gas', 'Car Insurance', 'Health Insurance', 'Credit Card',
        'Gym Membership', 'Streaming Services'
      ];
      
      // More birthdays for testing
      const birthdays = [];
      const names = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Alex', 'Maria', 'James', 'Anna'];
      
      for (let i = 0; i < 10; i++) {
        const birthMonth = (today.getMonth() + i + 1) % 12;
        const birthDay = Math.floor(Math.random() * 28) + 1;
        const age = Math.floor(Math.random() * 40) + 20;
        
        birthdays.push({
          date: new Date(today.getFullYear(), birthMonth, birthDay).toISOString().split('T')[0],
          title: `🎂 ${names[i]}'s Birthday`,
          type: 'birthday' as CalendarEvent['type'],
          description: `${names[i]} turns ${age} today!`,
          personId: `test-person-${i}`,
          notifyOnDay: true
        });
      }

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
        return events.map((title, index) => {
          // Generate a date that's between 0 and 60 days from now
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + index * 3 + Math.floor(Math.random() * 5)); 
          
          return {
            date: futureDate.toISOString().split('T')[0],
            time: generateRandomTime(),
            title,
            type,
            description: `Test ${type} event: ${title}`
          };
        });
      };

      console.log("Generating personal, work, family, health, and wealth events");
      const newEvents = [
        ...generateEvents(personalEvents, 'personal'),
        ...generateEvents(workEvents, 'work'),
        ...generateEvents(familyEvents, 'family'),
        ...generateEvents(healthEvents, 'health'),
        ...generateEvents(wealthEvents, 'wealth')
      ];

      console.log(`Adding ${newEvents.length} general events`);
      newEvents.forEach(event => addEvent(event));
      
      console.log(`Adding ${bills.length} bills`);
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

      console.log(`Adding ${birthdays.length} birthday events`);
      birthdays.forEach(event => addEvent(event));

      // Use VaultStore to add password entries
      console.log(`Adding ${passwords.length} vault entries`);
      const { addEntry } = useVaultStore.getState();
      
      // Add each password entry using the store's method
      for (const entry of passwords) {
        await addEntry(entry);
      }

        // In the setTimeout function, update the eventsByType initialization:
        setTimeout(() => {
          const store = useCalendarStore.getState();
          const eventsByType = store.events.reduce((acc, event) => {
            const type = event.type || 'personal';
            if (!acc[type]) acc[type] = 0;
            acc[type] += 1;
            return acc;
          }, { personal: 0, work: 0, family: 0, birthday: 0, bill: 0, nba: 0, wealth: 0, health: 0, holiday: 0, task: 0 });
          
          console.log("Events by type after generation:", eventsByType);
          
          const vaultStore = useVaultStore.getState();
          console.log("Vault entries after generation:", vaultStore.getEntries().length);
        }, 1000);

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

  const styles = getCalendarStyles(webColumnCount);

  return (
    <View style={{ position: 'absolute', bottom: 32, left: 24, zIndex: 1000, flexDirection: 'row', gap: 12 }}>
      <TouchableOpacity
        style={styles.debugButton}
        onPress={handleShowDebugInfo}
      >
        <MaterialIcons name="bug-report" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.debugButton}
        onPress={handleGenerateTestData}
      >
        <FontAwesome5 name="database" size={20} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.debugButton}
        onPress={handleClearAllData}
      >
        <MaterialIcons name="clear-all" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};