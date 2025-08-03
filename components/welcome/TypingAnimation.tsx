import React, { useState, useEffect } from 'react';
import { XStack, Text, isWeb } from 'tamagui';
import { Dimensions } from 'react-native';

interface TypingAnimationProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
}

export const TypingAnimation = ({ texts, speed = 100, deleteSpeed = 50, pauseTime = 2000 }: TypingAnimationProps) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const targetText = texts[currentTextIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && currentText === targetText) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
    } else {
      const nextText = isDeleting
        ? targetText.substring(0, currentText.length - 1)
        : targetText.substring(0, currentText.length + 1);
      
      timeout = setTimeout(() => setCurrentText(nextText), isDeleting ? deleteSpeed : speed);
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isDeleting, texts, speed, deleteSpeed, pauseTime]);

  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor(prev => !prev), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  const screenWidth = Dimensions.get('window').width;
  const isMobileBrowser = isWeb && screenWidth <= 768;

  return (
    <XStack alignItems="center" justifyContent="center" gap="$2" flexWrap="wrap">
      <Text
        color="$onboardingLabel"
        fontSize="$6"
        fontWeight="400"
        textAlign="center"
        opacity={0.8}
      >
        Your
      </Text>
      <Text
        color="$onboardingLabel"
        fontSize="$6"
        fontWeight="400"
        textAlign="center"
        opacity={0.8}
        style={{
          letterSpacing: '0.01em',
        }}
      >
        {currentText}
        <Text style={{ opacity: showCursor ? 1 : 0, color: '#58A6FF' }}>|</Text>
      </Text>
    </XStack>
  );
}; 