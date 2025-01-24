import React, { useEffect, useState } from 'react';
import { Text } from 'tamagui';

interface AnimatedTextProps {
  text: string;
  speed?: number;
  color?: string;
  fontSize?: number;
}

export const AnimatedText = ({ 
  text, 
  speed = 30, 
  color = 'white',
  fontSize = 16 
}: AnimatedTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <Text 
      color={color} 
      whiteSpace="pre-wrap"
      fontSize={fontSize}
    >
      {displayedText}
    </Text>
  );
};
