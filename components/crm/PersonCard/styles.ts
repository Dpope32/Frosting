import { StyleSheet, Platform, ViewStyle } from "react-native";

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
    marginHorizontal: Platform.OS === 'web' ? 4 : 2,
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
    alignSelf: 'flex-start'
  },
  reminderPill: {
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  card: {
    borderWidth: 2,
    padding: Platform.OS === 'web' ? 12 : 8,
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
    minHeight: Platform.OS === 'web' ? 60 : 50,
    ...(Platform.OS === 'web' ? {
      flexDirection: 'row',
      alignItems: 'center',
    } : {}),
  },
  textContainer: {
    flex: 1,
    height: Platform.OS === 'web' ? 'auto' as any : 40,
    justifyContent: 'center',
    marginLeft: Platform.OS === 'web' ? 12 : 8,
  },
  nameText: {
    flexShrink: 1,
    marginRight: 0,
    ...(Platform.OS === 'web' ? {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 0,
      marginTop: 0,
      flexWrap: 'wrap', // Allow text to wrap to next line if needed
      width: '100%', // Ensure text has full width of container
    } : {
      lineHeight: 20,
      marginTop: -1,
      marginLeft: -6,
    }),
  },
  occupationText: {
    ...(Platform.OS === 'web' ? {
      fontSize: 13,
      marginTop: 2, // Reduced from 4 to reduce padding below username
      marginLeft: 4, // Added margin-left to align with name when checkmark is active
    } : {
      lineHeight: 14,
      marginTop: 0, // Reduced from 1 to reduce padding below username
      marginLeft: -2, // Adjusted from -6 to align better with name when checkmark is active
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
      marginRight: -8,
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
      width: 40,
      height: 40
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
    marginRight: -4, // Restored from 0 to -4 as requested
    marginLeft: -12
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalContainer: {
    borderRadius: 16,
    alignSelf: "center",
    backgroundColor: "rgba(20,20,20,0.95)",
    borderColor: "rgba(200,200,200,0.8)",
    borderWidth: 1,
    overflow: "hidden",
    ...(Platform.OS === 'web' ? {
      width: 450,
      maxWidth: '90%',
      // Use percentage instead of viewport units for React Native compatibility
      maxHeight: '80%',
    } : {
      width: "85%",
      maxHeight: "75%",
      minHeight: "50%",
    }),
  } as ViewStyle,
  modalContent: {
    padding: Platform.OS === 'web' ? 16 : 12,
    paddingBottom: 160,
    ...(Platform.OS !== 'web' ? { position: 'relative' as const } : {}),
  },
  modalHeaderIcons: {
    position: 'absolute',
    top: -12,
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
    marginTop: Platform.OS === 'web' ? 20 : 16,
  },
  modalAvatarContainer: {
    position: 'relative',
    marginRight: 4
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
    fontWeight: '700',
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
    borderTopColor: "rgba(255,255,255,0.1)"
  },
  actionButton: {
    width: 60,
    height: 65,
    alignItems: "center",
    justifyContent: "center"
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
    flexWrap: 'wrap',
    gap: 6
  }
});
