import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { calendarStyles } from './CalendarStyles';

interface CalendarAnalyticsProps {
  visible: boolean;
  onClose: () => void;
  debugData: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    vaultEntries: number;
    upcomingEvents: { title: string; date: string; type: string }[];
  } | null;
  isDark: boolean;
}

export const CalendarAnalytics: React.FC<CalendarAnalyticsProps> = ({
  visible,
  onClose,
  debugData,
  isDark,
}) => {
  if (!debugData) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={calendarStyles.debugModalContainer}>
        <View style={[calendarStyles.debugModalContent, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
          <Text style={[calendarStyles.debugModalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
            Calendar Analytics
          </Text>
          <ScrollView style={calendarStyles.debugScroll}>
            {debugData && (
              <>
                <View style={calendarStyles.debugRow}>
                  <Text style={[calendarStyles.debugLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                    Total Events:
                  </Text>
                  <Text style={[calendarStyles.debugValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                    {debugData.totalEvents}
                  </Text>
                </View>
                <View style={calendarStyles.debugRow}>
                  <Text style={[calendarStyles.debugLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                    Vault Entries:
                  </Text>
                  <Text style={[calendarStyles.debugValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                    {debugData.vaultEntries}
                  </Text>
                </View>
                <View style={calendarStyles.debugRow}>
                  <Text style={[calendarStyles.debugLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                    Events By Type:
                  </Text>
                </View>
                {Object.entries(debugData.eventsByType).map(([type, count]) => (
                  <View style={calendarStyles.debugRow} key={type}>   
                    <Text style={[calendarStyles.debugKey, { color: isDark ? '#ffffff' : '#000000' }]}>
                      {type}:
                    </Text>
                    <Text style={[calendarStyles.debugValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                      {count}
                    </Text>
                  </View>
                ))}
                <View style={calendarStyles.debugRow}>
                  <Text style={[calendarStyles.debugLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                    Upcoming Events:
                  </Text>
                </View>
                {debugData.upcomingEvents.map((event, idx) => (
                  <View style={calendarStyles.debugEventRow} key={idx}>
                    <Text style={[calendarStyles.debugEventTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                      {event.title}
                    </Text>
                    <Text style={[calendarStyles.debugEventDate, { color: isDark ? '#ffffff' : '#000000' }]}>
                      {event.date}
                    </Text>
                    <Text style={[calendarStyles.debugEventType, { color: isDark ? '#ffffff' : '#000000' }]}>
                      {event.type}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
          <TouchableOpacity
            style={[calendarStyles.debugCloseButton, { backgroundColor: '#666666' }]}
            onPress={onClose}
          >
            <Text style={calendarStyles.debugCloseButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
