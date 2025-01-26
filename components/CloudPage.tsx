import React, { useState, useCallback, useMemo, memo } from 'react';
import { Text, Button, XStack, YStack, Image } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

interface Photo {
  id: string;
  uri: any;
  date: string;
  folder: string;
}

interface Folder {
  id: string;
  name: string;
  count: number;
}

// Mock data
const mockPhotos: Photo[] = [
  { id: '1', uri: require('@/assets/images/ph4.png'), date: '2024-01-26', folder: 'Family' },
  { id: '2', uri: require('@/assets/images/ph3.png'), date: '2024-01-26', folder: 'Family' },
  { id: '3', uri: require('@/assets/images/ph2.png'), date: '2024-01-25', folder: 'Vacation' },
  { id: '4', uri: require('@/assets/images/ph1.png'), date: '2024-01-25', folder: 'Vacation' },
];

const mockFolders: Folder[] = [
  { id: '1', name: 'Family', count: 156 },
  { id: '2', name: 'Vacation', count: 243 },
  { id: '3', name: 'Screenshots', count: 45 },
];

interface PhotoItemProps {
  uri: any;
  date: string;
}

const PhotoItem = memo(({ uri, date }: PhotoItemProps) => (
  <YStack 
    width={120} 
    height={120} 
    margin={4} 
    borderRadius="$4" 
    overflow="hidden"
    animation="lazy"
    pressStyle={{ scale: 0.98 }}
  >
    <Image 
      source={uri}
      alt="gallery item"
      resizeMode="cover"
      width={120}
      height={120}
    />
  </YStack>
));

interface FolderItemProps {
  name: string;
  count: number;
  onSelect: (name: string) => void;
}

const FolderItem = memo(({ name, count, onSelect }: FolderItemProps) => (
  <YStack 
    backgroundColor="$gray8"
    padding="$3"
    margin={4}
    borderRadius="$4"
    width={160}
    animation="bouncy"
    pressStyle={{ scale: 0.98 }}
    onPress={() => onSelect(name)}
  >
    <XStack alignItems="center" gap="$2">
      <Ionicons name="folder-outline" size={16} color="#fff" />
      <YStack>
        <Text color="$color" fontSize="$4" fontFamily="$body">
          {name}
        </Text>
        <Text color="$gray11" fontSize="$3" fontFamily="$body">
          {count} items
        </Text>
      </YStack>
    </XStack>
  </YStack>
));

type ViewType = 'grid' | 'folders';

export default function CloudPage() {
  const [activeView, setActiveView] = useState<ViewType>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  
  const photos = useMemo(() => mockPhotos, []);
  const folders = useMemo(() => mockFolders, []);

  const handleFolderSelect = useCallback((name: string) => {
    setSelectedFolder(name);
    setActiveView('grid');
  }, []);

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
  }, []);

  const renderPhotoItem = useCallback(({ item }: { item: Photo }) => (
    <PhotoItem uri={item.uri} date={item.date} />
  ), []);

  const renderFolderItem = useCallback(({ item }: { item: Folder }) => (
    <FolderItem 
      name={item.name} 
      count={item.count} 
      onSelect={handleFolderSelect}
    />
  ), [handleFolderSelect]);

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack 
        padding="$4"
        paddingTop={80}
        backgroundColor="$backgroundStrong" 
        justifyContent="space-between" 
        alignItems="center"
      >
        <Text color="$color" fontSize="$6" fontWeight="bold" fontFamily="$body">
          {selectedFolder || 'Gallery'}
        </Text>
      </XStack>

      <XStack padding="$2" gap="$2">
        <Button
          theme={activeView === 'grid' ? 'active' : undefined}
          onPress={() => handleViewChange('grid')}
          icon={<Ionicons name="grid-outline" size={20} color="#fff" />}
          pressStyle={{ scale: 0.98 }}
          animation="quick"
        >
          Grid
        </Button>
        <Button
          theme={activeView === 'folders' ? 'active' : undefined}
          onPress={() => handleViewChange('folders')}
          icon={<Ionicons name="folder-outline" size={20} color="#fff" />}
          pressStyle={{ scale: 0.98 }}
          animation="quick"
        >
          Folders
        </Button>

        <XStack gap="$3" paddingLeft={32}>
          <Button 
            icon={<Ionicons name="add-circle-outline" size={24} color="#fff" />}
            size="$3"
            circular
            backgroundColor="$backgroundHover"
            pressStyle={{ scale: 0.96 }}
            animation="quick"
            onPress={() => console.log('Add photos')}
          />
          <Button 
            icon={<Ionicons name="duplicate-outline" size={24} color="#fff" />}
            size="$3"
            circular
            backgroundColor="$backgroundHover"
            pressStyle={{ scale: 0.96 }}
            animation="quick"
            onPress={() => console.log('Upload Folder')}
          />
        </XStack>

      </XStack>

      {activeView === 'grid' ? (
        <FlashList
          data={photos}
          renderItem={renderPhotoItem}
          estimatedItemSize={120}
          numColumns={3}
          removeClippedSubviews
          initialScrollIndex={0}

          contentContainerStyle={{ padding: 4 }}
        />
      ) : (
        <FlashList
          data={folders}
          renderItem={renderFolderItem}
          estimatedItemSize={64}
          removeClippedSubviews


          contentContainerStyle={{ padding: 4 }}
        />
      )}
    </YStack>
  );
}