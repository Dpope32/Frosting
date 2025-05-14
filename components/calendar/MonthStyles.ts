import { Platform, StyleSheet } from 'react-native';
import { isWeb } from 'tamagui';


export const getMonthStyles = (webColumnCount: number, isDark: boolean) => StyleSheet.create({
  calendar: {
    borderRadius: isWeb? 0 : 12,
    elevation: isWeb? 0 : 3,
    padding: 0,
    margin: 0,
    backgroundColor: isDark ? '#121212' : '#FFFFFF',
    overflow: 'hidden',
    borderWidth: isDark ? 0 : 1,
    borderColor: isDark ? 'transparent' : '#E0E0E0',
    ...(Platform.OS === 'web' ? { 
      boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
      margin: 0
    } : {})
  },
  header: {
    alignItems: 'center',
    marginBottom: 0,
    height: webColumnCount === 1 ? isWeb? 72 : 48 : (webColumnCount === 2 ? isWeb ? 60 : 48 : 48),
    justifyContent: 'center',
    backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#E8E8E8',
  },
  monthText: {
    fontSize: webColumnCount === 1 ? isWeb? 26 :22 : (webColumnCount === 2 ? isWeb? 24 : 20 : 16),
    fontWeight: '600',
    color: isDark ? '#FFF' : '#333'
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 0,
    borderBottomWidth: 0,
    paddingBottom: 4,
    paddingTop: 8,
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 0,
  },
  weekDay: {
    fontSize: webColumnCount === 1 ? isWeb? 18 : 16 : (webColumnCount === 2 ? isWeb? 16 : 14 : 11),
    fontWeight: '500',
    color: isDark ? '#AAA' : '#757575',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: Platform.OS === 'web' ? 3 : 1,
    borderWidth: 0.5,
    borderColor: isDark ? '#333' : '#E8E8E8',
  },
  weekendDayCell: {
    backgroundColor: isDark ? '#252525' : '#F5F5F5',
    borderRadius:isWeb? 0: 6,
  },
  currentDateCell: {
    borderBottomWidth: 0,
  },
  pastDateCell: {
    borderBottomWidth: 0,
    position: 'relative',
  },
  lastRowCell: {
    borderBottomWidth: 0
  },
  holidayCell: {
    backgroundColor: isDark ? '#252525' : '#F5F5F5',
    borderRadius:isWeb? 0: 6,
  },
  holidayText: {
    fontSize: webColumnCount === 1 ? isWeb? 18 : 16 : (webColumnCount === 2 ? isWeb? 16 : 14 : 11),
    fontWeight: '500',
    color: isDark ? '#AAA' : '#757575',
  },
  taskIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },  
  taskIconText: {
    fontSize: webColumnCount === 1 ? isWeb? 18 : 16 : (webColumnCount === 2 ? isWeb? 16 : 14 : 11),
    fontWeight: '500',
    color: isDark ? '#AAA' : '#757575',
  },
  dayCellContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 2
  },
  pastDateOverlay: {
    opacity: 0.7,
    backgroundColor: isDark ? 'rgba(0, 0, 0,1)' : 'rgba(0, 0, 0, 0.3)',
  },
  pastDateStrikethrough: {
    position: 'absolute',
    width: isWeb ? '145%' : '143%',
    height: 1,
    backgroundColor: isDark ? '#777' : '#999',
    top: isWeb ? '50%' : '55%',
    left: webColumnCount === 1 ? isWeb ? -45 : -6 : webColumnCount === 2 ? isWeb ? -26 : -6 : webColumnCount === 3 ? isWeb ? -20 : -6 : -6,
    transform: [{ rotate: '135deg' }],
    zIndex: 1000,
  },
  dayNumber: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 4 : 2,
    right: Platform.OS === 'web' ? 4 : 2,
    fontSize: webColumnCount === 1 
      ? (Platform.OS === 'web' ? 18 : 12) 
      : (webColumnCount === 2 
        ? (Platform.OS === 'web' ? 16 : 10)
        : (Platform.OS === 'web' ? 12 : 8)),
    fontWeight: '500',
    color: isDark ? '#FFFFFF' : '#333333'
  },
  today: {
    borderWidth: 2.5,
    borderRadius: 6,
    marginVertical: 0,
    marginHorizontal: 0,
    padding: 0,
    zIndex: 5,
    elevation: 1,
  },
  // Icon containers
  holidayIconContainer: {
    zIndex: 9999,
    bottom: 12,
    left: 0,
    right: 2,
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(0,50,0,0.7)' : 'rgba(200,255,200,0.9)',
    borderRadius: 3,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(168, 168, 168, 0.18)',
    paddingHorizontal: 6,

  },
  holidayIconText: {
    fontSize: webColumnCount === 1 
      ? (Platform.OS === 'web' ? 13 : 10) 
      : (webColumnCount === 2 
        ? (Platform.OS === 'web' ? 12 : 8) 
        : (Platform.OS === 'web' ? 10 : 8)),
    color: isDark ? '#FFFFFF' : '#006400',
    textAlign: 'center',
    fontWeight: 'bold',
    maxWidth: '100%'
  },
  billIconContainer: {
    position: 'absolute',
    bottom: 24,
    right: 4,
    left: 4,
    alignItems: 'center',
    borderColor: 'rgba(255,0,0,0.5)',
    borderRadius: 3,
    borderWidth: 0.5,
  },
  billIconText: {
    fontSize: webColumnCount === 1 
      ? (Platform.OS === 'web' ? 14 : 9) 
      : (webColumnCount === 2 
        ? (Platform.OS === 'web' ? 12 : 6) 
        : (Platform.OS === 'web' ? 10 : 6)),
    color: isDark ? '#FF8A80' : '#E57373',
    textAlign: 'center',
    maxWidth: '100%',
    opacity: 0.9
  },
  birthdayIconContainer: {
    zIndex: 9999,
    bottom: -10,
    left: 2,
    right: 2,
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(100,0,100,0.7)' : 'rgba(255,200,255,0.9)',
    borderRadius: 3,
    paddingVertical: 2,
    ...(Platform.OS === 'web' ? {
      borderWidth: 1,
      borderColor: isDark ? '#E91E63' : '#880E4F',
    } : {})
  },
  birthdayIconText: {
    fontSize: webColumnCount === 1 
      ? (Platform.OS === 'web' ? 13 : 10) 
      : (webColumnCount === 2 
        ? (Platform.OS === 'web' ? 12 : 8) 
        : (Platform.OS === 'web' ? 10 : 8)),
    color: isDark ? '#FFFFFF' : '#880E4F',
    textAlign: 'center',
    fontWeight: 'bold',
    maxWidth: '100%'
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
    width: Platform.OS === 'web' ? 8 : 6,
    height: Platform.OS === 'web' ? 8 : 6,
    borderRadius: Platform.OS === 'web' ? 4 : 3,
    marginTop: Platform.OS === 'web' ? 4 : 2
  },
  // NBA
  nbaLogoContainer: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: webColumnCount === 1 ? 20 : (Platform.OS === 'web' ? 16 : 12),
    height: webColumnCount === 1 ? 20 : (Platform.OS === 'web' ? 16 : 12),
    zIndex: 1
  },
  nbaLogo: {
    width: '100%',
    height: '100%'
  }
});
