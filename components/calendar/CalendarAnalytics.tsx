import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { calendarStyles } from './debugModalStyles';

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

  const textColor = isDark ? '#f8f8f2' : '#282a36';
  const containerBg = isDark ? '#1e1e1e' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={calendarStyles.modalOverlay}>
        <View style={[calendarStyles.modalContent, { backgroundColor: containerBg }]}>
          <Text style={[calendarStyles.modalTitle, { color: textColor }]}>
            Calendar Analytics
          </Text>

          <View style={calendarStyles.infoSection}>
            <View style={calendarStyles.infoRow}>
              <Text style={[calendarStyles.infoLabel, { color: textColor }]}>Total Events</Text>
              <Text style={[calendarStyles.infoValue, { color: textColor }]}>{debugData.totalEvents}</Text>
            </View>
            <View style={calendarStyles.infoRow}>
              <Text style={[calendarStyles.infoLabel, { color: textColor }]}>Vault Entries</Text>
              <Text style={[calendarStyles.infoValue, { color: textColor }]}>{debugData.vaultEntries}</Text>
            </View>
          </View>

          <View style={calendarStyles.section}>
            <Text style={[calendarStyles.sectionTitle, { color: textColor }]}>Events By Type</Text>
            <View style={[calendarStyles.table, { borderColor }]}>
              <View style={[calendarStyles.tableHeaderRow, { borderColor }]}>
                <Text style={[calendarStyles.tableHeaderCell, { color: textColor, borderColor }]}>Type</Text>
                <Text style={[calendarStyles.tableHeaderCell, { color: textColor, borderColor }]}>Count</Text>
              </View>
              {Object.entries(debugData.eventsByType).map(([type, count], i) => (
                <View
                  style={[
                    calendarStyles.tableRow,
                    { borderColor },
                    i === Object.entries(debugData.eventsByType).length - 1 && calendarStyles.lastRow,
                  ]}
                  key={type}
                >
                  <Text style={[calendarStyles.tableCell, { color: textColor, borderColor }]}>{type}</Text>
                  <Text style={[calendarStyles.tableCell, { color: textColor, borderColor }]}>{count}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={calendarStyles.section}>
            <Text style={[calendarStyles.sectionTitle, { color: textColor }]}>Upcoming Events</Text>
            <View style={[calendarStyles.table, { borderColor }]}>
              <View style={[calendarStyles.tableHeaderRow, { borderColor }]}>
                <Text style={[calendarStyles.tableHeaderCell, { color: textColor, borderColor }]}>Title</Text>
                <Text style={[calendarStyles.tableHeaderCell, { color: textColor, borderColor }]}>Date</Text>
                <Text style={[calendarStyles.tableHeaderCell, { color: textColor, borderColor }]}>Type</Text>
              </View>
              {debugData.upcomingEvents.map((event, idx) => (
                <View
                  style={[
                    calendarStyles.tableRow,
                    { borderColor },
                    idx === debugData.upcomingEvents.length - 1 && calendarStyles.lastRow,
                  ]}
                  key={idx}
                >
                  <Text style={[calendarStyles.tableCell, { color: textColor, borderColor }]}>
                    {event.title}
                  </Text>
                  <Text style={[calendarStyles.tableCell, { color: textColor, borderColor }]}>
                    {event.date}
                  </Text>
                  <Text style={[calendarStyles.tableCell, { color: textColor, borderColor }]}>
                    {event.type}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={calendarStyles.closeButton} onPress={onClose}>
            <Text style={calendarStyles.closeButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
