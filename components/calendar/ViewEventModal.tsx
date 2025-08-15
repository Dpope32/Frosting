import React from 'react'
import { View, TouchableOpacity, ScrollView, Dimensions, Alert, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { isWeb, Text, XStack, Button, Theme } from 'tamagui'
import { useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated'
import { parse } from 'date-fns'
import { MaterialIcons } from '@expo/vector-icons'
import { CalendarEvent, useToastStore } from '@/store'
import { EventPreview } from './EventPreview'
import { styles } from './EventStyles'
import { isIpad } from '@/utils'

interface ViewEventModalProps {
  isViewEventModalVisible: boolean;
  selectedDate: Date | null;
  selectedEvents?: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  onAddNewEvent: () => void;
  handleDeleteEvent: (eventId: string) => void;
  closeEventModals: () => void;
  isDark: boolean;
  primaryColor: string;
}

export const ViewEventModal: React.FC<ViewEventModalProps> = ({
  isViewEventModalVisible,
  selectedDate,
  selectedEvents,
  onEdit,
  onAddNewEvent,
  handleDeleteEvent,
  closeEventModals,
  isDark,
  primaryColor,
}) => {
  const { showToast } = useToastStore()
  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height
  const getViewModalMaxWidth = () => { return isWeb ? Math.min(screenWidth * 0.9, 800) : Math.min(screenWidth * 0.9, 400)}

  // Calculate dynamic height based on number of events
  const calculateDynamicHeight = () => {
    if (!selectedEvents || selectedEvents.length === 0) {
      // Empty state: minimal height
      return Math.min(screenHeight * 0.35, 280)
    }

    // Filter unique events first
    const uniqueEvents = selectedEvents
      .slice()
      .filter((event, index, array) => {
        return array.findIndex(e => 
          e.title === event.title && 
          e.date === event.date && 
          e.time === event.time
        ) === index;
      })

    // Estimate height per event card more accurately
    const estimateEventHeight = (event: CalendarEvent) => {
      let baseHeight = 75 // More precise base height for title and padding
      
      // Add height for description if present
      if (event.description) {
        const descriptionLines = Math.ceil(event.description.length / 40)
        baseHeight += Math.min(descriptionLines * 18, 36) // Max 2 lines
      }
      
      // Add height for chips (time, type, priority) - they're in the same row
      if ((event.time && event.type !== 'birthday') || 
          (event.type && event.type !== 'birthday') || 
          (event.priority && event.type !== 'birthday')) {
        baseHeight += 30 // Height for chip row
      }
      
      return baseHeight + 10 // Margin between events
    }

    const totalEventsHeight = uniqueEvents.reduce((total, event) => {
      return total + estimateEventHeight(event)
    }, 0)

    // Fixed heights - more precise measurements
    const headerHeight = 50  // Reduced header space
    const paddingAndMargins = 24  // Reduced padding
    const floatingButtonSpace = 50  // Reduced button space
    const baseModalPadding = 16  // Base modal padding

    const calculatedHeight = headerHeight + totalEventsHeight + paddingAndMargins + floatingButtonSpace + baseModalPadding

    // More nuanced constraints based on event count
    let minHeight, maxHeight
    
    if (uniqueEvents.length === 1) {
      minHeight = 200  // Much smaller for single events
      maxHeight = Math.min(screenHeight * 0.5, 400)
    } else if (uniqueEvents.length <= 3) {
      minHeight = 250
      maxHeight = Math.min(screenHeight * 0.6, 500)
    } else if (uniqueEvents.length <= 6) {
      // For 4-6 events, use calculated height more directly with tighter constraints
      minHeight = Math.min(calculatedHeight, 350)
      maxHeight = Math.min(screenHeight * 0.7, 600)
    } else {
      minHeight = 400
      maxHeight = screenHeight * 0.85
    }

    // For medium event counts, prefer calculated height over minHeight if it's reasonable
    if (uniqueEvents.length >= 4 && uniqueEvents.length <= 6) {
      return Math.min(Math.max(calculatedHeight, 300), maxHeight)
    }

    return Math.max(minHeight, Math.min(calculatedHeight, maxHeight))
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

  if (!isViewEventModalVisible) return null

  const modalWidth = getViewModalMaxWidth()
  const dynamicHeight = calculateDynamicHeight()
  
  return (
    <Animated.View 
      style={modalStyles.overlay}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
    >
      <TouchableWithoutFeedback onPress={closeEventModals}>
        <View style={modalStyles.overlayTouchable} />
      </TouchableWithoutFeedback>
      
      <Theme name={isDarkMode ? 'dark' : 'light'}>
        <Animated.View
          entering={ZoomIn.duration(300).springify()}
          exiting={FadeOut.duration(300)}
          style={[
            modalStyles.modalContainer,
            {
              backgroundColor: isDarkMode ? '#141415' : '#fff',
              borderColor: isDarkMode ? '#3c3c3c' : '#1c1c1c',
              width: modalWidth,
              height: dynamicHeight,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }
          ]}
        >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, alignItems: 'center', marginBottom: 12, paddingLeft: 6 }}>
                  <Text
                    fontSize={isIpad() ? 22 : 20}
                    fontWeight="700"
                    color={isDarkMode ? "#fffaef" : "black"}
                    fontFamily="$body"
                  >
                    {`Events for ${selectedDate?.toLocaleDateString() || ''}`}
                  </Text>
                  <TouchableOpacity onPress={closeEventModals} style={{ padding: 8 }}>
                    <MaterialIcons name="close" size={24} color={isDarkMode ? "#c9c9c9" : "#000"}/>
                  </TouchableOpacity>
                </View>


                <View style={{ flex: 1 }}>
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ 
                      paddingBottom: selectedEvents && selectedEvents.length === 1 ? 20 : 
                                    selectedEvents && selectedEvents.length <= 6 ? 25 : 30,
                      paddingTop: selectedEvents && selectedEvents.length === 1 ? 8 : 0,
                      flexGrow: selectedEvents && selectedEvents.length > 0 ? 0 : 1, // Only grow when empty
                    }}
                    showsVerticalScrollIndicator={selectedEvents && selectedEvents.length > 3} // Show scrollbar only when needed
                    bounces={selectedEvents && selectedEvents.length > 1}
                  >
                    {selectedEvents && selectedEvents.length > 0 ? (
                      selectedEvents
                        .slice()
                        .filter((event, index, array) => {
                          return array.findIndex(e => 
                            e.title === event.title && 
                            e.date === event.date && 
                            e.time === event.time
                          ) === index;
                        })
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
                              onEdit={() => onEdit(event)}
                              onDelete={() => handleDeleteEventWithConfirmation(event.id)}
                              isDark={isDark}
                              primaryColor={primaryColor}
                            />
                          </Animated.View>
                        ))
                    ) : (
                      <View style={{ 
                        flex: 1, 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        paddingVertical: 40
                      }}>
                        <MaterialIcons 
                          name="event-note" 
                          size={48} 
                          color={isDarkMode ? '#666' : '#ccc'} 
                          style={{ marginBottom: 16 }}
                        />
                        <Text 
                          fontSize={16} 
                          color={isDarkMode ? '#999' : '#666'}
                          textAlign="center"
                        >
                          No events for this date
                        </Text>
                        <Text 
                          fontSize={14} 
                          color={isDarkMode ? '#666' : '#999'}
                          textAlign="center"
                          marginTop={8}
                        >
                          Tap the + button to add your first event
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                  
                  <TouchableOpacity
                    onPress={onAddNewEvent}
                    style={[
                      styles.buttonEvent,
                      { 
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        backgroundColor: primaryColor,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                      }
                    ]}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons 
                      name="add" 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>
                </View>
        </Animated.View>
      </Theme>
    </Animated.View>   
  )
}

const modalStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    position: 'absolute',
    alignSelf: 'center',
  },
})
