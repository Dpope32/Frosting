import { StyleSheet } from 'react-native'
import { isIpad } from '@/utils/deviceUtils'

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  headerContainer: {
    padding: isIpad() ? 16 : 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginTop: isIpad() ? 12 : 8,
    marginBottom: isIpad() ? -12 : -8
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  formContainer: {
    padding: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8
  },
  typesContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 12
  },
  typeButton: {
    marginRight: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 12
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  notificationContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    marginBottom: 12
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  switchLabel: {
    fontSize: 16
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.0)',
    marginTop: 6,
    borderWidth: 1
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 6,
    backgroundColor: 'rgba(255, 255, 255, 0)'
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)'
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center'
  },

  buttonEvent: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 36,
    height: 36,
    zIndex: 10,
    elevation: 6,
  },
  cancelButton: {
    marginRight: 8
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff'
  },
  timePickerContainer: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20
  },
  webTimePicker: {
    width: '80%',
    marginBottom: 40
  },
  nativeTimePicker: {
    height: 180,
    marginBottom: 20
  },
  doneButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end'
  },
  doneButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16
  },
  eventCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 8,
    width: '98%',
    alignSelf: 'center'
  },
  addButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
})
