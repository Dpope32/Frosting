import { StyleSheet, Platform, ViewStyle } from "react-native";
import { isIpad } from "@/utils/deviceUtils";
// Web-specific styles as a separate object
const webSpecificStyles = Platform.OS === 'web' ? {
  card: {
    // @ts-ignore - Web-specific CSS properties
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease',
  },
  avatarWrapper: {
    // @ts-ignore - Web-specific CSS properties
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  modalContainer: {
    width: 450,
    maxWidth: '90%',
    maxHeight: '80vh',
  },
  modalAvatar: {
    // @ts-ignore - Web-specific CSS properties
    objectFit: 'cover',
  },
} : {};

// Create the styles with platform-specific overrides
export const styles = StyleSheet.create({
  container: {
    marginVertical: Platform.OS === 'web' ? 6 : 4,
    marginHorizontal: Platform.OS === 'web' ? 0 : 0,
    ...(Platform.OS === 'web' ? { 
      maxWidth: '100%' as any, // Changed back to 100% since we're handling columns in the parent component
      minWidth: '220px' as any, // Increased from 200px to 220px to make cards wider
    } : {
      width: '100%', // Make mobile cards take full width in single column
    }),
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    flex: 1,
    minWidth: 130, // Add minimum width to prevent pills from being too narrow
    maxWidth: Platform.OS === 'web' ? 200 : 160, // Limit width on mobile
  },
  reminderPill: {
  },
  card: {
    borderWidth: 2,
    padding: Platform.OS === 'web' ? 12 : 6, 
    paddingHorizontal: Platform.OS === 'web' ? 12 : 16, 
    paddingBottom: Platform.OS === 'web' ? 12 : 8, 
    borderRadius: 12,
    width: Platform.OS === 'web' ? 'auto' : '100%',
    ...(Platform.OS === 'web' ? webSpecificStyles.card : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }),
  },
  cardContent: {
    minHeight: Platform.OS === 'web' ? 60 : isIpad() ? 60 : 50,
    ...(Platform.OS === 'web' ? {
      flexDirection: 'row',
      alignItems: 'center',
    } : {
      flexDirection: 'row',
      alignItems: 'center',
    }),
  },
  textContainer: {
    flex: 1,
    height: Platform.OS === 'web' ? 'auto' as any : 'auto',
    justifyContent: 'center',
    marginLeft: Platform.OS === 'web' ? 12 : 2,
  },
  nameText: {
    flexShrink: 1,
    marginRight: 0,
    ...(Platform.OS === 'web' ? {
      fontSize: 17,
      fontWeight: '800',
      marginLeft: 0,
      mt: 0,
      width: '100%',
    } : {
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 20,
    }),
  },
  occupationText: {
    ...(Platform.OS === 'web' ? {
      fontSize: 13,
      marginLeft: 4,
    } : {
      fontSize: 13,
      lineHeight: 16,
      marginLeft: 4,
      flexShrink: 1,
      width: '100%',
    }),
  },
  additionalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    flexWrap: 'wrap',
    gap: 4,
  },
  contactInfo: {
    fontSize: 12,
    lineHeight: 14,
    opacity: 0.8,
    flexShrink: 1,
  },
  statusChip: {
    fontSize: 11,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  lastContactText: {
    fontSize: 11,
    opacity: 0.6,
  },
  touchable: {
    width: "100%"
  },
  avatarContainer: {
    position: "relative",
    ...(Platform.OS === 'web' ? {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    } : {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    }),
  },
  avatarWrapper: {
    borderWidth: 2,
    borderRadius: Platform.OS === 'web' ? 30 : 25,
    overflow: "hidden",
    ...(Platform.OS === 'web' ? webSpecificStyles.avatarWrapper : {
      borderColor: "#fff",
      marginHorizontal: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }),
  },
  avatarImage: {
    ...(Platform.OS === 'web' ? {
      width: 60,
      height: 60,
    } : {
      width: isIpad() ? 50 : 40,
      height: isIpad() ? 50 : 40
    }),
  },
  starIndicator: {
    position: "absolute",
    bottom: -2,
    left: -2,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: "#FFD700"
  },
  checkmark: {
    marginRight: 0, // Restored from 0 to -4 as requested
    marginLeft: -20,
    backgroundColor: 'rgba(111, 255, 44, 0.1)',
    borderRadius: 12,
    shadowColor: 'rgba(111, 255, 44, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalContainer: {
    borderRadius: 6,
    alignSelf: "center",
    backgroundColor: "rgba(20,20,20,0.95)",
    borderColor: "rgba(200,200,200,0.8)",
    paddingHorizontal: 4,
    borderWidth: 2.5, 
    ...(Platform.OS === 'web' ? {
      width: 450,
      maxWidth: '90%',
      maxHeight: '80%',
    } : {
      width: "85%",
      maxHeight: "75%",
      minHeight: "50%",
    }),
    // Remove overflow: "hidden" to prevent border clipping
  } as ViewStyle,
  modalContent: {
    padding: Platform.OS === 'web' ? 16 : 12,
    paddingBottom: 160, // Adding space for the action bar
    ...(Platform.OS !== 'web' ? { position: 'relative' as const } : {}),
  },
  modalHeaderIcons: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 10 : 10,
    left: 10,
    right: 10,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Platform.OS === 'web' ? 10 : 5,
    paddingTop: Platform.OS === 'web' ? 0 : 5,
  },
  shareIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  closeIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginTop: Platform.OS === 'web' ? 10 : 0,
    marginRight: Platform.OS === 'web' ? 10 : 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 20 : 10,
    marginBottom: 15,
  },
  modalAvatarContainer: {
    position: 'relative',
    marginRight: 8,
    paddingHorizontal: 10,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    ...(Platform.OS === 'web' ? webSpecificStyles.modalAvatar : {
      borderColor: "#fff",
    }),
  },
  modalStarIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  nameColumn: {
    flex: 1
  },
  modalNameText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    flexShrink: 1
  },
  infoSection: {
    marginTop: 16,
    gap: 15,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(20,20,20,0.95)",
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    zIndex: 50, // Add high zIndex to ensure it's on top
  },
  actionButton: {
    width: 60,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 51, // Make the buttons higher than the bar itself
    // Add hit slop to increase the touch area
    padding: 8, 
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500"
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 15,
    justifyContent: 'space-between', // Ensure pills are spaced evenly
    flexWrap: 'nowrap', // Prevent wrapping to ensure horizontal layout
    gap: 6
  },
  modalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  modalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  modalTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoRow: {
    alignItems: 'center',
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
});