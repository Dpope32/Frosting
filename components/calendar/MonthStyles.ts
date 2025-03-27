import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    calendar: {
      borderRadius: 20,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      padding: 16,
      margin: 16,
      ...(Platform.OS === 'web' ? {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        // Removed maxWidth since we're displaying 2 months side by side
      } as any : {}),
    },
    header: {
      alignItems: 'center',
      marginBottom: 16,
      height: 48,
    },
    monthText: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    weekDays: {
      flexDirection: 'row',
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.1)',
      paddingBottom: 8,
    },
    weekDayContainer: {
      flex: 1,
      alignItems: 'center',
    },
    weekDay: {
      fontSize: 12,
      fontWeight: '600',
    },
    holidayCell: {
      backgroundColor: 'rgba(229, 57, 53, 0.1)', 
    },
    holidayText: {
      fontSize: 8,
      color: '#E53935',
      textAlign: 'center',
      marginTop: 1,
      fontWeight: 'bold',
    },
    holidayIcon: {
      position: 'absolute',
      zIndex: 1,
      marginTop: 2
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      padding: 2,
      borderBottomWidth: 0.5,
      borderBottomColor: '#ddd',
    },
    lastRowCell: {
      borderBottomWidth: 0, 
    },
    dayCellContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      padding: 2,
    },
    pastDateOverlay: {
      opacity: 0.3, 
    },
    dayWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      position: 'relative',
      minWidth: 24,
    },
    dayText: {
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    today: {
      borderRadius: 8,
    },
    selectedText: {
      fontWeight: 'bold',
    },
    indicatorContainer: {
      flexDirection: 'row',
      gap: 2,
      position: 'absolute',
      bottom: 2,
      left: 0,
      right: 0,
      justifyContent: 'center',
    },
    eventDot: {
      width: Platform.OS === 'web' ? 6 : 4,
      height: Platform.OS === 'web' ? 6 : 4,
      borderRadius: Platform.OS === 'web' ? 3 : 2,
      marginTop: 2,
    },
    billIcon: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#4CAF50',
      position: 'absolute', 
      left: -4,
      top: -4,
    },
    birthdayIcon: {
      fontSize: 10,
      position: 'absolute',
      right: -10,
      top: -10,
    },
    nbaLogoContainer: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: Platform.OS === 'web' ? 16 : 12,
      height: Platform.OS === 'web' ? 16 : 12,
      zIndex: 1,
    },
    nbaLogo: {
      width: '100%',
      height: '100%',
    },
  });