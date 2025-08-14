import React from 'react'
import { View, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native'
import { isWeb } from 'tamagui'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { parse } from 'date-fns'
import { MaterialIcons } from '@expo/vector-icons'
import { CalendarEvent, useToastStore } from '@/store'
import { EventPreview } from './EventPreview'
import { BaseCardAnimated } from '../baseModals/BaseCardAnimated'
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
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height
  const getViewModalMaxWidth = () => { return isWeb ? Math.min(screenWidth * 0.9, 800) : Math.min(screenWidth * 0.85, 400)}
  const noScrollbar = isWeb ? { overflow: 'hidden' as const } : {}

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
          <View style={{ paddingBottom: 30, ...noScrollbar }}>
            <ScrollView
              style={{
                maxHeight: isWeb ? screenHeight * 0.57 : screenHeight * 0.77
              }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={!isWeb}
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
              style={[styles.buttonEvent, { backgroundColor: 'transparent' }]}
            >
              <MaterialIcons 
                name="add" 
                size={24} 
                color={isDark ? "#fff" : "#000"} 
              />
            </TouchableOpacity>
          </View>
        </BaseCardAnimated>
      )}
    </>
  )
}
