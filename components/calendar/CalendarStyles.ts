import { StyleSheet, Platform } from 'react-native';
import { isIpad } from '@/utils';
import { isWeb } from 'tamagui';

export const getCalendarStyles = (webColumnCount: number) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: webColumnCount === 1 ? 90 : webColumnCount === 2 ? isWeb ? 100 : 80 : webColumnCount === 3 ? isWeb ? 90 : 80 : 80,
    backgroundColor: Platform.OS === 'web' ? '#f0f2f5' : undefined,
    ...(Platform.OS === 'web' ? {
      backgroundColor: '#f0f2f5',
    } as any : {}),
    ...(isIpad() ? {
      paddingTop: 80,
      paddingHorizontal: 10,
      paddingLeft: 16,
      backgroundColor: '#f0f2f5',
    } as any : {}),
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
    backgroundColor: '#fff',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    } : {})
  },
  webMonthsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: '100%',
    ...(isIpad() ? {
      justifyContent: 'center',
      paddingTop: 8,
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
        ? isWeb ? 20 : 4
        : webColumnCount === 3 && Platform.OS === 'web'
          ? 0
          : webColumnCount === 3
            ? 4
            : 0,
      marginBottom: webColumnCount === 1
      ? isWeb ? 30 : isIpad() ? 20 : 10
      : webColumnCount === 2
        ? isWeb ? 20 : isIpad() ? 10 : 4
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
      margin: '0.5%',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modalContent: {
    width: '90%',
    minHeight: Platform.OS === 'web' ? '87.5%' : '72%',
    maxHeight: Platform.OS === 'web' ? '95%' : '100%',
    borderRadius: isWeb ? 12 : 16,
    elevation: 5,
    overflow: 'hidden',
    padding: 8,
    flexDirection: 'column',
  },
  modalHeader: {
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
    borderColor: '#444',
    borderRadius: 12,
    padding: 12,
    marginBottom: Platform.OS === 'web' ? 16 : 8,
    fontSize: 16,
  },
  bottomButtonContainer: {
    width: '100%',
    padding: 12,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'flex-end',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bigCloseButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderColor: 'rgba(200,200,200,1)',
    width: '50%',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigCloseButtonText: {
    color: 'rgba(255,255,255,1)',
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
    backgroundColor: '#666666',
  },
  addEventButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
