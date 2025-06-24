import React, { useState } from 'react'
import { View, TouchableOpacity, ScrollView, Platform, Switch, Dimensions, Modal } from 'react-native'
import { isWeb, XStack, Input, Button, YStack, Text } from 'tamagui'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { getCategoryColor, isIpad, withOpacity } from '@/utils';
import { TaskCategory } from '@/types';
import { Ionicons } from '@expo/vector-icons'
import { useAutoFocus } from '@/hooks/useAutoFocus'
import { CalendarEvent, useCalendarStore, useToastStore } from '@/store'
import { BaseCardAnimated } from '../baseModals/BaseCardAnimated'
import { styles } from './EventStyles'
import { EventModalProps } from '../../types/modal'
import { NOTIFICATION_TIME_OPTIONS } from '@/constants'
import { ViewEventModal } from './ViewEventModal'

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
  const modalWidth = isWeb ? Math.min(screenWidth * 0.8, 600) : Math.min(screenWidth * 0.85, 400)
  const noScrollbar = isWeb ? { overflow: 'hidden' as const } : {}
  const eventTitleInputRef = React.useRef<any>(null);
  useAutoFocus(eventTitleInputRef, 1000, isEventModalVisible);

  const handleAddEventWithNotifications = async () => {
    try {
      await handleAddEvent()
      if (selectedDate) {
        const eventToSchedule: CalendarEvent = {
          id: Math.random().toString(36).substring(2, 11),
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

  const handleEditEventInternal = (event: CalendarEvent) => {
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
        <ViewEventModal
          isViewEventModalVisible={isViewEventModalVisible}
          selectedDate={selectedDate}
          selectedEvents={selectedEvents}
          handleDeleteEvent={handleDeleteEvent}
          closeEventModals={closeEventModals}
          isDark={isDark}
          primaryColor={primaryColor}
          onEdit={handleEditEventInternal}
          onAddNewEvent={handleAddNewEvent}
        />
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
              <Input
                ref={eventTitleInputRef}
                placeholder="Event Title"
                value={newEventTitle}
                onChangeText={setNewEventTitle}
                autoCapitalize="sentences"
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                placeholderTextColor="$placeholderColor"
                color="$color"
                fontFamily="$body"
                fontSize={isWeb ? "$5" : "$4"}
                borderRadius={12}
              />

              <TouchableOpacity onPress={() => setShowTimePicker(true)} activeOpacity={0.7}>
                <XStack
                  backgroundColor="$backgroundHover"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius={12}
                  padding="$3"
                  alignItems="center"
                  justifyContent="space-between"
                  marginTop="$2"
                >
                  <Text 
                    fontFamily="$body" 
                    color={newEventTime ? "$color" : "$placeholderColor"} 
                    fontSize={isWeb ? "$5" : "$4"}
                  >
                    {newEventTime || 'Event Time (optional)'}
                  </Text>
                  <Ionicons name="time-outline" size={isWeb ? 24 : 20} color={primaryColor} />
                </XStack>
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16 }}>
                <XStack gap={isIpad() ? "$2" : "$1"}>
                  {['personal', 'work', 'family', 'task', 'health'].map((type) => {
                    const color = getCategoryColor(type as TaskCategory);
                    return (
                      <Button
                        key={type}
                        onPress={() => setSelectedType(type as CalendarEvent['type'])}
                        backgroundColor={
                          type === selectedType 
                            ? withOpacity(color, isDark ? 0.2 : 0.1)
                            : "$backgroundHover"
                        }
                        borderWidth={1}
                        borderColor={
                          type === selectedType 
                            ? withOpacity(color, isDark ? 0.4 : 0.3)
                            : "$borderColor"
                        }
                        borderRadius={16}
                        paddingHorizontal="$3"
                        paddingVertical="$2"
                        fontFamily="$body"
                        fontSize={isWeb ? "$4" : "$3"}
                        color={type === selectedType ? color : "$color"}
                        fontWeight={type === selectedType ? "600" : "500"}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    );
                  })}
                </XStack>
              </ScrollView>

              <YStack
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius={12}
                padding="$4"
                marginTop="$4"
                gap="$3"
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
                          backgroundColor: isDark ? '#222222' : '#ffffff',
                          borderColor: isDark ? '#333333' : '#e1e1e1',
                          borderWidth: 1,
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          marginTop: 8,
                          shadowColor: 'transparent',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0,
                          shadowRadius: 0,
                          elevation: 0,
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
                        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                        borderColor: isDark ? '#333333' : '#e1e1e1',
                        borderWidth: 1,
                        borderRadius: 8,
                        marginTop: 4,
                        shadowColor: 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0,
                        shadowRadius: 0,
                        elevation: 0,
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
              </YStack>
            </ScrollView>

            <XStack gap="$3" justifyContent="space-between" marginTop="$4" paddingHorizontal="$4">
              <Button
                onPress={closeEventModals}
                backgroundColor="rgba(255, 4, 4, 0.1)"
                borderColor="$borderColor"
                fontFamily="$body"
                fontSize={isWeb ? "$5" : "$4"}
                paddingHorizontal="$4"
                color={isDark ? "$red10" : "$red10"}
                flex={1}
              >
                Cancel
              </Button>
              <Button
                onPress={handleAddEventWithNotifications}
                backgroundColor={primaryColor}
                disabled={!newEventTitle}
                fontFamily="$body"
                fontSize={isWeb ? "$5" : "$4"}
                paddingHorizontal="$4"
                color={isDark ? "$white" : "#fff"}
                flex={1}
              >
                {editingEvent ? 'Update' : 'Save'}
              </Button>
            </XStack>
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
                  backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                  width: modalWidth,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isDark ? '#333333' : '#e1e1e1',
                  shadowColor: 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0,
                  shadowRadius: 0,
                  elevation: 0,
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
                      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
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
