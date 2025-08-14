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
              height: screenHeight * 0.8,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }
          ]}
        >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text
                    fontSize={20}
                    fontWeight="700"
                    color={isDarkMode ? "#fffaef" : "black"}
                  >
                    {`Events for ${selectedDate?.toLocaleDateString() || ''}`}
                  </Text>
                  <TouchableOpacity onPress={closeEventModals} style={{ padding: 8 }}>
                    <MaterialIcons name="close" size={24} color={isDarkMode ? "#c9c9c9" : "#000"}/>
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ 
                      paddingBottom: 60,  // Space for + button
                      flexGrow: 1,
                    }}
                    showsVerticalScrollIndicator={true}
                    bounces={true}
                  >
                    {selectedEvents
                      ?.slice()
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
                      ))}
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
