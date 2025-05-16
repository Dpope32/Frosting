import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { isWeb, YStack } from 'tamagui';
import { Attachment } from '@/types';
import { isIpad } from '@/utils/deviceUtils';
import { CachedImage } from '@/components/common/CachedImage';

interface ProjectAttachmentsProps {
  attachments?: Attachment[];
  isDark: boolean;
  onImagePress?: (url: string) => void;
}

export const ProjectAttachments: React.FC<ProjectAttachmentsProps> = ({ 
  attachments, 
  onImagePress 
}) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const imageAttachments = attachments.filter(att => att.type === 'image');
  
  if (imageAttachments.length === 0) {
    return null;
  }

  return (
    <YStack>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8, 
          paddingHorizontal: isIpad() ? 12 : isWeb? 16 : 8,
          paddingVertical: isWeb? 16 :8,
          paddingBottom: isWeb? 30 : 8
        }}
      >
        {imageAttachments.map((att, idx) => (
          <TouchableOpacity
            key={att.id ? `${att.id}-${idx}` : `${att.url}-${idx}`}
            onPress={() => {

              if (onImagePress) {
                onImagePress(att.url);
              } else {
              }
            }}
            style={styles.attachmentContainer}
          >
            <CachedImage
              uri={att.url}
              style={styles.attachmentImage}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </YStack>
  );
};

const styles = StyleSheet.create({
  attachmentContainer: {
    width: 120,
    height: 90,
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 124, 124, 0.53)',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 124, 124, 0.53)',
  },
});

export default ProjectAttachments;
