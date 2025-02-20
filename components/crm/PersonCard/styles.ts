import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 2
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    borderWidth: 2,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 8
  },
  cardContent: {
    minHeight: 50
  },
  textContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginLeft: 8
  },
  nameText: {
    flexShrink: 1,
    marginRight: 0,
    lineHeight: 20,
    marginTop: -1,
    marginLeft: -6
  },
  occupationText: {
    lineHeight: 14,
    marginTop: 1,
    marginLeft: -6
  },
  touchable: {
    width: "100%"
  },
  avatarContainer: {
    position: "relative"
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 22,
    marginRight: -8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  avatarImage: {
    width: 40,
    height: 40
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
    marginRight: 0,
    marginLeft: -12
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalContainer: {
    borderRadius: 16,
    width: "85%",
    alignSelf: "center",
    backgroundColor: "rgba(20,20,20,0.95)",
    borderColor: "rgba(200,200,200,0.8)",
    borderWidth: 1,
    overflow: "hidden",
    maxHeight: "75%",
    minHeight: "50%"
  },
  modalContent: {
    padding: 12,
    paddingBottom: 160,
    position: 'relative'
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
    marginTop: 16
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
    borderColor: "#fff"
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
    paddingVertical: 10,
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
