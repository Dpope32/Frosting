import { Platform, StyleSheet } from 'react-native';
import { isIpad } from '@/utils';

export const getWeekStyles = (isDark: boolean) => StyleSheet.create({
  weekContainer: {
    borderRadius: 12,
    elevation: 3,
    padding: 0,
    margin: 10,
    backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
    overflow: 'hidden',
    borderWidth: isDark ? 0 : 1,
    borderColor: isDark ? 'transparent' : '#5c5c5c',
    ...(isIpad() ? {
      marginBottom: 20,
    } : {}),
  },
  header: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    backgroundColor: isDark ? '#1e1e1e' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#E8E8E8',
  },
  weekText: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#FFF' : '#333'
  },
  daysList: {
    flexDirection: 'column',
  },
  dayRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#5c5c5c',
    minHeight: 75,
    height: 'auto',
    position: 'relative',
  },
  weekendDayRow: {
    backgroundColor: isDark ? '#252525' : '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  today: {
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  pastDateRow: {
    position: 'relative',
  },
  pastDateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.99)' : 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  pastDateText: {
    color: isDark ? '#888' : '#999',
  },
  pastDateStrikethrough1: {
    position: 'absolute',
    width: '150%',
    height: 1.5,
    backgroundColor: isDark ? '#222' : '#999',
    top: '52%',
    left: '-35%',
    transform: isIpad() ? [{ rotate: '7deg' }] : [{ rotate: '10deg' }],
    zIndex: 11,
  },
  pastDateStrikethrough2: {
    position: 'absolute',
    width: '150%',
    height: 1.5,
    backgroundColor: isDark ? '#222' : '#999',
    top: '60%',
    left: '-10%',
    transform: isIpad() ? [{ rotate: '-7deg' }] : [{ rotate: '-10deg' }],
    zIndex: 11,
  },
  dayInfo: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 9,
    paddingLeft: 4,
    alignSelf: 'flex-start',
    paddingTop: 5,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#DDD' : '#555',
    marginRight: 8,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '500',
    color: isDark ? '#FFFFFF' : '#333333',
  },
  eventsContainer: {
    flex: 1,
    paddingLeft: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    gap: 8,
    zIndex: 9,
    minHeight: 55,
  },
  eventIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 5,
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  eventText: {
    fontSize: 14,
    marginLeft: 6,
    maxWidth: 120,
  },
  holidayIconText: {
    fontSize: 14,
  },
  birthdayIconText: {
    fontSize: 14,
  },
  nbaLogo: {
    width: 20,
    height: 20,
  }
}); 