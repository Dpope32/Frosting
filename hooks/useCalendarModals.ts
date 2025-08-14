import { useState } from 'react';
import { getCurrentRoundedTime } from '@/services';
import { useCalendarViewStore } from '@/store';

export const useCalendarModals = () => {
  // Move modal state to global store
  const {
    isEventModalVisible,
    isViewEventModalVisible,
    debugModalVisible,
    debugData,
    setIsEventModalVisible,
    setIsViewEventModalVisible,
    setDebugModalVisible,
    setDebugData,
    openEventModal,
    openViewEventModal,
    closeEventModals,
    openDebugModal,
    closeDebugModal,
  } = useCalendarViewStore();

  // Keep newEventTime as local state since it's specific to the calendar component
  const [newEventTime, setNewEventTime] = useState(getCurrentRoundedTime());

  return {
    isEventModalVisible,
    setIsEventModalVisible,
    isViewEventModalVisible,
    setIsViewEventModalVisible,
    debugModalVisible,
    setDebugModalVisible,
    newEventTime,
    setNewEventTime,
    debugData,
    setDebugData,
    openEventModal,
    openViewEventModal,
    closeEventModals,
    openDebugModal,
    closeDebugModal,
  };
};
