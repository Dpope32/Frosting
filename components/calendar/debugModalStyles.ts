import { StyleSheet, Platform } from 'react-native';

export const calendarStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 12,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      },
    }),
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    borderRightWidth: 1,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    borderRightWidth: 1,
    paddingHorizontal: 8,
  },
  closeButton: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
