import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, Switch, Dimensions, Modal, Alert, StyleSheet } from 'react-native'
import { isWeb, XStack } from 'tamagui'
import { withOpacity } from '@/utils/styleUtils'
import DateTimePicker from '@react-native-community/datetimepicker'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { format, parse } from 'date-fns'
import { getCategoryColor } from '@/utils/styleUtils';
import { TaskCategory } from '@/types/task';
import { Ionicons } from '@expo/vector-icons'
import { useAutoFocus } from '@/hooks/useAutoFocus'

import { CalendarEvent, useCalendarStore } from '@/store/CalendarStore'
import { useToastStore } from '@/store/ToastStore'
import { EventPreview } from './EventPreview'
import { BaseCardAnimated } from '../baseModals/BaseCardAnimated'
import { styles } from './EventStyles'
import { EventModalProps } from '../../types/modal'
import { NOTIFICATION_TIME_OPTIONS } from '@/constants/notifications'
import { isIpad } from '@/utils/deviceUtils'
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
  const modalWidth = isWeb ? Math.min(screenWidth * 0.8, 600) : Math.min(screenWidth * 0.85, 400)
  const getViewModalMaxWidth = () => { return isWeb ? Math.min(screenWidth * 0.9, 700) : Math.min(screenWidth * 0.85, 400)}
  const noScrollbar = isWeb ? { overflow: 'hidden' as const } : {}
  const eventTitleInputRef = React.useRef<any>(null);
  useAutoFocus(eventTitleInputRef, 1000, isEventModalVisible);

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

  const handleDeleteEventWithConfirmation = (eventId: string) => {
    if (isWeb) {
      if (window.confirm('Are you sure you want to remove this event?')) {
        handleDeleteEvent(eventId)
        showToast('Successfully removed event!', 'success')
      }
    } else {
      Alert.alert(
        'Delete Event',
        'Are you sure you want to remove this event?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            onPress: () => {
              handleDeleteEvent(eventId)
              showToast('Successfully removed event!', 'success')
            },
            style: 'destructive'
          }
        ]
      )
    }
  }

  const handleEditEventInternal = (event: CalendarEvent) => {
    console.log('Edit event clicked:', event);
    setNewEventTitle(event.title);
    setNewEventTime(event.time || '');
    setSelectedType(event.type);
    setNotifyOnDay(event.notifyOnDay || false);
    setNotifyBefore(event.notifyBefore || false);
    setNotifyBeforeTime(event.notifyBeforeTime || '1h');
    closeEventModals();
    setTimeout(() => {
      openEventModal();
    }, 300);
  };

  return (
    <>
      {isViewEventModalVisible && (
        <BaseCardAnimated
          onClose={closeEventModals} 
          title={`Events for ${selectedDate?.toLocaleDateString() || ''}`}
          modalWidth={getViewModalMaxWidth()}
          modalMaxWidth={getViewModalMaxWidth()}
          visible={isViewEventModalVisible}
        >
          <View style={{ paddingBottom: 50, ...noScrollbar }}>
            <ScrollView
              style={{
                maxHeight: screenHeight * 0.77
              }}
              showsVerticalScrollIndicator={!isWeb}
            >
                {selectedEvents
                  ?.slice()
                  .sort((a, b) => {
                    if (!a.time && !b.time) return 0;
                    if (!a.time) return 1; 
                    if (!b.time) return -1; 
                    
                    const timeA = parse(a.time, 'h:mm a', selectedDate || new Date());
                    const timeB = parse(b.time, 'h:mm a', selectedDate || new Date());
                    return timeB.getTime() - timeA.getTime(); 
                  })
                  .map((event) => (
                    <Animated.View
                      key={event.id}
                      entering={FadeIn.duration(300).delay(100)}
                      exiting={FadeOut.duration(300).delay(100)}
                      style={{ marginBottom: 10 }}
                    >
                      <EventPreview
                        event={event}
                        onEdit={() => handleEditEventInternal(event)}
                        onDelete={() => handleDeleteEventWithConfirmation(event.id)}
                        isDark={isDark}
                        primaryColor={primaryColor}
                      />
                    </Animated.View>
                  ))}
            </ScrollView>
            <TouchableOpacity
              onPress={handleAddNewEvent}
              style={[styles.buttonEvent]}
            >
              <Text style={{ 
                position: 'absolute',
                color: '#ffffff', 
                fontSize: 32,
                top: '50%',
                left: '50%',
                transform: [
                  { translateX: -8 },
                  { translateY: -10 }
                ],
                fontWeight: '300'
              }}>+</Text>
            </TouchableOpacity>
          </View>
        </BaseCardAnimated>
      )}

      {isEventModalVisible && (
        <BaseCardAnimated
          onClose={closeEventModals}
          title={`${editingEvent ? 'Edit' : 'Add'} Event for ${selectedDate?.toLocaleDateString() || ''}`}
          modalWidth={modalWidth}
          modalMaxWidth={modalWidth}
          visible={isEventModalVisible}
        >
          <View style={{...noScrollbar }}>
            <ScrollView style={[styles.formContainer, noScrollbar]} showsVerticalScrollIndicator={!isWeb}>
              <TextInput
                ref={eventTitleInputRef}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#222222' : '#f5f5f5',
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
                  {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: isDark ? '#555555' : '#cccccc',
                    borderRadius: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                  }
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ color: newEventTime ? textColor : isDark ? '#888888' : '#666666', fontSize: 16 }}>
                  {newEventTime || 'Select Event Time'}
                </Text>
                <Ionicons name="time-outline" size={20} color={primaryColor} />
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16 }}>
                <XStack gap={isIpad() ? "$2" : "$1"}>
                  {['personal', 'work', 'family', 'task', 'health'].map((type) => {
                    const color = getCategoryColor(type as TaskCategory);
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          {
                            backgroundColor:
                              type === selectedType 
                                ? withOpacity(color, 0.15)
                                : isDark ? '#1f1f1f' : '#ffffff',
                            borderWidth: 1,
                            borderColor: type === selectedType 
                              ? 'transparent'
                              : isDark ? '#444444' : '#dddddd',
                            borderRadius: 20,
                            paddingHorizontal: 12,
                            paddingVertical: 12
                          }
                        ]}
                        onPress={() => setSelectedType(type as CalendarEvent['type'])}
                      >
                        <Text
                          style={[
                            styles.typeButtonText,
                            {
                              color: type === selectedType ? color : textColor,
                              fontWeight: type === selectedType ? '600' : '500'
                            }
                          ]}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </XStack>
              </ScrollView>

              <Text style={[styles.sectionTitle, { color: textColor }]}></Text>
              <View
                style={[
                  styles.notificationContainer,
                  {
                    backgroundColor: isDark ? 'transparent' : '#f5f5f5',
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
                <Text style={[styles.buttonText, { color: '#f1f1f1' }]}>
                  {editingEvent ? 'Update' : 'Add Event'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BaseCardAnimated>
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
