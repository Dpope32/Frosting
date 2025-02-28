import React, { useState } from 'react';
import { YStack, Text, Input, Button } from 'tamagui';
import { BaseCardModal } from './BaseCardModal';
import { useUserStore } from '@/store/UserStore';
import { addToWatchlist } from '@/store/PortfolioStore';
import { useQueryClient } from '@tanstack/react-query';

interface WatchlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WatchlistModal({ open, onOpenChange }: WatchlistModalProps) {
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState('');
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const queryClient = useQueryClient();
  
  const handleAddToWatchlist = async () => {
    if (!symbol) {
      setError('Please enter a stock symbol');
      return;
    }
    
    try {
      await addToWatchlist(symbol.toUpperCase());
      queryClient.invalidateQueries({ queryKey: ['stock-prices'] });
      setSymbol('');
      onOpenChange(false);
    } catch (err) {
      setError('Failed to add to watchlist. Please try again.');
    }
  };
  
  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add to Watchlist"
    >
      <YStack gap="$3" paddingVertical="$2">
        <YStack>
          <Text color="$colorSubdued" fontSize={12} marginBottom="$1">
            Stock Symbol
          </Text>
          <Input
            value={symbol}
            onChangeText={(v) => {
              setSymbol(v);
              setError('');
            }}
            placeholder="e.g. AAPL"
            placeholderTextColor="$color11"
            autoCapitalize="characters"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            height={40}
            borderRadius={8}
            paddingHorizontal="$2"
          />
        </YStack>
        
        {error && (
          <Text 
            color="$red10" 
            fontSize={12} 
            textAlign="center"
            backgroundColor="$red2"
            padding="$2"
            borderRadius={6}
          >
            {error}
          </Text>
        )}
        
        <Button
          backgroundColor={primaryColor}
          height={40}
          borderRadius={8}
          opacity={!symbol ? 0.5 : 1}
          disabled={!symbol}
          pressStyle={{ opacity: 0.8, scale: 0.98 }}
          onPress={handleAddToWatchlist}
        >
          <Text color="#fff" fontWeight="500" fontSize={14}>
            Add to Watchlist
          </Text>
        </Button>
      </YStack>
    </BaseCardModal>
  );
}
