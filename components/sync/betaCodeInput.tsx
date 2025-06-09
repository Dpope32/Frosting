// components/sync/betaCodeInput.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { baseSpacing, cardRadius, fontSizes, Colors } from './sharedStyles';
import { redeemBetaCode } from '@/services/betaCodeService';

interface BetaCodeInputProps {
  colors: Colors;
  contentWidth: number;
  onPremiumActivated?: () => void;
}

export function BetaCodeInput({ colors, contentWidth, onPremiumActivated }: BetaCodeInputProps) {
  const [code, setCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleRedeemCode = async () => {
    if (!code.trim()) return;
    
    setIsRedeeming(true);
    try {
      const success = await redeemBetaCode(code);
      if (success) {
        setCode('');
        setShowInput(false);
        onPremiumActivated?.();
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  if (!showInput) {
    return (
      <View style={{
        width: contentWidth,
        alignSelf: 'center',
        marginVertical: baseSpacing,
      }}>
        <TouchableOpacity
          onPress={() => setShowInput(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: baseSpacing * 1.5,
            backgroundColor: colors.card,
            borderRadius: cardRadius,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
          }}
        >
          <MaterialIcons name="code" size={20} color={colors.accent} />
          <Text 
            fontSize={fontSizes.md} 
            color={colors.accent} 
            fontWeight="600" 
            marginLeft={baseSpacing}
            fontFamily="$body"
          >
            Have a beta code?
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{
      width: contentWidth,
      alignSelf: 'center',
      backgroundColor: colors.card,
      borderRadius: cardRadius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: baseSpacing * 2,
      marginVertical: baseSpacing,
    }}>
      <YStack gap={baseSpacing}>
        <XStack alignItems="center" justifyContent="space-between">
          <Text 
            fontSize={fontSizes.md} 
            color={colors.text} 
            fontWeight="600"
            fontFamily="$body"
          >
            Enter Beta Code
          </Text>
          <TouchableOpacity 
            onPress={() => {
              setShowInput(false);
              setCode('');
            }}
            style={{ padding: 4 }}
          >
            <MaterialIcons name="close" size={20} color={colors.subtext} />
          </TouchableOpacity>
        </XStack>

        <TextInput
          style={{
            backgroundColor: colors.bg,
            padding: baseSpacing * 1.5,
            borderRadius: cardRadius,
            color: colors.text,
            fontSize: fontSizes.md,
            borderWidth: 1,
            borderColor: colors.border,
            fontFamily: 'monospace',
            textAlign: 'center',
            letterSpacing: 2,
          }}
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
          placeholder="ENTER CODE"
          placeholderTextColor={colors.subtext}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={20}
          editable={!isRedeeming}
        />

        <XStack gap={baseSpacing}>
          <TouchableOpacity
            onPress={() => {
              setShowInput(false);
              setCode('');
            }}
            style={{
              flex: 1,
              padding: baseSpacing * 1.5,
              backgroundColor: colors.card,
              borderRadius: cardRadius,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
            }}
            disabled={isRedeeming}
          >
            <Text 
              fontSize={fontSizes.md} 
              color={colors.subtext} 
              fontWeight="600"
              fontFamily="$body"
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRedeemCode}
            style={{
              flex: 1,
              padding: baseSpacing * 1.5,
              backgroundColor: code.trim() ? colors.accent : colors.card,
              borderRadius: cardRadius,
              borderWidth: 1,
              borderColor: code.trim() ? colors.accent : colors.border,
              alignItems: 'center',
              opacity: isRedeeming ? 0.7 : 1,
            }}
            disabled={!code.trim() || isRedeeming}
          >
            {isRedeeming ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text 
                fontSize={fontSizes.md} 
                color={code.trim() ? 'white' : colors.subtext} 
                fontWeight="600"
                fontFamily="$body"
              >
                Redeem
              </Text>
            )}
          </TouchableOpacity>
        </XStack>

        <Text 
          fontSize={fontSizes.xs} 
          color={colors.subtext} 
          textAlign="center"
          fontFamily="$body"
        >
          Beta codes provide full premium access during the beta period
        </Text>
      </YStack>
    </View>
  );
}