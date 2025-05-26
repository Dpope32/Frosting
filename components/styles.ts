import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants';
import { isWeb } from 'tamagui';
import { isIpad } from '@/utils';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  step: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  input: {
    width: '100%',
    marginRight: 8,
    height: 45,
    borderWidth: 2,
    fontFamily: '$body',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: isWeb ? 17 : isIpad() ? 17 : 15,
  },
  imagePickerButton: {
    width: width * 0.4,
    height: width * 0.4,
    maxWidth: 180,
    maxHeight: 180,
    borderRadius: width * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.2,
  },
  skip: {
    marginTop: 16,
    fontSize: 14,
  },
  colorOptions: {
    flexGrow: 0,
    marginVertical: 24,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    transform: [{ scale: 1.1 }],
  },
  checkmark: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  backgroundOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  backgroundOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectedOption: {
    backgroundColor: Colors.light.tint,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  backButton: {
    padding: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
});