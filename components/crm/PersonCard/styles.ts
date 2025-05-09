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
    } : {}),
  },
  statusPill: {
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    borderWidth: 2,
    padding: Platform.OS === 'web' ? 12 : 6,
    paddingHorizontal: 12,
    borderRadius: 8,
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
    } : {}),
  },
  textContainer: {
    flex: 1,
    height: Platform.OS === 'web' ? 'auto' as any : 40,
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
      width: '100%', // Ensure text has full width of container
    } : {
      lineHeight: 20,
    }),
  },
  occupationText: {
    ...(Platform.OS === 'web' ? {
      fontSize: 13,
      marginLeft: 4, // Added margin-left to align with name when checkmark is active
    } : {
      lineHeight: 14,
      marginLeft: 2, // Adjusted from -6 to align better with name when checkmark is active
      flexShrink: 1, // Prevent text from expanding container
      width: '100%', // Ensure text has full width of container
    }),
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
    } : {}),
  },
  avatarWrapper: {
    borderWidth: 2,
    borderRadius: Platform.OS === 'web' ? 30 : 22, // Increased from 24 to 30 on web to match webStyles
    overflow: "hidden",
    ...(Platform.OS === 'web' ? webSpecificStyles.avatarWrapper : {
      borderColor: "#fff",
      marginHorizontal: -4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }),
  },
  avatarImage: {
    ...(Platform.OS === 'web' ? {
      width: 60, // Increased from 40 to 60 on web to match webStyles
      height: 60, // Increased from 40 to 60 on web to match webStyles
    } : {
      width: isIpad() ? 40 : 33,
      height: isIpad() ? 40 : 33
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
    top: Platform.OS === 'web' ? -12 : 0,
    left: 10,
    right: 10,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  shareIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20
  },
  closeIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 20 : 0,
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
    gap: 12
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
    marginBottom: 8,
    justifyContent: 'space-between', // Ensure pills are spaced evenly
    flexWrap: 'nowrap', // Prevent wrapping to ensure horizontal layout
    gap: 6
  }
});