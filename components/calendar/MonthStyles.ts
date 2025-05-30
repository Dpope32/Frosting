import { isIpad } from '@/utils';
import { Platform, StyleSheet } from 'react-native';
import { isWeb } from 'tamagui';


export const getMonthStyles = (webColumnCount: number, isDark: boolean) => StyleSheet.create({
  calendar: {
    borderRadius: Platform.OS === 'web' ? 16 : isIpad() ? 14 : 12,
    elevation: isWeb? 0 : 3,
    padding: 0,
    margin: isWeb ? 8 : 4,
    backgroundColor: isDark ? '#121212' : '#FFFFFF',
    overflow: 'visible',
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
    height: webColumnCount === 1 ? isWeb? 72 : 48 : (webColumnCount === 2 ? isWeb ? 60 : 40 : 40),
    justifyContent: 'center',
    backgroundColor: isDark ? '#0a0a0a' : '#f7f7f7',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#E8E8E8',
  },
  monthText: {
    fontSize: webColumnCount === 1 ? isWeb? 26 : isIpad() ? 22 : 20 : (webColumnCount === 2 ? isWeb? 22 : isIpad() ? 18 : 20 : 16),
    fontWeight: '600',
    color: isDark ? '#FFF' : '#222'
  },
  weekDays: {
    flexDirection: 'row',
    marginVertical: 6,
    borderBottomWidth: 0,
    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 0,
    backgroundColor: isDark ? '#111' : '#f7f7f7',
  },
  weekDay: {
    fontSize: webColumnCount === 1 ? isWeb? 18 : isIpad() ? 14 : 10 : (webColumnCount === 2 ? isWeb? 16 : isIpad() ? 14  : 14 : 11),
    fontWeight: '600',
    color: isDark ? '#AAA' : '#444',
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
    aspectRatio:
      Platform.OS === 'web'
        ? (webColumnCount === 3
            ? 0.9
            : webColumnCount === 2
              ? 0.9
              : 1)
        : (webColumnCount === 3
            ? 0.8
            : webColumnCount === 2
              ? 0.7
              : 0.9),
    padding: Platform.OS === 'web' ? 3 : 1,
    borderWidth: 0.25,
    borderColor: isDark ? '#555' : '#E8E8E8',
  },
  weekendDayCell: {
    backgroundColor: isDark ? '#212121' : '#f0f0f0',
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
    backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5',
    borderRadius: 4,
    width: '100%',
    marginVertical: webColumnCount === 1 && isWeb ? 1 : 0,
    borderWidth: 0.5,
    borderColor: isDark ? '#555' : '#E8E8E8',
    paddingHorizontal: webColumnCount === 3 ? 1 : webColumnCount === 2 ? 2 : 3,
    paddingVertical: webColumnCount === 3 ? 0 : webColumnCount === 2 ? 1 : 2,
    minHeight: webColumnCount === 3 ? 10 : webColumnCount === 2 ? 12 : 'auto',
    justifyContent: 'center',
  },
  holidayText: {
    fontSize: webColumnCount === 3 ? 8 : webColumnCount === 1 ? (isWeb ? 13 : 7) : (webColumnCount === 2 ? (isWeb ? 10 : 6) : 8),
    color: isDark ? '#FFFFFF' : '#006400',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: webColumnCount === 3 ? 8 : webColumnCount === 2 ? 10 : undefined,
  },
  taskIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },  
  taskIconText: {
    fontSize: webColumnCount === 1 ? isWeb? 15 : 16 : (webColumnCount === 2 ? isWeb? 16 : 14 : 11),
    fontWeight: '600',  
    color: isDark ? '#AAA' : '#444',
  },
  dayCellContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    padding: 2,
    overflow: 'visible',
    paddingTop: webColumnCount === 1 ? (isWeb ? 26 : 20) : webColumnCount === 2 ? 16 : webColumnCount === 3 ? 12 : 2, // Adjusted for webColumnCount === 1 on web (reverted) and mobile (increased)
    gap: webColumnCount === 1 && isWeb ? 2 : 1,
  },
  pastDateOverlay: {
    opacity: isDark ? 0.7 : 0.4,
    backgroundColor: isDark ? 'rgba(0, 0, 0,1)' : 'rgba(128, 128, 128, 0.3)',
  },
  pastDateStrikethrough: {
    position: 'absolute',
    width: isWeb ? '145%' : isIpad() ? '146%' : '143%',
    height: isIpad() ? 1.9 : 1.5,
    backgroundColor: isDark ? '#555' : '#777',
    top: isWeb ? '50%' : isIpad() ? '60%' : '55%',
    left: webColumnCount === 1 ? isWeb ? -45 : isIpad() ? -15 : -6 : webColumnCount === 2 ? isWeb ? -26 : isIpad() ? -10 : -6 : webColumnCount === 3 ? isWeb ? -20 : isIpad() ? -14 : -6 : -6,
    transform:  isIpad() ? [{ rotate: '131deg' }] : [{ rotate: '135deg' }],
    zIndex: 1000,
  },
  dayNumber: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 1 : 2,
    right: Platform.OS === 'web' ? 4 : 2,
    fontSize: webColumnCount === 1 
      ? (Platform.OS === 'web' ? 18 : isIpad() ? 14 : 12) 
      : (webColumnCount === 2 
        ? (Platform.OS === 'web' ? 12 : isIpad() ? 12 : 10)
        : (Platform.OS === 'web' ? 10 : isIpad() ? 9 : 8)),
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#222222',
    zIndex: 100 // Increased zIndex to ensure day number is on top
  },
  today: {
    borderWidth: 1.5,
    borderRadius: 6,
    marginVertical: 0,
    marginHorizontal: 0,
    padding: 0,
    zIndex: 5,
    elevation: 1,
  },
  // Common event container and text styles
  eventIconContainer: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: isDark ? '#555' : '#E8E8E8',
    marginVertical: webColumnCount === 1 && isWeb ? 1 : 0,
    paddingHorizontal: webColumnCount === 3 ? 1 : webColumnCount === 2 ? 2 : 3,
    paddingVertical: webColumnCount === 3 ? 0 : webColumnCount === 2 ? 1 : 2,
    backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5',
    minHeight: webColumnCount === 3 ? 10 : webColumnCount === 2 ? 12 : 'auto',
    justifyContent: 'center',
  },
  eventIconText: {
    fontSize: webColumnCount === 1 
      ? (Platform.OS === 'web' ? 13 : 7) 
      : (webColumnCount === 2 ? (Platform.OS === 'web' ? 10 : 6) : 7),
    textAlign: 'center',
    fontWeight: '500',
    width: '100%',
    lineHeight: webColumnCount === 3 ? 8 : webColumnCount === 2 ? 10 : undefined,
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
  },
  trailingBlankCell: {
    width: '14.28%',
    aspectRatio: 1,
    backgroundColor: isDark ? '#0b0b0b' : '#f9f9f9',
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderColor: isDark ? '#555' : '#E8E8E8',
  },
  trailingBlankCellLast: {
    borderRightWidth: 1
  },
  lastRowCellLeft: {
    borderLeftWidth: 1
  },
  lastRowCellRight: {
    borderRightWidth: 1
  }
});
