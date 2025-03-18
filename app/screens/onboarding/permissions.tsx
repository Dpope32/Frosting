import React from 'react';
import { YStack, Text, isWeb } from 'tamagui';
import { ScrollView } from 'react-native';

export default function PermissionsScreen({ isDark = true}: { isDark?: boolean}) {
  const sectionBackgroundColor = isDark ? "$gray3Dark" : "$gray3Light";
  const sectionBorderColor = isDark ? "$gray6Dark" : "$gray6Light";
  const headingColor = isDark ? "$gray12Dark" : "$gray12Light";
  const textColor = isDark ? "$gray11Dark" : "$gray11Light";
  const accentColor = isDark ? "$blue10" : "$blue9";

  return (
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 80, paddingBottom: 40 }}
    >
      <YStack 
        gap="$2" 
        flex={1} 
        padding={isWeb ? "$6" : "$4"} 
        marginBottom={isWeb ? "$6" : "$4"} 
        justifyContent="flex-start" 
        alignItems="center"
      >
        <Text 
          fontFamily="$heading" 
          fontWeight="600" 
          fontSize={isWeb ? "$9" : "$8"} 
          textAlign="center" 
          color={headingColor}
          marginBottom="$2"
        >
          Lets talk permissions..
        </Text>
        
        <Text 
          fontFamily="$body" 
          fontSize={isWeb ? "$5" : "$4"} 
          textAlign="center" 
          color={textColor}
        >
          I know.. they're annoying..
        </Text>

        <Text 
          fontFamily="$body" 
          fontSize={isWeb ? "$4" : "$3"} 
          textAlign="center" 
          color={"#5f5f5f"}
          marginVertical="$1"
          paddingHorizontal="$0"
        >
          But they are necessary.
        </Text>
        <YStack 
          width="100%" 
          backgroundColor={"#transparent"} 
          gap="$4"
          padding="$4" 
        >
        {/* Contacts Permission */}
        <YStack 
          width="100%" 
          backgroundColor={sectionBackgroundColor} 
          borderRadius="$4" 
          padding="$4" 
          borderWidth={1} 
          borderColor={sectionBorderColor}
          marginTop="$1"
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
            This allows you to import existing contacts. 
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
          marginBottom="$0"
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
            This helps you manage events and appointments.
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
          marginBottom="$0"
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
            This allows you to select a profile picture.
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
          marginBottom="$0"
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
            This reminds you of upcoming events, birthdays, and tasks. Notifications are generated locally on your device. We would never spam you.
          </Text>
        </YStack>
        </YStack>
        
        
        <Text 
          fontFamily="$body" 
          fontSize={isWeb ? "$4" : "$3"} 
          textAlign="center" 
          color={textColor}
          marginTop="$4"
          opacity={0.8}
        >
          Tap "Continue" below to proceed to the next step. 
        </Text>
      </YStack>
    </ScrollView>
  );
}
