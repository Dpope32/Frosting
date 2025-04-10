import { Platform, StyleSheet } from 'react-native';

export const getMonthStyles = (webColumnCount: number) => StyleSheet.create({
  calendar: {
    borderRadius: 20,
    elevation: 4,
    padding: 18,
    margin: 12,
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } : {})
  },
  header: {
    alignItems: 'center',
    marginBottom: 2,
    height: 48
  },
  monthText: {
    fontSize: 22,
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
    fontSize: webColumnCount === 1 ? 16 : 12,
    fontWeight: '600'
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: Platform.OS === 'web' ? 4 : 2
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
    top: Platform.OS === 'web' ? 4 : 2,
    right: Platform.OS === 'web' ? 4 : 2,
    fontSize: webColumnCount === 1 ? 20 : (Platform.OS === 'web' ? 16 : 14),
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
    fontSize: webColumnCount === 1 ? 16 : 12
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
    fontSize: webColumnCount === 1 ? 16 : 12
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
    width: Platform.OS === 'web' ? 8 : 4,
    height: Platform.OS === 'web' ? 8 : 4,
    borderRadius: Platform.OS === 'web' ? 4 : 2,
    marginTop: Platform.OS === 'web' ? 4 : 2
  },
  // NBA
  nbaLogoContainer: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: webColumnCount === 1 ? 24 : (Platform.OS === 'web' ? 16 : 12),
    height: webColumnCount === 1 ? 24 : (Platform.OS === 'web' ? 16 : 12),
    zIndex: 1
  },
  nbaLogo: {
    width: '100%',
    height: '100%'
  }
});
