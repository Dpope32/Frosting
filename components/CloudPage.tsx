import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { Text, Button, XStack, YStack, Image, ScrollView, Spinner } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { listUserPhotos, listUserFolders } from '@/utils/S3Storage';

interface Photo {
  id: string;
  uri: string;
  date: string;
  folder: string;
}

interface Folder {
  id: string;
  name: string;
  count: number;
}

const PhotoItem = memo(({ uri }: { uri: string }) => (
  <YStack 
    width={120} 
    height={120} 
    margin={4} 
    borderRadius="$4" 
    overflow="hidden"
    pressStyle={{ scale: 0.98 }}
  >
    <Image 
      source={{ uri }}
      alt="gallery item"
      objectFit="cover"
      width={120}
      height={120}
    />
  </YStack>
));

const FolderButton = memo(({ name, isSelected, onPress }: { 
  name: string, 
  isSelected: boolean,
  onPress: () => void 
}) => (
  <Button
    backgroundColor={isSelected ? '$blue8' : '$gray8'}
    paddingHorizontal="$4"
    paddingVertical="$2"
    margin="$2"
    borderRadius="$6"
    onPress={onPress}
  >
    <Text color="$color">{name}</Text>
  </Button>
));

export default function CloudPage() {
  const username = useUserStore(state => state.preferences.username);
  const [selectedFolder, setSelectedFolder] = useState<string>('photos');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFolders();
    loadPhotos();
  }, [username]);

  const loadFolders = async () => {
    try {
      const userFolders = await listUserFolders(username);
      const folderObjects = userFolders.map(folder => ({
        id: folder,
        name: folder.charAt(0).toUpperCase() + folder.slice(1),
        count: 0
      }));
      setFolders([{ id: 'photos', name: 'All Photos', count: 0 }, ...folderObjects]);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const s3Objects = await listUserPhotos(username, selectedFolder === 'photos' ? undefined : selectedFolder);
      const photoObjects = s3Objects.map(obj => ({
        id: obj.key,
        uri: obj.uri,
        date: obj.lastModified?.toISOString() || new Date().toISOString(),
        folder: selectedFolder
      }));
      setPhotos(photoObjects);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [selectedFolder]);

  const handleAddPhoto = async () => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        
        const fileName = `${Date.now()}.jpg`;
        const path = `users/${username}/${selectedFolder}/${fileName}`;
        
        const uploadResponse = await fetch(`${process.env.EXPO_PUBLIC_S3_BUCKET_URL}/${path}`, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': 'image/jpeg',
            'x-amz-acl': 'private'
          }
        });

        if (uploadResponse.ok) {
          // Add the new photo to the state
          const newPhoto = {
            id: fileName,
            uri: `${process.env.EXPO_PUBLIC_S3_BUCKET_URL}/${path}`,
            date: new Date().toISOString(),
            folder: selectedFolder
          };
          setPhotos(prev => [newPhoto, ...prev]);
        }
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
      Alert.alert('Upload Error', 'Failed to upload photo. Please try again.');
    }
  };

  const filteredPhotos = useMemo(() => {
    if (selectedFolder === 'All Photos') return photos;
    return photos.filter(photo => photo.folder === selectedFolder);
  }, [photos, selectedFolder]);

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
          Photos
        </Text>
        <Button
          icon={<Ionicons name="add-circle-outline" size={24} color="#fff" />}
          size="$3"
          circular
          backgroundColor="$backgroundHover"
          pressStyle={{ scale: 0.96 }}
          onPress={handleAddPhoto}
        />
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} padding="$2">
        {folders.map(folder => (
          <FolderButton
            key={folder.id}
            name={folder.name}
            isSelected={selectedFolder === folder.name}
            onPress={() => setSelectedFolder(folder.name)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$blue8" />
        </YStack>
      ) : (
        <FlashList
          data={filteredPhotos}
          renderItem={({ item }) => <PhotoItem uri={item.uri} />}
          estimatedItemSize={120}
          numColumns={3}
          contentContainerStyle={{ padding: 4 }}
        />
      )}
    </YStack>
  );
}
