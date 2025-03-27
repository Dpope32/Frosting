
import { CalendarEvent } from '@/store/CalendarStore'

export interface EventModalProps {
    isEventModalVisible: boolean
    isViewEventModalVisible: boolean
    selectedDate: Date | null
    selectedEvents: CalendarEvent[]
    newEventTitle: string
    setNewEventTitle: (title: string) => void
    newEventTime: string
    setNewEventTime: (time: string) => void
    selectedType: CalendarEvent['type']
    setSelectedType: (type: CalendarEvent['type']) => void
    notifyOnDay?: boolean
    setNotifyOnDay?: (value: boolean) => void
    notifyBefore?: boolean
    setNotifyBefore?: (value: boolean) => void
    notifyBeforeTime?: string
    setNotifyBeforeTime?: (value: string) => void
    editingEvent: CalendarEvent | null
    handleAddEvent: () => void
    handleEditEvent: (event: CalendarEvent) => void
    handleDeleteEvent: (eventId: string) => void
    resetForm: () => void
    closeEventModals: () => void
    openEventModal: () => void
    isDark: boolean
    primaryColor: string
  }