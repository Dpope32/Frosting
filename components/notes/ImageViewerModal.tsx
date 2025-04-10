import React from 'react';
import { Image } from 'react-native';
import { Dialog, Adapt, Sheet, Button, XStack, Paragraph } from 'tamagui';
import { X } from '@tamagui/lucide-icons';

interface ImageViewerModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ imageUrl, onClose }) => {
  const isOpen = !!imageUrl;

  return (
    <Dialog modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.8}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="$backgroundTransparent"
        />
        
        <Adapt when="sm" platform="touch">
          <Sheet zIndex={200000} modal dismissOnSnapToBottom animation="quick"> 
            <Sheet.Frame padding="$4" justifyContent="center" alignItems="center">
              {imageUrl && (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                />
              )}
              <Button
                position="absolute"
                top="$3"
                right="$3"
                size="$3"
                circular
                icon={X}
                onPress={onClose}
                backgroundColor="$backgroundTransparent"
                pressStyle={{ backgroundColor: '$backgroundFocus' }}
                zIndex={10}
              />
            </Sheet.Frame>
            <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
          </Sheet>
        </Adapt>
        
        <Adapt when="md" platform="touch">
          <Dialog.Content
            bordered
            elevate
            key="content"
            animateOnly={['transform', 'opacity']}
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            gap="$4"
            backgroundColor="$background" 
            width="90%"
            maxWidth={600} 
            height="80%" 
            maxHeight={800}
            padding={0} 
            position="relative" 
          >
            {imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
              />
            )}
            <Dialog.Close asChild>
              <Button
                position="absolute"
                top="$3"
                right="$3"
                size="$3"
                circular
                icon={X}
                onPress={onClose}
                backgroundColor="$backgroundTransparent"
                pressStyle={{ backgroundColor: '$backgroundFocus' }}
                zIndex={10}
              />
            </Dialog.Close>
          </Dialog.Content>
        </Adapt>
      </Dialog.Portal>
    </Dialog>
  );
};
