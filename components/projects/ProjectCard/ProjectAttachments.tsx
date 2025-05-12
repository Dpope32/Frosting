import React from 'react';
import { ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { Attachment } from '@/types/notes';
import { isIpad } from '@/utils/deviceUtils';
import { useToastStore } from '@/store/ToastStore';

interface ProjectAttachmentsProps {
  attachments?: Attachment[];
  isDark: boolean;
  onImagePress?: (url: string) => void;
}

export const ProjectAttachments: React.FC<ProjectAttachmentsProps> = ({ 
  attachments, 
  isDark, 
  onImagePress 
}) => {
  const showToast = useToastStore((state) => state.showToast);
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
          paddingHorizontal: isIpad() ? 12 : 8,
          paddingVertical: 8
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
            <Image
              source={{ uri: att.url }}
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
