import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarEvent, useCalendarStore } from '@/store/CalendarStore';
import { useToastStore } from '@/store/ToastStore';
import { parseTimeString } from '@/services/calendarService';

/**
 * Custom hook for managing calendar events
 */
export const useCalendarEvents = (selectedDate: Date | null) => {
  const { events, addEvent, updateEvent, deleteEvent } = useCalendarStore();
  const { showToast } = useToastStore();
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [selectedType, setSelectedType] = useState<CalendarEvent['type']>('personal');
  const [notifyOnDay, setNotifyOnDay] = useState<boolean>(true);
  const [notifyBefore, setNotifyBefore] = useState<boolean>(false);
  const [notifyBeforeTime, setNotifyBeforeTime] = useState<string>('1h');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Update selected events when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const dayEvents = events.filter((event) => event.date === dateKey);
      setSelectedEvents(dayEvents);
    } else {
      setSelectedEvents([]);
    }
  }, [selectedDate, events]);

  /**
   * Handle adding or updating an event
   */
  const handleAddEvent = () => {
    if (selectedDate && newEventTitle.trim()) {
      if (editingEvent) {
        if (editingEvent.type === 'birthday') return;
        updateEvent(editingEvent.id, {
          title: newEventTitle.trim(),
          time: parseTimeString(newEventTime),
          type: editingEvent.type,
          notifyOnDay,
          notifyBefore,
          notifyBeforeTime: notifyBefore ? notifyBeforeTime : undefined,
        });
        
        // Schedule notifications for the updated event
        const updatedEvent: CalendarEvent = {
          ...editingEvent,
          title: newEventTitle.trim(),
          time: parseTimeString(newEventTime),
          notifyOnDay,
          notifyBefore,
          notifyBeforeTime: notifyBefore ? notifyBeforeTime : undefined,
          updatedAt: new Date().toISOString(),
        };
        
        useCalendarStore.getState().scheduleEventNotifications(updatedEvent);
      } else {
        const newEvent = {
          date: selectedDate.toISOString().split('T')[0],
          title: newEventTitle.trim(),
          type: selectedType,
          description: newEventDescription.trim(),
          time: parseTimeString(newEventTime),
          notifyOnDay,
          notifyBefore,
          notifyBeforeTime: notifyBefore ? notifyBeforeTime : undefined,
        };
        
        addEvent(newEvent);
        
        // Schedule notifications for the new event
        // This is also handled in EventModal's handleAddEventWithNotifications
      }
      
      // Reset form
      resetForm();
      
      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      return true;
    }
    return false;
  };

  /**
   * Handle editing an event
   */
  const handleEditEvent = (event: CalendarEvent) => {
    if (event.type === 'birthday') return false;
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setNewEventDescription(event.description || '');
    setNewEventTime(event.time || '');
    setNotifyOnDay(event.notifyOnDay ?? true);
    setNotifyBefore(event.notifyBefore ?? false);
    setNotifyBeforeTime(event.notifyBeforeTime || '1h');
    return true;
  };

  /**
   * Handle deleting an event
   */
  const handleDeleteEvent = (eventId: string) => {
    const event = selectedEvents.find((e) => e.id === eventId);
    if (event?.type === 'birthday') return false;
    
    deleteEvent(eventId);
    setSelectedEvents(selectedEvents.filter((event) => event.id !== eventId));
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    return true;
  };

  /**
   * Reset the form state
   */
  const resetForm = () => {
    setNewEventTitle('');
    setNewEventDescription('');
    setEditingEvent(null);
    setSelectedType('personal');
    setNotifyOnDay(true);
    setNotifyBefore(false);
    setNotifyBeforeTime('1h');
  };

  return {
    selectedEvents,
    newEventTitle,
    setNewEventTitle,
    newEventDescription,
    setNewEventDescription,
    newEventTime,
    setNewEventTime,
    selectedType,
    setSelectedType,
    notifyOnDay,
    setNotifyOnDay,
    notifyBefore,
    setNotifyBefore,
    notifyBeforeTime,
    setNotifyBeforeTime,
    editingEvent,
    setEditingEvent,
    handleAddEvent,
    handleEditEvent,
    handleDeleteEvent,
    resetForm,
  };
};
