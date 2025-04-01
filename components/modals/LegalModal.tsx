import React, { useState } from 'react';
import { Sheet, Text, YStack, XStack, Theme } from 'tamagui';
import { Tabs } from '@tamagui/tabs';
import { KeyboardAvoidingView, Platform, useColorScheme, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useUserStore } from '@/store/UserStore';

interface LegalModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function LegalModal({ isVisible, onClose }: LegalModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'ios' ? insets.top : 0;
  const isWeb = Platform.OS === 'web';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const [activeTab, setActiveTab] = useState('privacy');

  return (
    <Theme name={isDark ? "dark" : "light"}>
      <Sheet
        modal
        open={isVisible}
        onOpenChange={(open: boolean) => !open && onClose()}
        snapPoints={[90]}
        position={0}
        dismissOnSnapToBottom={true}
        zIndex={100000}
        animation="quick"
      >
        <Sheet.Overlay
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor={isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)"}
        />
        <Sheet.Frame
          padding="$4"
          backgroundColor={isDark ? "rgba(17,17,17,0.98)" : "rgba(250,250,250,0.98)"}
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          borderWidth={1}
          borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}
          gap="$4"
          {...(isWeb ? 
            { 
              maxWidth: 600, 
              marginHorizontal: 'auto',
              minHeight: 500,
              maxHeight: 'calc(100vh - 80px)',
            } : {}
          )}
        >
          <Sheet.Handle backgroundColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)"} marginBottom="$2"/>
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}  
            style={{ flex: 1, paddingTop: Math.max(topInset - 100, 0) }}
          >
            <Animated.View entering={FadeIn.duration(400)} style={{ marginBottom: 12 }}>
              <Text 
                fontSize={22}  
                fontWeight="700"  
                color={isDark ? "#fff" : "#000"} 
                opacity={isDark ? 1 : 0.9} 
                fontFamily="$body"
                textAlign="center"
              > 
                Legal Information
              </Text>
            </Animated.View>
            
            <Tabs
              defaultValue="privacy"
              orientation="horizontal"
              flexDirection="column"
              flex={1}
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <Tabs.List 
                py="$2" 
                backgroundColor={isDark ? "rgba(30,30,30,0.5)" : "rgba(240,240,240,0.8)"}
                br={8}
                marginBottom="$4"
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
                      entering={SlideInRight.duration(300).springify()} 
                      style={{ flex: 1 }}
                    >
                      <ScrollView 
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                      >
                        <YStack gap="$4" px="$2">
                          <Text 
                            fontSize="$5" 
                            fontWeight="700" 
                            color={isDark ? "#fff" : "#000"}
                            fontFamily="$body"
                          >
                            Privacy Policy
                          </Text>
                          
                          <Text 
                            fontSize="$3" 
                            color={isDark ? "#ddd" : "#333"}
                            fontFamily="$body"
                            lineHeight={22}
                          >
                            This app requires access to certain device features to provide its functionality. Here's how we use your data:
                          </Text>
                          
                          <YStack gap="$3">
                            <XStack gap="$2" alignItems="flex-start">
                              <Text fontSize="$4" color={primaryColor} fontWeight="bold">•</Text>
                              <YStack>
                                <Text 
                                  fontSize="$3" 
                                  fontWeight="700" 
                                  color={isDark ? "#fff" : "#000"}
                                  fontFamily="$body"
                                >
                                  Contacts
                                </Text>
                                <Text 
                                  fontSize="$3" 
                                  color={isDark ? "#ddd" : "#333"}
                                  fontFamily="$body"
                                  lineHeight={20}
                                >
                                  We request access to your contacts to help you manage your relationships and set birthday reminders. Contact data is stored locally on your device and is not transmitted to our servers.
                                </Text>
                              </YStack>
                            </XStack>
                            
                            <XStack gap="$2" alignItems="flex-start">
                              <Text fontSize="$4" color={primaryColor} fontWeight="bold">•</Text>
                              <YStack>
                                <Text 
                                  fontSize="$3" 
                                  fontWeight="700" 
                                  color={isDark ? "#fff" : "#000"}
                                  fontFamily="$body"
                                >
                                  Calendar
                                </Text>
                                <Text 
                                  fontSize="$3" 
                                  color={isDark ? "#ddd" : "#333"}
                                  fontFamily="$body"
                                  lineHeight={20}
                                >
                                  Calendar access allows Kaiba to help you manage events native events. All calendar data remains on your device and is not shared with third parties.
                                </Text>
                              </YStack>
                            </XStack>
                            
                            <XStack gap="$2" alignItems="flex-start">
                              <Text fontSize="$4" color={primaryColor} fontWeight="bold">•</Text>
                              <YStack>
                                <Text 
                                  fontSize="$3" 
                                  fontWeight="700" 
                                  color={isDark ? "#fff" : "#000"}
                                  fontFamily="$body"
                                >
                                  Photo Library
                                </Text>
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
                                  fontWeight="700" 
                                  color={isDark ? "#fff" : "#000"}
                                  fontFamily="$body"
                                >
                                  Notifications
                                </Text>
                                <Text 
                                  fontSize="$3" 
                                  color={isDark ? "#ddd" : "#333"}
                                  fontFamily="$body"
                                  lineHeight={20}
                                >
                                  We use notifications to remind you of upcoming events, birthdays, and tasks. Notification preferences can be managed in the app settings.
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
                            We are committed to protecting your privacy. All data is stored locally on your device, as we have no need for your data. We do not sell or share your personal information with third parties.
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
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                      >
                        <YStack gap="$4" px="$2">
                          <Text 
                            fontSize="$5" 
                            fontWeight="700" 
                            color={isDark ? "#fff" : "#000"}
                            fontFamily="$body"
                          >
                            Contact Information
                          </Text>
                          
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
                              <Text fontSize="$4" color={primaryColor} fontWeight="bold">•</Text>
                              <YStack>
                                <Text 
                                  fontSize="$3" 
                                  fontWeight="700" 
                                  color={isDark ? "#fff" : "#000"}
                                  fontFamily="$body"
                                >
                                  Email
                                </Text>
                                <Text 
                                  fontSize="$3" 
                                  color={isDark ? "#ddd" : "#333"}
                                  fontFamily="$body"
                                  lineHeight={20}
                                >
                                  kaibanexusdev@gmail.com
                                </Text>
                              </YStack>
                            </XStack>
                            
                            <XStack gap="$2" alignItems="flex-start">
                              <Text fontSize="$4" color={primaryColor} fontWeight="bold">•</Text>
                              <YStack>
                                <Text 
                                  fontSize="$3" 
                                  fontWeight="700" 
                                  color={isDark ? "#fff" : "#000"}
                                  fontFamily="$body"
                                >
                                  Website
                                </Text>
                                <Text 
                                  fontSize="$3" 
                                  color={isDark ? "#ddd" : "#333"}
                                  fontFamily="$body"
                                  lineHeight={20}
                                >
                                  www.deedaw.cc/privacy.html
                                </Text>
                              </YStack>
                            </XStack>
                            
                            <XStack gap="$2" alignItems="flex-start">
                              <Text fontSize="$4" color={primaryColor} fontWeight="bold">•</Text>
                              <YStack>
                                <Text 
                                  fontSize="$3" 
                                  fontWeight="700" 
                                  color={isDark ? "#fff" : "#000"}
                                  fontFamily="$body"
                                >
                                  Response Time
                                </Text>
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
          </KeyboardAvoidingView>
        </Sheet.Frame>
      </Sheet>
    </Theme>
  );
}
