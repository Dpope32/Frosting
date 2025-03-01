// StorageScreen.tsx
import { useState } from 'react'
import { YStack, Text, Button, Progress, XStack } from 'tamagui'
import { Platform, View, useColorScheme, ScrollView, Image } from 'react-native'
import { useUserStore } from '@/store/UserStore'
import { testNotification } from '@/services/notificationServices'
import { Plus, Bell, PlayCircle } from '@tamagui/lucide-icons'
import { Video, ResizeMode } from 'expo-av'
import { useStorage } from '@/hooks/useStorage' 

export default function StorageScreen() {
  const { 
    pickAndUploadFiles, 
    progress, 
    isUploading, 
    stats, 
    formatSize, 
    currentFileIndex, 
    totalFiles,
    mediaItems,
    isLoading,
    getMediaUrl,
    isImageFile,
    isVideoFile,
    activeServer
  } = useStorage() 
  
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'
  const getColumnCount = () => (isWeb ? 4 : 3)
  const columnCount = getColumnCount()
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  

  return (
    <YStack flex={1} padding={isWeb ? "$6" : "$2"} paddingTop={isWeb? 60 : 100} gap="$6" bg={isDark ? '#000' : '#fff'}>
      <XStack
        backgroundColor={isDark ? '#1a1a1a' : '#f5f5f5'}
        padding="$4"
        borderRadius="$4"
        borderWidth={1}
        borderColor={isDark ? '#333' : '#e0e0e0'}
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap="$4"
      >
        <YStack flex={1} minWidth={200} gap="$1">
          <Text fontFamily="$body" fontSize="$6" fontWeight="bold" color={isDark ? '#fff' : '#000'}>
            Cloud Storage
          </Text>
          <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
            Securely store and manage your files.
          </Text>
        </YStack>
        
        <XStack 
          gap="$5" 
          flexWrap="wrap" 
          justifyContent="flex-end" 
          alignItems="center"
          backgroundColor={isDark ? '#222' : '#e8e8e8'}
          borderRadius="$3"
          padding="$3"
          borderLeftWidth={4}
          borderLeftColor={primaryColor}
        >
          <YStack alignItems="center" gap="$1" minWidth={100}>
            <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
              Used Space
            </Text>
            <Text fontFamily="$body" fontSize="$5" fontWeight="bold" color={primaryColor}>
              {formatSize(stats.totalSize)}
            </Text>
          </YStack>
          
          <YStack alignItems="center" gap="$1" minWidth={100}>
            <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
              Total Files
            </Text>
            <Text fontFamily="$body" fontSize="$5" fontWeight="bold" color={primaryColor}>
              {stats.fileCount}
            </Text>
          </YStack>
        </XStack>
      </XStack>

      {isUploading && (
        <XStack
          backgroundColor={isDark ? '#1a1a1a' : '#f5f5f5'}
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor={isDark ? '#333' : '#e0e0e0'}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap="$4"
        >
          <YStack flex={1} minWidth={200} gap="$2">
            <Text
              fontFamily="$body"
              fontSize="$5"
              fontWeight="bold"
              color={isDark ? '#fff' : '#000'}
            >
              Uploading Files
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$3"
              color={isDark ? '#ccc' : '#666'}
            >
              File {currentFileIndex} of {totalFiles} • {progress}% Complete
            </Text>
            <Progress 
              value={progress} 
              backgroundColor={isDark ? '#333' : '#ddd'}
              width="100%"
            >
              <Progress.Indicator animation="bouncy" backgroundColor={primaryColor} />
            </Progress>
          </YStack>
          
          <XStack 
            backgroundColor={isDark ? '#222' : '#e8e8e8'} 
            borderRadius="$3"
            padding="$3"
            alignItems="center"
            justifyContent="center"
            minWidth={120}
            height={80}
            borderLeftWidth={4}
            borderLeftColor={primaryColor}
          >
            <Text
              fontFamily="$body"
              fontSize="$7"
              fontWeight="bold"
              color={primaryColor}
            >
              {progress}%
            </Text>
          </XStack>
        </XStack>
      )}

      {isLoading ? (
        <YStack 
          alignItems="center" 
          justifyContent="center" 
          flex={1}
          backgroundColor={isDark ? '#1a1a1a' : '#f5f5f5'}
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor={isDark ? '#333' : '#e0e0e0'}
        >
          <Text 
            fontFamily="$body"
            fontSize="$5"
            fontWeight="bold"
            color={isDark ? '#fff' : '#000'}
          >
            Loading your media...
          </Text>
        </YStack>
      ) : !mediaItems.length ? (
        <XStack
          backgroundColor={isDark ? '#1a1a1a' : '#f5f5f5'}
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor={isDark ? '#333' : '#e0e0e0'}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap="$4"
        >
          <YStack flex={1} minWidth={200} gap="$2" minHeight={100}>
            <Text
              fontFamily="$body"
              fontSize="$5"
              fontWeight="bold"
              color={isDark ? '#fff' : '#000'}
            >
              No media backed up yet
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$3"
              color={isDark ? '#ccc' : '#666'}
            >
              Your uploaded files and media will appear here. Tap the plus button in the bottom right to get started. 
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$3"
              color={isDark ? '#ccc' : '#666'}
            >
              All media is only accessible to the user and is encrypted on the server side. Why would I want to see your media? 
              I get way better storage rates when they are compressed anyway.
            </Text>
          </YStack>
        </XStack>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            gap: isWeb ? 8 : 4,
            padding: isWeb ? 4 : 2
          }}
        >
          {mediaItems.map((item, idx) => {
            const mediaUrl = getMediaUrl(item);
            
            const width = isWeb 
              ? `calc(${80 / columnCount}% - ${8 * (columnCount) / columnCount}px)`
              : `${(95 / columnCount) - (8 * (columnCount ) / 100)}%`;
            
            return (
              <YStack
                key={idx}
                width={width}
                minWidth={isWeb ? 220 : 90}
                aspectRatio={1}
                bg={isDark ? '#222' : '#eee'}
                borderRadius="$2"
                overflow="hidden"
                position="relative"
              >
                {isImageFile(item.name) ? (
                  <Image 
                    source={{ uri: mediaUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : isVideoFile(item.name) ? (
                  <YStack 
                    flex={1} 
                    alignItems="center" 
                    justifyContent="center"
                    onPress={() => setSelectedVideo(getMediaUrl(item, true))}
                    pressStyle={{ opacity: 0.8 }}
                  >
                    {/* Background image as thumbnail for video */}
                    <Image 
                      source={{ uri: mediaUrl }}
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0.7
                      }}
                      resizeMode="cover"
                    />
                    
                    {/* Semi-transparent overlay */}
                    <View 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        backgroundColor: 'rgba(0,0,0,0.4)'
                      }} 
                    />
                    
                    {/* Video badge */}
                    <Text
                      fontFamily="$body"
                      fontSize="$2"
                      color="#fff"
                      fontWeight="bold"
                      style={{ 
                        position: 'absolute', 
                        top: 4, 
                        left: 4,
                        backgroundColor: primaryColor,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4
                      }}
                    >
                      VIDEO
                    </Text>
                    
                    {/* Play button icon */}
                    <PlayCircle 
                      size={24} 
                      color="#fff" 
                      style={{
                        opacity: 0.9,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 3,
                      }}
                    />
                  </YStack>
                ) : (
                  <YStack flex={1} alignItems="center" justifyContent="center" padding="$1">
                    <Text
                      fontFamily="$body"
                      fontSize="$4"
                      fontWeight="bold"
                      color={isDark ? '#ccc' : '#555'}
                      textAlign="center"
                      marginBottom="$2"
                    >
                      {item.name.split('.').pop()?.toUpperCase()}
                    </Text>
                    <Text
                      fontFamily="$body"
                      fontSize="$2"
                      color={isDark ? '#999' : '#777'}
                      textAlign="center"
                      numberOfLines={2}
                      ellipsizeMode="middle"
                    >
                      {item.name}
                    </Text>
                    <Text
                      fontFamily="$body"
                      fontSize="$1"
                      color={isDark ? '#777' : '#999'}
                      marginTop="$2"
                    >
                      {formatSize(item.size)}
                    </Text>
                  </YStack>
                )}
              </YStack>
            )
          })}
        </ScrollView>
      )}

      <View style={{ position: 'absolute', bottom: 32, right: 24, zIndex: 1000 }}>
        <Button
          size="$4"
          circular
          bg={primaryColor}
          pressStyle={{ scale: 0.95 }}
          animation="quick"
          elevation={4}
          disabled={isUploading}
          onPress={pickAndUploadFiles}
        >
          <Plus color="white" size={24} />
        </Button>
      </View>

      {__DEV__ && (
        <View style={{ position: 'absolute', bottom: 32, left: 24, zIndex: 1000 }}>
          <Button
            size="$4"
            circular
            bg="$red9"
            pressStyle={{ scale: 0.95 }}
            animation="quick"
            elevation={4}
            onPress={testNotification}
          >
            <Bell color="white" size={24} />
          </Button>
        </View>
      )}

      {/* Video Modal */}
        {selectedVideo && (
          <View 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000,
            }}
          >
            <View 
              style={{
                width: isWeb ? '100%' : '90%', 
                height: isWeb ? '100%' : '70%', 
                maxWidth: 1200,               
                backgroundColor: '#000',
                paddingTop: 60,
                paddingBottom: 60,
                borderRadius: 8,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Video
                source={{ uri: selectedVideo }}
                style={{ 
                  flex: 1,
                  alignSelf: 'stretch'
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN} 
                shouldPlay
                isLooping={true}
                volume={1.0}
                onError={(e) => console.error('Failed to load video:', e)}
              />
            </View>
            
            <Button
              size="$4"
              circular
              position="absolute"
              top={80}
              right={20}
              bg="rgba(0,0,0,0.5)"
              pressStyle={{ scale: 0.95 }}
              animation="quick"
              onPress={() => setSelectedVideo(null)}
            >
            <Text color="white" fontSize={20}>✕</Text>
          </Button>
        </View>
      )}
    </YStack>
  )
}
