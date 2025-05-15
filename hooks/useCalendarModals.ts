import { useState } from 'react';
import { getCurrentRoundedTime } from '@/services';

/**
 * Custom hook for managing calendar modals
 */
export const useCalendarModals = () => {
  // Modal visibility states
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isViewEventModalVisible, setIsViewEventModalVisible] = useState(false);
  const [debugModalVisible, setDebugModalVisible] = useState(false);
  
  // Debug data state
  const [debugData, setDebugData] = useState<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    vaultEntries: number;
    upcomingEvents: { title: string; date: string; type: string }[];
  } | null>(null);

  // Initialize with current time rounded to nearest 30 minutes
  const [newEventTime, setNewEventTime] = useState(getCurrentRoundedTime());

  /**
   * Open the add/edit event modal
   */
  const openEventModal = () => {
    setIsViewEventModalVisible(false);
    setIsEventModalVisible(true);
  };

  /**
   * Open the view events modal
   */
  const openViewEventModal = () => {
    setIsEventModalVisible(false);
    setIsViewEventModalVisible(true);
  };

  /**
   * Close all event modals
   */
  const closeEventModals = () => {
    setIsEventModalVisible(false);
    setIsViewEventModalVisible(false);
  };

  /**
   * Open the debug modal with data
   */
  const openDebugModal = (data: typeof debugData) => {
    setDebugData(data);
    setDebugModalVisible(true);
  };

  /**
   * Close the debug modal
   */
  const closeDebugModal = () => {
    setDebugModalVisible(false);
  };

  return {
    // Modal visibility states
    isEventModalVisible,
    setIsEventModalVisible,
    isViewEventModalVisible,
    setIsViewEventModalVisible,
    debugModalVisible,
    setDebugModalVisible,
    
    // Event time state
    newEventTime,
    setNewEventTime,
    
    // Debug data state
    debugData,
    setDebugData,
    
    // Modal control functions
    openEventModal,
    openViewEventModal,
    closeEventModals,
    openDebugModal,
    closeDebugModal,
  };
};
