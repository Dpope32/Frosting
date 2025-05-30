import React from 'react';
import { YStack, XStack, H2, Text, isWeb, View } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Linking } from 'react-native';
import { isMobileBrowser } from '@/utils/deviceUtils';
import { useToastStore } from '@/store';

export const SyncSection = () => {
  const handleSignUp = React.useCallback(async () => {
    try {
      await Linking.openURL('https://kaiba.lemonsqueezy.com/');
    } catch (error) {
      useToastStore.getState().showToast('Failed to open signup page', 'error');
    }
  }, []);

  return (
    <YStack 
      width="100%" 
      maxWidth={1600} 
      paddingHorizontal="$6" 
      paddingVertical="$5" 
      gap="$6"
      borderRadius={40}
      style={{
        background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.92) 0%, rgba(20, 20, 45, 0.92) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap">
        <YStack maxWidth={1100} paddingBottom="$4" gap="$4" flex={1} minWidth={800}>
          <H2
            fontFamily="$body"
            fontSize={"$9"}
            fontWeight="800"
            color="white"
            style={{
              marginBottom: 0,
              textShadow: isWeb ? '0 2px 4px rgba(0,0,0,0.5)' : undefined,
            }}
          >
            Want to sync your data across all your devices?
          </H2>
          
          <YStack gap="$6" mt="$1">
            <YStack>
              <XStack alignItems="center" gap="$3" mb="$2">
                <View
                  width={36}
                  height={36}
                  backgroundColor="rgba(192, 128, 255, 0.2)"
                  br={18}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Ionicons name="shield-checkmark" size={20} color="#C080FF" />
                </View>
                <Text fontSize="$5" fontWeight="700" fontFamily="$body" color="white">End-to-End Encryption</Text>
              </XStack>
              <Text fontSize="$4" fontFamily="$body" color="white"  ml="$6" style={{ textShadow: isWeb ? '0 1px 2px rgba(0,0,0,0.5)' : undefined }}>
                Your data is always protected with military-grade encryption, ensuring only your authorized devices can access your information.
              </Text>
            </YStack>
            
            <YStack>
              <XStack alignItems="center" gap="$3" mb="$2">
                <View
                  width={36}
                  height={36}
                  backgroundColor="rgba(74, 222, 205, 0.2)"
                  br={18}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Ionicons name="flash" size={20} color="#4ADECD" />
                </View>
                <Text fontSize="$5" fontWeight="700" fontFamily="$body" color="white">Real-Time Updates</Text>
              </XStack>
              <Text fontSize="$4" fontFamily="$body" color="white" ml="$6" style={{ textShadow: isWeb ? '0 1px 2px rgba(0,0,0,0.5)' : undefined }}>
                Changes made on one device instantly sync to all others, ensuring your data is always current no matter where you access it from.
              </Text>
            </YStack>
            
            <YStack>
              <XStack alignItems="center" gap="$3" mb="$2">
                <View
                  width={36}
                  height={36}
                  backgroundColor="rgba(255, 157, 92, 0.2)"
                  br={18}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Ionicons name="people" size={20} color="#FF9D5C" />
                </View>
                <Text fontSize="$5" fontWeight="700" fontFamily="$body" color="white">Workspace Sharing</Text>
              </XStack>
              <Text fontSize="$4" fontFamily="$body" color="white" ml="$6" style={{ textShadow: isWeb ? '0 1px 2px rgba(0,0,0,0.5)' : undefined }}>
                Create secure workspaces and share selected data with trusted devices through simple invite codes.
              </Text>
            </YStack>
          </YStack>
        </YStack>
        
        <YStack 
          flex={1} 
          maxWidth={440} 
          minWidth={300} 
          backgroundColor="rgba(0,0,0,0.2)" 
          borderRadius={24} 
          overflow="hidden"
          borderColor="rgba(255,255,255,0.1)"
          borderWidth={1}
          style={{ 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transform: isMobileBrowser ? 'scale(0.9)' : 'scale(1)'
          }}
        >
          <XStack 
            height={48} 
            backgroundColor="rgba(30,30,40,0.9)" 
            alignItems="center" 
            paddingHorizontal="$4"
          >
            <View width={12} height={12} backgroundColor="#FF5F57" borderRadius={6} marginRight={8} />
            <View width={12} height={12} backgroundColor="#FEBC2E" borderRadius={6} marginRight={8} />
            <View width={12} height={12} backgroundColor="#28C840" borderRadius={6} />
            <Text fontFamily="$body" color="rgba(255,255,255,0.6)" fontSize="$3" marginLeft="auto">Secure Workspace</Text>
          </XStack>
          <YStack padding="$4" gap="$4">
            <XStack justifyContent="space-between">
              <Text color="#4ADECD" fontSize="$4" fontFamily="$body" fontWeight="bold">Device Sync Status</Text>
              <Text color="#C080FF" fontSize="$4" fontFamily="$body" fontWeight="bold">ACTIVE</Text>
            </XStack>
            <XStack paddingVertical="$2" borderBottomColor="rgba(255,255,255,0.1)" borderBottomWidth={1}>
              <Text color="rgba(255,255,255,0.7)" fontSize="$4" fontFamily="$body" flex={1}>iPhone 15 Pro</Text>
              <Text color="#4ADECD" fontSize="$4" fontFamily="$body" fontWeight="bold">CONNECTED</Text>
            </XStack>
            <XStack paddingVertical="$2" borderBottomColor="rgba(255,255,255,0.1)" borderBottomWidth={1}>
              <Text color="rgba(255,255,255,0.7)" fontSize="$4" fontFamily="$body" flex={1}>MacBook Pro</Text>
              <Text color="#4ADECD" fontSize="$4" fontFamily="$body" fontWeight="bold">CONNECTED</Text>
            </XStack>
            <XStack paddingVertical="$2" borderBottomColor="rgba(255,255,255,0.1)" borderBottomWidth={1}>
              <Text color="rgba(255,255,255,0.7)" fontSize="$4" fontFamily="$body" flex={1}>iPad Pro</Text>
              <Text color="#4ADECD" fontSize="$4" fontFamily="$body" fontWeight="bold">CONNECTED</Text>
            </XStack>
            <YStack backgroundColor="rgba(0,0,0,0.3)" padding="$3" borderRadius={12} marginTop="$2">
              <Text color="rgba(255,255,255,0.5)" fontSize="$3" fontFamily="$body">LAST SYNC: <Text color="#4ADECD">2 MINUTES AGO</Text></Text>
              <Text color="rgba(255,255,255,0.5)" fontSize="$3" fontFamily="$body" marginTop="$2">ALL DATA IS END-TO-END ENCRYPTED</Text>
            </YStack>
          </YStack>
        </YStack>
      </XStack>
      
      <XStack justifyContent="flex-start" marginTop="$4">
        <TouchableOpacity onPress={handleSignUp}>
          <YStack 
            backgroundColor="rgba(192, 128, 255, 0.07)"
            paddingHorizontal="$6"
            paddingVertical="$3"
            borderRadius={20}
            alignItems="center"
            justifyContent="center"
            style={{
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(192, 128, 255, 0.4)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <XStack alignItems="center" gap="$3">
              <Text color="#C080FF" fontSize="$3">⭐</Text>
              <Text 
                color="#C080FF" 
                fontSize="$4" 
                fontWeight="600"
                fontFamily="$body"
              >
                Available with Premium Subscription 
              </Text>
              <Text color="#C080FF" fontSize="$3">→</Text>
            </XStack>
          </YStack>
        </TouchableOpacity>
      </XStack>
    </YStack>
  )
}