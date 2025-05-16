import React, { useState } from 'react';
import { YStack, XStack, Text, Button, ScrollView } from 'tamagui';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Attachment } from '@/types';
import { isIpad } from '@/utils';
import { useImagePicker } from '@/hooks/useImagePicker';
import { SimpleImageViewer } from '@/components/notes/SimpleImageViewer';

interface AttachmentSelectorProps {
  isDark: boolean;
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
}

export const AttachmentSelector = ({ isDark, attachments, setAttachments }: AttachmentSelectorProps) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { pickImage } = useImagePicker();

  return (
    <YStack gap="$2" mx={8}>
      <XStack alignItems="center" justifyContent="space-between" px={isIpad() ? '$2' : '$1'}>
        <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="500">
          Attachments
        </Text>
        <Button
          size="$3"
          circular
          backgroundColor={isDark ? 'transparent' : 'rgba(0,0,0,0.05)'}
          onPress={async () => {
            const imageUri = await pickImage();
            if (imageUri) {
              const newAttachment: Attachment = {
                id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                name: imageUri.split('/').pop() || 'image.jpg',
                url: imageUri,
                type: 'image',
              };
              setAttachments([...attachments, newAttachment]);
            }
          }}
          disabled={isLoading}
          pressStyle={{ opacity: 0.8 }}
        >
          <MaterialCommunityIcons name="paperclip" size={20} backgroundColor={isDark ? 'rgba(0,0,0,0.0)' : 'rgba(0,0,0,0.0)'} color={isDark ? '#999' : '#666'} />
        </Button>
      </XStack>
      
      {attachments.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: isIpad() ? 8 : 4 }}
        >
          {attachments.map((att) => (
            att.type === 'image' && (
              <TouchableOpacity
                key={att.id}
                onPress={() => setSelectedImageUrl(att.url)}
                style={styles.attachmentContainer}
              >
                <Image
                  source={{ uri: att.url }}
                  style={styles.attachmentImage}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setAttachments(attachments.filter(a => a.id !== att.id));
                  }}
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </TouchableOpacity>
            )
          ))}
        </ScrollView>
      )}
      
      {selectedImageUrl && (
        <SimpleImageViewer
          imageUrl={selectedImageUrl}
          onClose={() => setSelectedImageUrl(null)}
          isDark={isDark}
        />
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  attachmentContainer: {
    width: 120,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.0)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
