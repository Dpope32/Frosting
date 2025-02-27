import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CalendarEvent } from '@/store/CalendarStore'
import { EventPreview } from './EventPreview'
import { calendarStyles } from './CalendarStyles'

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
                <TextInput
                  style={[
                    calendarStyles.input,
                    { fontFamily: '$body', color: textColor },
                  ]}
                  placeholder="Event Time (CT)"
                  placeholderTextColor={isDark ? '#888888' : '#666666'}
                  value={newEventTime}
                  onChangeText={setNewEventTime}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={calendarStyles.typeSelector}
                >
                  {['personal', 'work', 'family'].map((type) => (
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
                          },
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
                onPress={handleAddEvent}
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
