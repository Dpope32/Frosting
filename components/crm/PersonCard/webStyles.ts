// Web-specific styles for PersonCard component
export const webStyles = {
  // Card styles - Fixed to be responsive and not overlap
  card: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease-in-out',
    padding: 16,
    borderRadius: 12,
    width: '100%', // Changed from fixed 420px to responsive
    minHeight: 90, // Reduced from 120 - was way too tall
    maxWidth: '380px', // Reduced from 400px to fit more on screen
    border: 'none', // Remove ugly borders
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    }
  },
  
  // Text styles
  nameText: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 0,
    mt: 0,
    lineHeight: 1.2,
  },
  
  occupationText: {
    fontSize: 12,
    mt: 2,
    marginLeft: 0,
    opacity: 0.7,
  },
  
  // Avatar styles - Fixed the terrible border issues
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarWrapper: {
    boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
    borderRadius: 50, // Perfect circle
    border: 'none', // Remove the ugly border completely
    overflow: 'hidden',
  },
  
  avatarImage: {
    width: 65,
    height: 65,
  },
  
  // Modal styles
  modalContainer: {
    width: '500px',
    maxWidth: '90vw',
    maxHeight: '85vh',
    borderRadius: 16,
  },
  
  modalContent: {
    padding: 24,
  },
  
  headerRow: {
    mt: 24,
  },
  
  modalAvatar: {
    objectFit: 'cover',
  },
  
  actionBar: {
    paddingVertical: 16,
  }
};
