import { StyleSheet, Platform } from 'react-native';
import { isIpad } from '@/utils';
import { isWeb } from 'tamagui';

// ===== CONSISTENT GRAY SYSTEM =====
// Matching the clean 3-gray system from MonthStyles
const COLORS = {
  light: {
    background: '#FFFFFF',
    surface: '#F8F8F8', 
    surfaceSecondary: '#F0F0F0',
    border: '#E0E0E0',
    text: '#000000',
    textSecondary: '#666666',
  },
  dark: {
    background: '#1A1A1A',     // Main dark background
    surface: '#2A2A2A',        // Calendar cells  
    surfaceSecondary: '#333333', // Events/holidays
    border: '#404040',         // Subtle borders
    text: '#FFFFFF',           // Primary text
    textSecondary: '#CCCCCC',  // Secondary text
  },
};

export const getCalendarStyles = (webColumnCount: number, activeEventTypes: string[], isDark: boolean = true) => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  
  return StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: webColumnCount === 1 ? isWeb? 90 : 85 :
     webColumnCount === 2 ? isWeb ? 100 : 80 :
      webColumnCount === 3 ? isWeb ? 90 :
      (activeEventTypes?.length || 0) > 0 ? 90 : 95 : 85,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? {
      backgroundColor: 'transparent',
    } as any : {}),
    ...(isIpad() ? {
      paddingTop: 70,
      paddingHorizontal: webColumnCount === 1 ? 0 : 10,
      borderRadius: 0,
      overflow: 'hidden',
      backgroundColor: 'transparent',
    } as any : {}),
  },
  ipadMonthsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: webColumnCount === 1 ? -20 : isIpad() ? -10 : 0,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: -12,
  },
  layoutToggle: {
    position: 'absolute',
    top: 55,
    right: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' ? {
      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
    } : {})
  },
  webMonthsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: '100%',
    ...(isIpad() ? {
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    } as any : {}),
  },
  webMonthWrapper: {
    width: webColumnCount === 1
      ? '100%'
      : webColumnCount === 2
        ? '49%'
        : webColumnCount === 3 && Platform.OS === 'web'
          ? '31%'
          : webColumnCount === 3
            ? '33%'
            : '33%',
    padding: 0,
    margin: webColumnCount === 1
      ? 0
      : webColumnCount === 2
        ? isWeb ? 10 : 0
        : webColumnCount === 3 && Platform.OS === 'web'
          ? 0
          : webColumnCount === 3
            ? 4
            : 0,
      marginBottom: webColumnCount === 1
      ? isWeb ? 30 : isIpad() ? 0 : 0
      : webColumnCount === 2
        ? isWeb ? 20 : isIpad() ? 0 : 4
        : webColumnCount === 3 && Platform.OS === 'web'
          ? 20
          : webColumnCount === 3
            ? 4
            : 0,
    ...(Platform.OS === 'web' && webColumnCount === 3 ? {
      borderRadius: 12,
    } : Platform.OS === 'web' ? {
      borderRadius: 16,
      overflow: 'hidden'
    } : {}),
    ...(isIpad() ? {
      width: '49%',
      borderRadius: 12,
      overflow: 'hidden',
    } as any : {}),
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    position: 'absolute',
    bottom: 32,
    zIndex: 1000,
  },
  debugButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
  },
  modalContent: {
    width: '90%',
    minHeight: Platform.OS === 'web' ? '87.5%' : '72%',
    maxHeight: Platform.OS === 'web' ? '95%' : '100%',
    borderRadius: isWeb ? 16 : 16,
    elevation: 5,
    overflow: 'hidden',
    padding: 8,
    flexDirection: 'column',
    backgroundColor: colors.background,
  },
  modalHeader: {
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  eventsScrollView: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 400,
  },
  formScrollView: {
    flex: 1,
    padding: Platform.OS === 'web' ? 20 : 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: Platform.OS === 'web' ? 16 : 8,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  bottomButtonContainer: {
    width: '100%',
    padding: 12,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bigCloseButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderColor: colors.border,
    width: '50%',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigCloseButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  formGroup: {
    gap: Platform.OS === 'web' ? 12 : 6,
  },
  typeSelector: {
    flexGrow: 0,
    marginBottom: Platform.OS === 'web' ? 16 : 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  bigActionButton: {
    flex: 1,
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: colors.textSecondary,
  },
  addEventButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
};