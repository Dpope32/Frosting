import React from 'react';
import { YStack, Text, isWeb } from 'tamagui';
import { ScrollView, Platform } from 'react-native';

export default function PermissionsScreen({
  isDark = true, // Default to dark if not provided
}: {
  isDark?: boolean;
}) {
  // Dynamic theme styles
  const labelColor = isDark ? "$gray12Dark" : "$gray12Light";
  const sectionBackgroundColor = isDark ? "$gray3Dark" : "$gray3Light";
  const sectionBorderColor = isDark ? "$gray6Dark" : "$gray6Light";
  const headingColor = isDark ? "$gray12Dark" : "$gray12Light";
  const textColor = isDark ? "$gray11Dark" : "$gray11Light";
  const accentColor = isDark ? "$blue10" : "$blue9";

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack 
        gap="$4" 
        flex={1} 
        padding={isWeb ? "$6" : "$4"} 
        marginBottom={isWeb ? "$6" : "$4"} 
        justifyContent="flex-start" 
        alignItems="center"
      >
        <Text 
          fontFamily="$heading" 
          fontWeight="600" 
          fontSize={isWeb ? "$9" : "$7"} 
          textAlign="center" 
          color={headingColor}
          marginBottom="$2"
        >
          App Permissions
        </Text>
        
        <Text 
          fontFamily="$body" 
          fontSize={isWeb ? "$5" : "$4"} 
          textAlign="center" 
          color={textColor}
          marginBottom="$4"
        >
          To provide you with the best experience, Kaiba-Nexus needs the following permissions:
        </Text>
        
        {/* Contacts Permission */}
        <YStack 
          width="100%" 
          backgroundColor={sectionBackgroundColor} 
          borderRadius="$4" 
          padding="$4" 
          borderWidth={1} 
          borderColor={sectionBorderColor}
          marginBottom="$3"
        >
          <Text 
            fontFamily="$heading" 
            fontWeight="500" 
            fontSize={isWeb ? "$6" : "$5"} 
            color={accentColor}
            marginBottom="$2"
          >
            Contacts
          </Text>
          <Text 
            fontFamily="$body" 
            fontSize={isWeb ? "$4" : "$3"} 
            color={textColor}
          >
            This helps you manage your relationships and set birthday reminders. Your contacts remain on your device and are never shared.
          </Text>
        </YStack>
        
        {/* Calendar Permission */}
        <YStack 
          width="100%" 
          backgroundColor={sectionBackgroundColor} 
          borderRadius="$4" 
          padding="$4" 
          borderWidth={1} 
          borderColor={sectionBorderColor}
          marginBottom="$3"
        >
          <Text 
            fontFamily="$heading" 
            fontWeight="500" 
            fontSize={isWeb ? "$6" : "$5"} 
            color={accentColor}
            marginBottom="$2"
          >
            Calendar
          </Text>
          <Text 
            fontFamily="$body" 
            fontSize={isWeb ? "$4" : "$3"} 
            color={textColor}
          >
            This helps you manage events and appointments. Calendar data stays on your device and is used only to display and organize your schedule.
          </Text>
        </YStack>
        
        {/* Photo Library Permission */}
        <YStack 
          width="100%" 
          backgroundColor={sectionBackgroundColor} 
          borderRadius="$4" 
          padding="$4" 
          borderWidth={1} 
          borderColor={sectionBorderColor}
          marginBottom="$3"
        >
          <Text 
            fontFamily="$heading" 
            fontWeight="500" 
            fontSize={isWeb ? "$6" : "$5"} 
            color={accentColor}
            marginBottom="$2"
          >
            Photo Library
          </Text>
          <Text 
            fontFamily="$body" 
            fontSize={isWeb ? "$4" : "$3"} 
            color={textColor}
          >
            This allows you to select profile pictures and upload images. We only access the specific photos you choose to use in the app.
          </Text>
        </YStack>
        
        {/* Notifications Permission */}
        <YStack 
          width="100%" 
          backgroundColor={sectionBackgroundColor} 
          borderRadius="$4" 
          padding="$4" 
          borderWidth={1} 
          borderColor={sectionBorderColor}
          marginBottom="$3"
        >
          <Text 
            fontFamily="$heading" 
            fontWeight="500" 
            fontSize={isWeb ? "$6" : "$5"} 
            color={accentColor}
            marginBottom="$2"
          >
            Notifications
          </Text>
          <Text 
            fontFamily="$body" 
            fontSize={isWeb ? "$4" : "$3"} 
            color={textColor}
          >
            This reminds you of upcoming events, birthdays, and tasks. Notifications are generated locally on your device.
          </Text>
        </YStack>
        
        {/* Privacy Statement */}
        <YStack 
          width="100%" 
          backgroundColor={sectionBackgroundColor} 
          borderRadius="$4" 
          padding="$4" 
          borderWidth={1} 
          borderColor={sectionBorderColor}
          marginTop="$2"
        >
          <Text 
            fontFamily="$heading" 
            fontWeight="500" 
            fontSize={isWeb ? "$6" : "$5"} 
            color={headingColor}
            marginBottom="$2"
          >
            Our Privacy Commitment
          </Text>
          <Text 
            fontFamily="$body" 
            fontSize={isWeb ? "$4" : "$3"} 
            color={textColor}
          >
            Kaiba-Nexus is designed with privacy in mind. All your data is stored locally on your device. We do not collect, share, or sell your personal information to any third parties. You can manage these permissions in your device settings at any time.
          </Text>
        </YStack>
        
        <Text 
          fontFamily="$body" 
          fontSize={isWeb ? "$4" : "$3"} 
          textAlign="center" 
          color={textColor}
          marginTop="$4"
          opacity={0.8}
        >
          Tap "Continue" below to proceed to the next step. Permission requests will appear after you begin the onboarding process.
        </Text>
      </YStack>
    </ScrollView>
  );
}
