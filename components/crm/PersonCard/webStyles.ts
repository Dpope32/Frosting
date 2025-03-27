// Web-specific styles for PersonCard component
export const webStyles = {
  // Card styles
  card: {
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease',
    padding: 12,
    borderRadius: 8,
  },
  
  // Text styles
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 0,
    mt: 0,
  },
  
  occupationText: {
    fontSize: 13,
    mt: 4,
    marginLeft: 0,
  },
  
  // Avatar styles
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarWrapper: {
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    borderRadius: 12, // Increased from 24 to make it bigger
  },
  
  avatarImage: {
    width: 120, // Increased from 40 (default in styles.ts)
    height: 120, // Increased from 40 (default in styles.ts)
  },
  
  // Modal styles
  modalContainer: {
    width: '450px',
    maxWidth: '90%',
    maxHeight: '80%', // Changed from '80vh' to '80%' for React Native compatibility
  },
  
  modalContent: {
    padding: 16,
  },
  
  headerRow: {
    mt: 20,
  },
  
  modalAvatar: {
    objectFit: 'cover',
  },
  
  actionBar: {
    paddingVertical: 12,
  }
};
