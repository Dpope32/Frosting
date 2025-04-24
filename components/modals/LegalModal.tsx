import React, { useState } from 'react';
import { Sheet, Text, YStack, XStack, Theme, Button, isWeb } from 'tamagui';
import appJson from '../../app.json';
import { Tabs } from '@tamagui/tabs';
import { KeyboardAvoidingView, Platform, useColorScheme, ScrollView, Pressable, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import { useUserStore } from '@/store/UserStore';
import { MaterialIcons } from '@expo/vector-icons';
import { BaseCardModal } from '../cardModals/BaseCardModal';

interface LegalModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function LegalModal({ isVisible, onClose }: LegalModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : 0;
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const [activeTab, setActiveTab] = useState('privacy');
  const [scrollY, setScrollY] = React.useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open && scrollY > 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    onClose();
  };

  const handleEmailPress = async () => {
    const email = 'kaibanexusdev@gmail.com';
    const subject = 'Kaiba Nexus App Feedback/Question';
    const body = 'Hello Kaiba Nexus Team,\n\n';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      // For iOS, we'll use a more robust approach since we need LSApplicationQueriesSchemes
      if (Platform.OS === 'ios') {
        // First try to copy to clipboard as a fallback
        await Clipboard.setStringAsync(email);
        
        // Then try to open the URL
        Linking.openURL(mailtoUrl).catch(() => {
          alert('Email copied to clipboard! Please paste it in your email client.');
        });
      } else {
        const supported = await Linking.canOpenURL(mailtoUrl);
        if (supported) {
          await Linking.openURL(mailtoUrl);
        } else {
          await Clipboard.setStringAsync(email);
          alert('Email copied to clipboard! Please paste it in your email client.');
        }
      }
    } catch (err) {
      console.error('Failed to open email client:', err);
      // Fallback for simulator/web - copy email to clipboard
      await Clipboard.setStringAsync(email);
      alert('Email copied to clipboard! Please paste it in your email client.');
    }
  };

  const handleWebsitePress = async () => {
    // Updated to the correct URL
    const websiteUrl = 'https://deedaw.cc/pages/privacy.html';
    
    try {
      const supported = await Linking.canOpenURL(websiteUrl);
      if (supported) {
        await Linking.openURL(websiteUrl);
      } else {
        // Fallback for simulator/web - copy URL to clipboard
        await Clipboard.setStringAsync(websiteUrl);
        alert('Website URL copied to clipboard! Please paste it in your browser.');
      }
    } catch (err) {
      console.error('Failed to open website:', err);
      // Fallback for simulator/web - copy URL to clipboard
      await Clipboard.setStringAsync(websiteUrl);
      alert('Website URL copied to clipboard! Please paste it in your browser.');
    }
  };

  return (
    <Theme name={isDark ? "dark" : "light"}>
      <BaseCardModal
        open={isVisible}
        title={activeTab === 'privacy' ? 'Privacy Policy' : 'Contact'}
        onOpenChange={handleOpenChange}
        snapPoints={isWeb ? [85] : [95]}
        position={0}
        dismissOnSnapToBottom={true}
        zIndex={100000}
        showCloseButton={true}
      >
        <Sheet.Overlay
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor={isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)"}
        />
            <Tabs
              defaultValue="privacy"
              orientation="horizontal"
              flexDirection="column"
              flex={1}
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <Tabs.List 
                backgroundColor={isDark ? "rgba(30,30,30,0.5)" : "rgba(240,240,240,0.8)"}
              >
                <Tabs.Tab
                  value="privacy"
                  flex={1}
                  backgroundColor="transparent"
                  pressStyle={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }}
                >
                  <YStack alignItems="center">
                    <Text
                      fontSize="$4"
                      fontFamily="$body"
                      color={activeTab === 'privacy' ? primaryColor : isDark ? 'white' : 'black'}
                      fontWeight={activeTab === 'privacy' ? "700" : "400"}
                    >
                      Privacy Policy
                    </Text>
                    <YStack
                      backgroundColor={primaryColor}
                      height={3}
                      width={40}
                      mt="$1"
                      display={activeTab === 'privacy' ? 'flex' : 'none'}
                      br={1.5}
                    />
                  </YStack>
                </Tabs.Tab>
                
                <Tabs.Tab
                  value="contact"
                  flex={1}
                  backgroundColor="transparent"
                  pressStyle={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }}
                >
                  <YStack alignItems="center">
                    <Text
                      fontSize="$4"
                      fontFamily="$body"
                      color={activeTab === 'contact' ? primaryColor : isDark ? 'white' : 'black'}
                      fontWeight={activeTab === 'contact' ? "700" : "400"}
                    >
                      Contact
                    </Text>
                    <YStack
                      backgroundColor={primaryColor}
                      height={3}
                      width={40}
                      mt="$1"
                      display={activeTab === 'contact' ? 'flex' : 'none'}
                      br={1.5}
                    />
                  </YStack>
                </Tabs.Tab>
              </Tabs.List>

              <YStack flex={1}>
                <Tabs.Content value="privacy" flex={1}>
                  {activeTab === 'privacy' && (
                    <Animated.View 
                      entering={SlideInLeft.duration(300).springify()} 
                      style={{ flex: 1 }}
                    >
                      <ScrollView
                        ref={scrollViewRef}
                        showsVerticalScrollIndicator={true}
                        bounces={false}
                        contentContainerStyle={{ paddingBottom: 40 + bottomInset }}
                        onScroll={({ nativeEvent }) => setScrollY(nativeEvent.contentOffset.y)}
                        scrollEventThrottle={16}
                        style={{ marginTop: 10 }}
                      >
                        <YStack gap="$2" px="$2"> 
                          
                          <Text 
                            fontSize="$3" 
                            color={isDark ? "#ddd" : "#333"}
                            fontFamily="$body"
                            lineHeight={22}
                          >
                            This app requires access to certain device features to provide its functionality. Your data remains private:
                          </Text>
                          
                          <YStack gap="$3">
                            <XStack gap="$2" alignItems="flex-start">
                              <Text fontSize="$4" color={primaryColor} fontWeight="bold">•</Text>
                              <YStack>
                                <Text 
                                  fontSize="$3" 
                                  color={isDark ? "#ddd" : "#333"}
                                  fontFamily="$body"
                                  lineHeight={20}
                                >
                                  We request access to your contacts to help you manage your relationships and set birthday reminders. 
                                </Text>
                              </YStack>
                            </XStack>
                            
                            <XStack gap="$2" alignItems="flex-start">
                              <Text fontSize="$4" color={primaryColor} fontWeight="bold">•</Text>
                              <YStack>
                                <Text 
                                  fontSize="$3" 
                                  color={isDark ? "#ddd" : "#333"}
                                  fontFamily="$body"
                                  lineHeight={20}
                                >
                                  Calendar access allows Kaiba to help you manage events native events. 
                                </Text>
                              </YStack>
                            </XStack>
                            
                            <XStack gap="$2" alignItems="flex-start">
                              <Text fontSize="$4" color={primaryColor} fontWeight="bold">•</Text>
                              <YStack>
                                <Text 
                                  fontSize="$3" 
                                  color={isDark ? "#ddd" : "#333"}
                                  fontFamily="$body"
                                  lineHeight={20}
                                >
                                  We request access to your photo library to allow you to select profile pictures and upload images. All images are stored locally or in your personal cloud storage account.
                                </Text>
                              </YStack>
                            </XStack>
                            
                            <XStack gap="$2" alignItems="flex-start">
                              <Text fontSize="$4" color={primaryColor} fontWeight="bold">•</Text>
                              <YStack>
                                <Text 
                                  fontSize="$3" 
                                  color={isDark ? "#ddd" : "#333"}
                                  fontFamily="$body"
                                  lineHeight={20}
                                >
                                  We use notifications to remind you of upcoming events, birthdays, and tasks. 
                                </Text>
                              </YStack>
                            </XStack>
                          </YStack>
                          
                          <Text 
                            fontSize="$3" 
                            color={isDark ? "#ddd" : "#333"}
                            fontFamily="$body"
                            lineHeight={22}
                            mt="$2"
                          >
                            We are committed to protecting your privacy. This is a local-first application - all your data is stored exclusively on your device and never leaves it. There is no server component, no cloud storage, and no third-party data sharing. You maintain complete control over your information at all times.
                          </Text>
                          
                          <Text 
                            fontSize="$3" 
                            color={isDark ? "#ddd" : "#333"}
                            fontFamily="$body"
                            lineHeight={22}
                          >
                            This privacy policy may be updated from time to time. Please check back for any changes.
                          </Text>
                          
                          <Text 
                            fontSize="$3" 
                            color={isDark ? "#999" : "#666"}
                            fontFamily="$body"
                            lineHeight={22}
                            mt="$2"
                          >
                            Last updated: March 2025
                          </Text>
                          <Text 
                            fontSize={isWeb ? 12 : "$3"} 
                            color={isDark ? "#666" : "#999"}
                            fontFamily="$body"
                            lineHeight={20}
                            mt="$2"
                            textAlign="left"
                          >
                            App Version: {appJson.expo.version}
                          </Text>
                        </YStack>
                      </ScrollView>
                    </Animated.View>
                  )}
                </Tabs.Content>
                
                <Tabs.Content value="contact" flex={1}>
                  {activeTab === 'contact' && (
                    <Animated.View 
                      entering={SlideInRight.duration(300).springify()} 
                      style={{ flex: 1 }}
                    >
                      <ScrollView
                        ref={scrollViewRef}
                        showsVerticalScrollIndicator={true}
                        bounces={false}
                        contentContainerStyle={{ paddingBottom: 80 + bottomInset }}
                        onScroll={({ nativeEvent }) => setScrollY(nativeEvent.contentOffset.y)}
                        scrollEventThrottle={16}
                      >
                        <YStack gap="$3" py="$2" px="$3">
                          
                          <Text 
                            fontSize="$3" 
                            color={isDark ? "#ddd" : "#333"}
                            fontFamily="$body"
                            lineHeight={22}
                          >
                              If you have any questions, concerns, or feedback about our app, please don't hesitate to reach out to us:
                          </Text>
                          
                          <YStack gap="$3" mt="$2">
                            <XStack gap="$2" alignItems="flex-start">
                              <MaterialIcons name="email" size={18} color={primaryColor} />
                              <YStack>
                                <Pressable onPress={handleEmailPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                                  <Text 
                                    fontSize="$3" 
                                    color={isDark ? "#fff" : "#000"}
                                    fontFamily="$body"
                                    textDecorationLine="underline"
                                  >
                                    Contact us via Email
                                  </Text>
                                </Pressable>
                              </YStack>
                            </XStack>
                            
                            <XStack gap="$2" alignItems="flex-start">
                              <MaterialIcons name="public" size={18} color={primaryColor} />
                              <YStack>
                                <Pressable onPress={handleWebsitePress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                                  <Text 
                                    fontSize="$3" 
                                    color={isDark ? "#fff" : "#000"}
                                    fontFamily="$body"
                                    textDecorationLine="underline"
                                  >
                                    Visit our Privacy Policy
                                  </Text>
                                </Pressable>
                              </YStack>
                            </XStack>
                            
                            <XStack gap="$2" alignItems="flex-start">
                              <MaterialIcons name="schedule" size={18} color={primaryColor} />
                              <YStack>
                                <Text 
                                  fontSize="$3" 
                                  color={isDark ? "#ddd" : "#333"}
                                  fontFamily="$body"
                                  lineHeight={20}
                                >
                                  We strive to respond to all inquiries within 48 hours during business days.
                                </Text>
                              </YStack>
                            </XStack>
                          </YStack>
                          
                          <Text 
                            fontSize="$3" 
                            color={isDark ? "#ddd" : "#333"}
                            fontFamily="$body"
                            lineHeight={22}
                            mt="$2"
                          >
                            Your feedback is important to us and helps us improve our app. We appreciate your support and are committed to providing you with the best possible experience.
                          </Text>
                        </YStack>
                      </ScrollView>
                    </Animated.View>
                  )}
                </Tabs.Content>
              </YStack>
            </Tabs>
      </BaseCardModal>
    </Theme>
  );
}
