import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Platform, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CalendarEvent, useCalendarStore } from '@/store/CalendarStore'
import { EventPreview } from './EventPreview'
import { calendarStyles } from './CalendarStyles'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { useUserStore } from '@/store/UserStore'

// Define notification time options
const NOTIFICATION_TIME_OPTIONS = [
  { label: '15 minutes', value: '15m' },
  { label: '30 minutes', value: '30m' },
  { label: '1 hour', value: '1h' },
  { label: '2 hours', value: '2h' },
  { label: '4 hours', value: '4h' },
  { label: '1 day', value: '1d' },
  { label: '2 days', value: '2d' },
  { label: '1 week', value: '7d' },
];

interface EventModalProps {
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
  closeEventModals: () => void
  openEventModal: () => void
  isDark: boolean
  primaryColor: string
}

export const EventModal: React.FC<EventModalProps> = ({
  isEventModalVisible,
  isViewEventModalVisible,
  selectedDate,
  selectedEvents,
  newEventTitle,
  setNewEventTitle,
  newEventTime,
  setNewEventTime,
  selectedType,
  setSelectedType,
  notifyOnDay: propNotifyOnDay,
  setNotifyOnDay: propSetNotifyOnDay,
  notifyBefore: propNotifyBefore,
  setNotifyBefore: propSetNotifyBefore,
  notifyBeforeTime: propNotifyBeforeTime,
  setNotifyBeforeTime: propSetNotifyBeforeTime,
  editingEvent,
  handleAddEvent,
  handleEditEvent,
  handleDeleteEvent,
  closeEventModals,
  openEventModal,
  isDark,
  primaryColor,
}) => {
  const isWeb = Platform.OS === 'web'
  const { scheduleEventNotifications } = useCalendarStore()
  const { preferences } = useUserStore()
  
  // State for notification settings (fallback if props not provided)
  const [localNotifyOnDay, setLocalNotifyOnDay] = useState<boolean>(editingEvent?.notifyOnDay ?? false)
  const [localNotifyBefore, setLocalNotifyBefore] = useState<boolean>(editingEvent?.notifyBefore ?? false)
  const [localNotifyBeforeTime, setLocalNotifyBeforeTime] = useState(editingEvent?.notifyBeforeTime || '1h')
  const [showTimeOptions, setShowTimeOptions] = useState(false)
  
  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedTimeDate, setSelectedTimeDate] = useState(new Date())

  // Use either props or local state
  const notifyOnDay = propNotifyOnDay !== undefined ? propNotifyOnDay : localNotifyOnDay
  const setNotifyOnDay = propSetNotifyOnDay || setLocalNotifyOnDay
  const notifyBefore = propNotifyBefore !== undefined ? propNotifyBefore : localNotifyBefore
  const setNotifyBefore = propSetNotifyBefore || setLocalNotifyBefore
  const notifyBeforeTime = propNotifyBeforeTime || localNotifyBeforeTime
  const setNotifyBeforeTime = propSetNotifyBeforeTime || setLocalNotifyBeforeTime

  // Create a style object that works for both platforms
  const modalBackgroundStyle = {
    backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
    ...(isWeb && {
      maxWidth: 600,
      alignSelf: 'center' as const, // Type assertion to ensure it's recognized as a valid FlexAlignType
      borderRadius: 8,
    }),
  }

  const textColor = isDark ? '#ffffff' : '#000000'
  
  // Enhanced add event handler that includes notification scheduling
  const handleAddEventWithNotifications = async () => {
    // Call the original handleAddEvent function
    handleAddEvent()
    
    // Schedule notifications if needed
    if (selectedDate) {
      const eventToSchedule: CalendarEvent = {
        id: Math.random().toString(36).substr(2, 9), // This will be replaced by the actual ID in the store
        date: selectedDate.toISOString().split('T')[0],
        time: newEventTime,
        title: newEventTitle,
        type: selectedType,
        notifyOnDay,
        notifyBefore,
        notifyBeforeTime: notifyBefore ? notifyBeforeTime : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Schedule notifications for this event
      await scheduleEventNotifications(eventToSchedule)
    }
    
    // Close the modal after adding the event
    closeEventModals()
  }

  return (
    <>
      {/* View Events Modal */}
      <Modal
        visible={isViewEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEventModals}
      >
        <View style={calendarStyles.modalContainer}>
          <View style={[calendarStyles.modalContent, modalBackgroundStyle]}>
            {/* Close (X) button at top-right */}
            <TouchableOpacity
              onPress={closeEventModals}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.1)',
                zIndex: 10,
              }}
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#fff' : '#000'}
              />
            </TouchableOpacity>

            <Text
              style={[
                calendarStyles.modalTitle,
                {
                  fontFamily: '$body',
                  color: textColor,
                  marginTop: 60,
                  paddingLeft: 24,
                  paddingVertical: 10
                },
              ]}
            >
              Events for {selectedDate?.toLocaleDateString()}
            </Text>

            <ScrollView
              style={[
              {
                paddingHorizontal: 24,
                paddingVertical: 6
              },
       
          ]}
              showsVerticalScrollIndicator={false}
            >
              {selectedEvents.map((event) => (
                <EventPreview
                  key={event.id}
                  event={event}
                  onEdit={() => handleEditEvent(event)}
                  onDelete={() => handleDeleteEvent(event.id)}
                  isDark={isDark}
                  primaryColor={primaryColor}
                />
              ))}
            </ScrollView>

            {/* Plus (+) button at bottom-right to add event */}
            <TouchableOpacity
              onPress={openEventModal}
              style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: primaryColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Event Modal */}
      <Modal
        visible={isEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEventModals}
      >
        <View style={calendarStyles.modalContainer}>
          <View style={[calendarStyles.modalContent, modalBackgroundStyle]}>
            {/* Close (X) button at top-right */}
            <TouchableOpacity
              onPress={closeEventModals}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#fff' : '#000'}
              />
            </TouchableOpacity>

            <Text
              style={[
                calendarStyles.modalTitle,
                {
                  fontFamily: '$body',
                  color: textColor,
                  marginTop: 20,
                  paddingLeft: 24,
                  paddingVertical: 10,
                  fontSize: 22,
                  fontWeight: '600'
                },
              ]}
            >
              {editingEvent ? 'Edit Event' : 'Add Event'} for{' '}
              {selectedDate?.toLocaleDateString()}
            </Text>

            <ScrollView
              style={calendarStyles.formScrollView}
              showsVerticalScrollIndicator={false} 
            >
              <View style={calendarStyles.formGroup}>
                <TextInput
                  style={[
                    calendarStyles.input,
                    { fontFamily: '$body', color: textColor },
                  ]}
                  placeholder="Event Title"
                  placeholderTextColor={isDark ? '#888888' : '#666666'}
                  value={newEventTitle}
                  onChangeText={setNewEventTitle}
                />
                {/* Time selector button */}
                <TouchableOpacity
                  style={[
                    calendarStyles.input,
                    { 
                      fontFamily: '$body', 
                      color: textColor,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingRight: 12
                    } as any,
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={{ 
                    fontFamily: '$body', 
                    color: newEventTime ? textColor : isDark ? '#888888' : '#666666',
                    fontSize: 16
                  }}>
                    {newEventTime || "Event Time (CT)"}
                  </Text>
                  <Ionicons name="time-outline" size={20} color={textColor} />
                </TouchableOpacity>
                
                {/* Time picker modal */}
                {showTimePicker && (
                  <Modal
                    transparent
                    visible={showTimePicker}
                    animationType="fade"
                    onRequestClose={() => setShowTimePicker(false)}
                  >
                    <View style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                    }}>
                      <View style={{
                        width: '80%',
                        backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                        borderRadius: 12,
                        padding: 20,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                      }}>
                        <Text style={{ 
                          fontFamily: '$body',
                          color: textColor, 
                          fontSize: 18, 
                          fontWeight: 'bold',
                          marginBottom: 20
                        }}>
                          Select Time
                        </Text>
                        
                        {Platform.OS === 'web' ? (
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            width: '100%',
                            marginBottom: 20
                          }}>
                            <input
                              type="time"
                              value={format(selectedTimeDate, 'HH:mm')}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                const newDate = new Date(selectedTimeDate);
                                newDate.setHours(hours);
                                newDate.setMinutes(minutes);
                                setSelectedTimeDate(newDate);
                                setNewEventTime(format(newDate, 'h:mm a'));
                              }}
                              style={{
                                padding: 12,
                                fontSize: 16,
                                borderRadius: 8,
                                border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                                backgroundColor: isDark ? '#222' : '#fff',
                                color: isDark ? '#fff' : '#000',
                                width: '100%',
                                marginRight: 10
                              }}
                            />
                          </View>
                        ) : (
                          <View style={{ height: 200, marginBottom: 20 }}>
                            <DateTimePicker
                              value={selectedTimeDate}
                              mode="time"
                              is24Hour={false}
                              onChange={(event, date) => {
                                if (date) {
                                  setSelectedTimeDate(date);
                                  setNewEventTime(format(date, 'h:mm a'));
                                }
                              }}
                              display="spinner"
                              themeVariant={isDark ? "dark" : "light"}
                            />
                          </View>
                        )}
                        
                        <TouchableOpacity
                          style={{
                            backgroundColor: primaryColor,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 8,
                            alignSelf: 'flex-end'
                          }}
                          onPress={() => setShowTimePicker(false)}
                        >
                          <Text style={{ fontFamily: '$body', color: 'white', fontWeight: 'bold' }}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                )}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={calendarStyles.typeSelector}
                >
                  {['personal', 'work', 'family', 'wealth', 'health'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        calendarStyles.typeButton,
                        {
                          backgroundColor:
                            type === selectedType
                              ? primaryColor
                              : isDark
                              ? '#333333'
                              : '#f0f0f0',
                          marginRight: 8,
                          paddingHorizontal: 12,
                          height: 36,
                          minWidth: 0
                        },
                      ]}
                      onPress={() =>
                        setSelectedType(type as CalendarEvent['type'])
                      }
                    >
                      <Text
                        style={[
                          calendarStyles.typeButtonText,
                          {
                            fontFamily: '$body',
                            color:
                              type === selectedType
                                ? '#ffffff'
                                : isDark
                                ? '#ffffff'
                                : '#000000',
                            fontSize: 14,
                            fontWeight: '500'
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* Notification Options */}
                <View style={{ marginTop: 20, paddingHorizontal: 4 }}>
                  {/* Notify on day of event */}
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                    borderRadius: 8
                  }}>
                    <Text style={{ fontFamily: '$body', color: textColor }}>
                      Notify on day of event
                    </Text>
                    <Switch
                      value={notifyOnDay}
                      onValueChange={setNotifyOnDay}
                      trackColor={{ false: '#767577', true: primaryColor }}
                      thumbColor={notifyOnDay ? '#f4f3f4' : '#f4f3f4'}
                    />
                  </View>
                  
                  {/* Notify before event */}
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                    borderRadius: 8
                  }}>
                    <Text style={{ fontFamily: '$body', color: textColor }}>
                      Notify before event
                    </Text>
                    <Switch
                      value={notifyBefore}
                      onValueChange={setNotifyBefore}
                      trackColor={{ false: '#767577', true: primaryColor }}
                      thumbColor={notifyBefore ? '#f4f3f4' : '#f4f3f4'}
                    />
                  </View>
                  
                  {/* Time before event dropdown */}
                  {notifyBefore && (
                    <View style={{ position: 'relative', marginBottom: Platform.OS === 'web' ? 0 : 160 }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 12,
                          backgroundColor: isDark ? '#333333' : '#f0f0f0',
                          borderRadius: 8,
                          marginTop: 8,
                        }}
                        onPress={() => setShowTimeOptions(!showTimeOptions)}
                      >
                        <Text style={{ fontFamily: '$body', color: textColor }}>
                          {NOTIFICATION_TIME_OPTIONS.find(option => option.value === notifyBeforeTime)?.label || 'Select time'}
                        </Text>
                        <Ionicons
                          name={showTimeOptions ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={textColor}
                        />
                      </TouchableOpacity>
                      
                      {showTimeOptions && (
                        <View style={{
                          position: Platform.OS === 'web' ? 'absolute' : 'relative',
                          top: Platform.OS === 'web' ? '100%' : 0,
                          left: 0,
                          right: 0,
                          backgroundColor: isDark ? '#222222' : '#ffffff',
                          borderRadius: 8,
                          marginTop: 4,
                          zIndex: 1000,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                        }}>
                          <ScrollView style={{ maxHeight: Platform.OS === 'web' ? 200 : 125 }}>
                            {NOTIFICATION_TIME_OPTIONS.map(option => (
                              <TouchableOpacity
                                key={option.value}
                                style={{
                                  padding: 12,
                                  borderBottomWidth: 1,
                                  borderBottomColor: isDark ? '#333333' : '#f0f0f0',
                                  backgroundColor: notifyBeforeTime === option.value 
                                    ? primaryColor 
                                    : 'transparent'
                                }}
                                onPress={() => {
                                  setNotifyBeforeTime(option.value);
                                  setShowTimeOptions(false);
                                }}
                              >
                                <Text style={{ 
                                  fontFamily: '$body', 
                                  color: notifyBeforeTime === option.value 
                                    ? '#ffffff' 
                                    : textColor 
                                }}>
                                  {option.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            <View style={calendarStyles.bottomButtonContainer}>
            <View style={[calendarStyles.modalButtons, { justifyContent: 'flex-end', alignItems: 'center' }]}>
              <TouchableOpacity
                style={[
                  calendarStyles.bigActionButton,
                  calendarStyles.cancelButton,
                  { minWidth: 100, marginRight: 12 },
                ]}
                onPress={closeEventModals}
              >
                <Text style={[calendarStyles.bigButtonText, { fontFamily: '$body' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  calendarStyles.bigActionButton,
                  { backgroundColor: primaryColor, minWidth: 100 },
                ]}
                onPress={handleAddEventWithNotifications}
              >
                <Text style={[calendarStyles.bigButtonText, { fontFamily: '$body' }]}>
                  {editingEvent ? 'Update' : 'Add'} Event
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          </View>
        </View>
      </Modal>
    </>
  )
}
