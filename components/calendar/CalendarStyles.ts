import { StyleSheet, Platform, Dimensions } from 'react-native';

// Helper function to detect if device is iPad
const isIpad = () => {
  const { width, height } = Dimensions.get('window');
  // iPad detection based on screen dimensions and platform
  return (
    Platform.OS === 'ios' &&
    Math.min(width, height) >= 768 &&
    Math.max(width, height) >= 1024
  );
};

export const calendarStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    ...(Platform.OS === 'web' ? {
      paddingTop: 30,
      maxWidth: 1800,
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingHorizontal: 0,
    } as any : {}),
    ...(isIpad() ? {
      paddingTop: 60,
      paddingHorizontal: 12,
    } as any : {}),
  },
  webMonthsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: '100%',
    padding: 0,
    ...(isIpad() ? {
      justifyContent: 'center',
    } as any : {}),
  },
  webMonthWrapper: {
    width: '33%', // Default: Display 3 months per row
    padding: 0,
    margin: 1,
    ...(isIpad() ? {
      width: '49%', // iPad: Display 2 months per row
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
    borderRadius: 16,
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
  // Debug modal styles
  debugModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  debugModalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 20,
    elevation: 5,
    overflow: 'hidden',
    padding: 20,
  },
  debugModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  debugScroll: {
    maxHeight: 300,
  },
  debugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  debugLabel: {
    fontWeight: '600',
    marginRight: 8,
  },
  debugKey: {
    marginLeft: 16,
  },
  debugValue: {
    marginLeft: 8,
  },
  debugEventRow: {
    marginLeft: 16,
    marginBottom: 8,
  },
  debugEventTitle: {
    fontWeight: '600',
  },
  debugEventDate: {},
  debugEventType: {},
  debugCloseButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  debugCloseButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
