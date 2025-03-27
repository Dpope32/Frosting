import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, Switch, Dimensions, Modal } from 'react-native'
import { isWeb } from 'tamagui'
import DateTimePicker from '@react-native-community/datetimepicker'
import Animated, { FadeIn } from 'react-native-reanimated'
import { format, parse } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'

import { CalendarEvent, useCalendarStore } from '@/store/CalendarStore'
import { useToastStore } from '@/store/ToastStore'
import { EventPreview } from './EventPreview'
import { BaseCardAnimated } from '../cardModals/BaseCardAnimated'
import { styles } from './EventStyles'
import { EventModalProps } from '../../types/modal'
import { NOTIFICATION_TIME_OPTIONS } from '@/constants/notifications'

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
  resetForm,
  closeEventModals,
  openEventModal,
  isDark,
  primaryColor,
}) => {
  const { scheduleEventNotifications } = useCalendarStore()
  const [localNotifyOnDay, setLocalNotifyOnDay] = useState<boolean>(editingEvent?.notifyOnDay ?? false)
  const [localNotifyBefore, setLocalNotifyBefore] = useState<boolean>(editingEvent?.notifyBefore ?? false)
  const [localNotifyBeforeTime, setLocalNotifyBeforeTime] = useState<string>(editingEvent?.notifyBeforeTime || '1h')
  const [showTimeOptions, setShowTimeOptions] = useState<boolean>(false)
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false)
  const [selectedTimeDate, setSelectedTimeDate] = useState<Date>(new Date())
  const notifyOnDay = propNotifyOnDay !== undefined ? propNotifyOnDay : localNotifyOnDay
  const setNotifyOnDay = propSetNotifyOnDay || setLocalNotifyOnDay
  const notifyBefore = propNotifyBefore !== undefined ? propNotifyBefore : localNotifyBefore
  const setNotifyBefore = propSetNotifyBefore || setLocalNotifyBefore
  const notifyBeforeTime = propNotifyBeforeTime || localNotifyBeforeTime
  const setNotifyBeforeTime = propSetNotifyBeforeTime || setLocalNotifyBeforeTime
  const textColor = isDark ? '#ffffff' : '#000000'
  const { showToast } = useToastStore()
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height
  const modalWidth = isWeb ? Math.min(screenWidth * 0.7, 800) : Math.min(screenWidth * 0.85, 400)
  const getViewModalMaxWidth = () => { return isWeb ? Math.min(screenWidth * 0.7, 800) : Math.min(screenWidth * 0.85, 400)}
  const noScrollbar = isWeb ? { overflow: 'hidden' as const } : {}

  const handleAddEventWithNotifications = async () => {
    try {
      await handleAddEvent()
      if (selectedDate) {
        const eventToSchedule: CalendarEvent = {
          id: Math.random().toString(36).substr(2, 9),
                  date: selectedDate?.toISOString().split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
                  time: newEventTime || undefined,
          title: newEventTitle,
          type: selectedType,
          notifyOnDay,
          notifyBefore,
          notifyBeforeTime: notifyBefore ? notifyBeforeTime : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await scheduleEventNotifications(eventToSchedule)
      }
      showToast('Event saved successfully', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to save event', 'error')
    } finally {
      closeEventModals()
    }
  }

  const handleAddNewEvent = () => {
    resetForm()
    closeEventModals()
    setTimeout(() => {
      openEventModal()
    }, 300)
  }

  return (
    <>
      <BaseCardAnimated
        open={isViewEventModalVisible}
        onOpenChange={closeEventModals}
        title={`Events for ${selectedDate?.toLocaleDateString() || ''}`}
        modalWidth={getViewModalMaxWidth()}
        modalMaxWidth={getViewModalMaxWidth()}
      >
        <View style={{ paddingBottom: 50, ...noScrollbar }}>
          <ScrollView
            style={{
              paddingHorizontal: 4,
              paddingVertical: 6,
              maxHeight: screenHeight * 0.6
            }}
            showsVerticalScrollIndicator={!isWeb}
          >
              {selectedEvents
                .slice()
                .sort((a, b) => {
                  // Handle events without time (they should come last in descending order)
                  if (!a.time && !b.time) return 0;
                  if (!a.time) return 1; // Events without time come last
                  if (!b.time) return -1; // Events without time come last
                  
                  // Both have times - parse and compare
                  const timeA = parse(a.time, 'h:mm a', selectedDate || new Date());
                  const timeB = parse(b.time, 'h:mm a', selectedDate || new Date());
                  return timeB.getTime() - timeA.getTime(); // Reversed to sort latest to earliest
                })
                .map((event) => (
                  <Animated.View
                    key={event.id}
                    entering={FadeIn.duration(300).delay(100)}
                  >
                    <EventPreview
                      event={event}
                      onEdit={() => handleEditEvent(event)}
                      onDelete={() => handleDeleteEvent(event.id)}
                      isDark={isDark}
                      primaryColor={primaryColor}
                    />
                  </Animated.View>
                ))}
          </ScrollView>
          <TouchableOpacity
            onPress={handleAddNewEvent}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: primaryColor,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={24} color="#fffbf7" />
          </TouchableOpacity>
        </View>
      </BaseCardAnimated>

      {isEventModalVisible && (
        <Modal
          visible={isEventModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeEventModals}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                  width: modalWidth
                }
              ]}
            >
              <View style={styles.headerContainer}>
                <Text style={[styles.headerText, { color: textColor }]}>
                  {`${editingEvent ? 'Edit' : 'Add'} Event for ${selectedDate?.toLocaleDateString() || ''}`}
                </Text>
              </View>

              <ScrollView style={[styles.formContainer, noScrollbar]} showsVerticalScrollIndicator={!isWeb}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#333333' : '#f5f5f5',
                      color: textColor,
                      borderColor: isDark ? '#444444' : '#dddddd'
                    }
                  ]}
                  placeholder="Event Title"
                  placeholderTextColor={isDark ? '#888888' : '#666666'}
                  value={newEventTitle}
                  onChangeText={setNewEventTitle}
                />

                <TouchableOpacity
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#333333' : '#f5f5f5',
                      borderColor: isDark ? '#444444' : '#dddddd',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={{ color: newEventTime ? textColor : isDark ? '#888888' : '#666666' }}>
                    {newEventTime || 'Event Time (CT)'}
                  </Text>
                  <Ionicons name="time-outline" size={18} color={textColor} />
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { color: textColor }]}>Event Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesContainer}>
                  {['personal', 'work', 'family', 'task', 'health'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor:
                            type === selectedType ? primaryColor : isDark ? '#333333' : '#f0f0f0'
                        }
                      ]}
                      onPress={() => setSelectedType(type as CalendarEvent['type'])}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          {
                            color: type === selectedType ? '#ffffff' : textColor
                          }
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.sectionTitle, { color: textColor }]}>Notifications</Text>
                <View
                  style={[
                    styles.notificationContainer,
                    {
                      backgroundColor: isDark ? '#333333' : '#f5f5f5',
                      borderColor: isDark ? '#444444' : '#dddddd'
                    }
                  ]}
                >
                  <View style={styles.switchRow}>
                    <Text style={[styles.switchLabel, { color: textColor }]}>Notify on day of event</Text>
                    <Switch
                      value={notifyOnDay}
                      onValueChange={setNotifyOnDay}
                      trackColor={{ false: '#767577', true: primaryColor }}
                      thumbColor="#f4f3f4"
                    />
                  </View>

                  <View style={styles.switchRow}>
                    <Text style={[styles.switchLabel, { color: textColor }]}>Notify before event</Text>
                    <Switch
                      value={notifyBefore}
                      onValueChange={setNotifyBefore}
                      trackColor={{ false: '#767577', true: primaryColor }}
                      thumbColor="#f4f3f4"
                    />
                  </View>

                  {notifyBefore && (
                    <TouchableOpacity
                      style={[
                        styles.dropdownButton,
                        {
                          backgroundColor: isDark ? '#444444' : '#e0e0e0',
                          borderColor: isDark ? '#555555' : '#cccccc'
                        }
                      ]}
                      onPress={() => setShowTimeOptions(!showTimeOptions)}
                    >
                      <Text style={{ color: textColor }}>
                        {NOTIFICATION_TIME_OPTIONS.find((option) => option.value === notifyBeforeTime)?.label ||
                          'Select time'}
                      </Text>
                      <Ionicons
                        name={showTimeOptions ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={textColor}
                      />
                    </TouchableOpacity>
                  )}

                  {showTimeOptions && (
                    <View
                      style={[
                        styles.dropdown,
                        {
                          backgroundColor: isDark ? '#222222' : '#ffffff',
                          borderColor: isDark ? '#444444' : '#dddddd'
                        }
                      ]}
                    >
                      {NOTIFICATION_TIME_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.dropdownItem,
                            {
                              backgroundColor:
                                notifyBeforeTime === option.value ? primaryColor : 'transparent',
                              borderBottomColor: isDark ? '#333333' : '#f0f0f0'
                            }
                          ]}
                          onPress={() => {
                            setNotifyBeforeTime(option.value)
                            setShowTimeOptions(false)
                          }}
                        >
                          <Text
                            style={{
                              color: notifyBeforeTime === option.value ? '#ffffff' : textColor
                            }}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { backgroundColor: isDark ? '#444444' : '#e0e0e0' }
                  ]}
                  onPress={closeEventModals}
                >
                  <Text style={[styles.buttonText, { color: isDark ? '#ffffff' : '#000000' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: primaryColor }]}
                  onPress={handleAddEventWithNotifications}
                >
                  <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                    {editingEvent ? 'Update' : 'Add Event'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showTimePicker && (
        <Modal
          transparent
          visible={showTimePicker}
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.timePickerContainer,
                {
                  backgroundColor: isDark ? '#1e1e1e' : '#fffbf7',
                  width: modalWidth
                }
              ]}
            >
              <Text style={[styles.timePickerTitle, { color: textColor }]}>Select Time</Text>

              {Platform.OS === 'web' ? (
                <View style={styles.webTimePicker}>
                  <input
                    type="time"
                    value={format(selectedTimeDate, 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number)
                      const newDate = new Date(selectedTimeDate)
                      newDate.setHours(hours)
                      newDate.setMinutes(minutes)
                      setSelectedTimeDate(newDate)
                      setNewEventTime(format(newDate, 'h:mm a'))
                    }}
                    style={{
                      padding: 10,
                      fontSize: 14,
                      borderRadius: 8,
                      border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                      backgroundColor: isDark ? '#222' : '#fffbf7',
                      color: isDark ? '#fff' : '#000',
                      width: '100%'
                    }}
                  />
                </View>
              ) : (
                <View style={styles.nativeTimePicker}>
                  <DateTimePicker
                    value={selectedTimeDate}
                    mode="time"
                    is24Hour={false}
                    onChange={(event, date) => {
                      if (date) {
                        setSelectedTimeDate(date)
                        setNewEventTime(format(date, 'h:mm a'))
                      }
                    }}
                    display="spinner"
                    themeVariant={isDark ? 'dark' : 'light'}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.doneButton, { backgroundColor: primaryColor }]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  )
}
