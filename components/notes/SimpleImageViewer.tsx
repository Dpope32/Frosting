import React, { useEffect } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import { useToastStore } from '@/store/ToastStore';

interface SimpleImageViewerProps {
  imageUrl: string | null;
  onClose: () => void;
}

/**
 * A simpler image viewer that uses React Native's Modal directly
 * instead of potentially problematic Tamagui Dialog/AnimatePresence
 */
export const SimpleImageViewer: React.FC<SimpleImageViewerProps> = ({ imageUrl, onClose }) => {
  const showToast = useToastStore((state) => state.showToast);
  const isOpen = !!imageUrl;
  if (!isOpen || !imageUrl) return null;
  
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        onClose();
      }}
    >
      <View style={styles.modalContainer}>
        <YStack style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            onError={(e) => {
              showToast("Error loading image", "error");
            }}
          />
          
          <TouchableOpacity style={styles.closeButton} onPress={() => {
            onClose();
          }}>
            <X color="white" size={24} />
          </TouchableOpacity>
        </YStack>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%', 
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 4,
  },
});

export default SimpleImageViewer;
