import { useRef, useState } from 'react';
import { Image, TextInput } from 'react-native';
import { useUserStore } from '@/store/UserStore';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { 
  YStack, 
  XStack,
  Button, 
  Input, 
  Text,
  View,
  Circle,
  AnimatePresence,
  Label,
} from 'tamagui';

import { colorOptions } from '../constants/ColorOptions'
import { backgroundStyles } from '../constants/BackgroundStyles'

export default function Onboarding() {
  const [step, setStep] = useState(0);
  type FormData = {
    username: string;
    profilePicture: string;
    primaryColor: string;
    backgroundStyle: 'gradient' | 'opaque' | 'wallpaper-0' | 'wallpaper-1' | 'wallpaper-2' | 'wallpaper-3' | 'wallpaper-4' | 'wallpaper-5';
    zipCode: string;
  };

  const [formData, setFormData] = useState<FormData>({
    username: '',
    profilePicture: '',
    primaryColor: '$blue10',
    backgroundStyle: 'gradient',
    zipCode: '',
  });
  
  const setPreferences = useUserStore((state) => state.setPreferences);
  const inputRef = useRef<TextInput>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        profilePicture: result.assets[0].uri
      }));
    }
  };

  const handleComplete = () => {
    setPreferences({
      ...formData,
      hasCompletedOnboarding: true,
    });
    router.replace('/(drawer)');
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.username.length >= 2;
      case 4:
        return formData.zipCode.length === 5;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <YStack space="$4" flex={1} justifyContent="center" padding="$4">
            <Label size="$8" textAlign="center" color="$gray12Dark">
              What should we call you?
            </Label>
            <Input
              ref={inputRef}
              size="$4"
              placeholder="Enter username" 
              value={formData.username}
              onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
              autoFocus
              backgroundColor="$gray4Dark"
              borderColor="$gray8Dark"
              color="$gray12Dark"
            />
          </YStack>
        );
      
      case 1:
        return (
          <YStack gap="$4" flex={1} justifyContent="center" padding="$4" alignItems="center">
            <Circle 
              size={180} 
              borderWidth={1}
              borderColor="$gray8Dark"
              borderStyle="dashed"
              backgroundColor="$gray4Dark"
              onPress={pickImage}
            >
              {formData.profilePicture ? (
                <Image source={{ uri: formData.profilePicture }} style={{ width: 180, height: 180, borderRadius: 90 }} />
              ) : (
                <Text color="$gray12Dark">Add a PFP</Text>
              )}
            </Circle>
            <Button 
              chromeless 
              onPress={() => setStep(prev => prev + 1)}
              color="$blue10Dark"
            >
              Skip for now
            </Button>
          </YStack>
        );

      case 2:
          return (
            <YStack gap="$4" flex={1} justifyContent="center" padding="$4">
              <Label size="$8" textAlign="center" color="$gray12Dark">
                Pick your primary color
              </Label>
              <XStack gap="$4" paddingVertical="$4" flexWrap="wrap" justifyContent="center">
                  {colorOptions.map((color) => (
                    <Circle
                      key={color.label}
                      size={60}
                      backgroundColor={color.value}
                      borderWidth={formData.primaryColor === color.value ? 2 : 0}
                      borderColor="white"
                      onPress={() => setFormData(prev => ({ ...prev, primaryColor: color.value }))}
                    >
                      {formData.primaryColor === color.value && (
                        <Text color="white">✓</Text>
                      )}
                    </Circle>
                  ))}
              </XStack>
            </YStack>
          );

      case 3:
        return (
          <YStack gap="$4" flex={1} justifyContent="center" padding="$4">
            <Label size="$8" textAlign="center" color="$gray12Dark">
              Choose your background
            </Label>
            <XStack gap="$3" justifyContent="center" flexWrap="wrap">
              {backgroundStyles.map((style) => (
                <Button
                  key={style.value}
                  backgroundColor={formData.backgroundStyle === style.value ? "$blue9Dark" : "$gray4Dark"}
                  borderColor="$gray8Dark"
                  onPress={() => setFormData(prev => ({ ...prev, backgroundStyle: style.value }))}
                >
                  <Text color="$gray12Dark">{style.label}</Text>
                </Button>
              ))}
            </XStack>
          </YStack>
        );

        case 4:
          return (
            <YStack gap="$6" flex={1} justifyContent="center" padding="$8">
              <YStack gap="$2">
                <Label 
                  size="$9" 
                  textAlign="center" 
                  color="$gray12Dark"
                  letterSpacing={-1}
                  fontWeight="700"
                >
                  What's your zip code?
                </Label>
                <Text 
                  fontSize="$4" 
                  textAlign="center" 
                  color="$gray9Dark"
                  opacity={0.8}
                  marginTop={-20}
                  fontWeight="400"
                  fontStyle='italic'
                >
                  For local weather information
                </Text>
              </YStack>
              
              <Input
                size="$5"
                placeholder="Enter zip code"
                value={formData.zipCode}
                onChangeText={(text) => setFormData(prev => ({ ...prev, zipCode: text }))}
                keyboardType="numeric"
                maxLength={5}
                autoFocus
                backgroundColor="$gray2Dark"
                borderColor="$gray8Dark"
                color="$gray12Dark"
                placeholderTextColor="$gray8Dark"
                textAlign="center"
                letterSpacing={1}
                borderWidth={1.25}
                fontSize={24}
                shadowColor="$gray8Dark"
                shadowRadius={20}
                shadowOpacity={0.2}
                focusStyle={{
                  borderColor: '$gray8dark',
                  scale: 1.02,
                }}
              />
            </YStack>
          );
    }
  };

  return (
    <View flex={1} backgroundColor="$gray1Dark">
      <AnimatePresence>
        {renderStep()}
      </AnimatePresence>
      <XStack gap="$3" padding="$4">
        {step > 0 && (
          <Button 
            flex={1} 
            variant="outlined"
            onPress={() => setStep(prev => prev - 1)}
            backgroundColor="$gray4Dark"
            borderColor="$gray8Dark"
          >
            <Text color="$gray12Dark">Back</Text>
          </Button>
        )}
        <Button
          flex={2}
          backgroundColor={formData.primaryColor} // Remove opacity from background
          borderColor={formData.primaryColor}
          borderWidth={1}
          opacity={!canProceed() ? 0.5 : 1}
          disabled={!canProceed()}
          onPress={() => {
            if (step === 4) handleComplete();
            else setStep(prev => prev + 1);
          }}
        >
          <Text color="white" fontWeight="bold"> {/* Fixed text color to white for better contrast */}
            {step === 4 ? 'Complete' : 'Continue'}
          </Text>
        </Button>
      </XStack>
    </View>
  );
}
