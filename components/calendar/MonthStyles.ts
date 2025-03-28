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
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } : {})
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    height: 48
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 8
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center'
  },
  weekDay: {
    fontSize: 12,
    fontWeight: '600'
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2
  },
  currentDateCell: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd'
  },
  pastDateCell: {
    borderBottomWidth: 0
  },
  lastRowCell: {
    borderBottomWidth: 0
  },
  dayCellContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 2
  },
  pastDateOverlay: {
    opacity: 0.1,
    filter: 'grayscale(50%)',
    borderBottomWidth: 0
  },
  dayNumber: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 14,
    fontWeight: '600'
  },
  today: {
    borderRadius: 8
  },
  // Icon containers
  holidayIconContainer: {
    position: 'absolute',
    top: 2,
    left: 2
  },
  holidayIconText: {
    fontSize: 12
  },
  billIconContainer: {
    position: 'absolute',
    bottom: 2,
    left: 2
  },
  billIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  birthdayIconContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2
  },
  birthdayIconText: {
    fontSize: 12
  },
  // Dots
  indicatorContainer: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'center'
  },
  eventDot: {
    width: Platform.OS === 'web' ? 6 : 4,
    height: Platform.OS === 'web' ? 6 : 4,
    borderRadius: Platform.OS === 'web' ? 3 : 2,
    marginTop: 2
  },
  // NBA
  nbaLogoContainer: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: Platform.OS === 'web' ? 16 : 12,
    height: Platform.OS === 'web' ? 16 : 12,
    zIndex: 1
  },
  nbaLogo: {
    width: '100%',
    height: '100%'
  }
});
