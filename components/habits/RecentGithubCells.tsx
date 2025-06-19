import React from 'react';
import { Platform, Dimensions } from 'react-native';
import { XStack, YStack, Text, isWeb } from 'tamagui';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isIpad } from '@/utils';

interface RecentGithubCellsProps {
  /** Array of habit completion history with date strings and completion status */
  history: Array<{ date: string; completed: boolean }>;
  /** Today's date in YYYY-MM-DD format */
  today: string;
  /** Whether to show the time range title. Default: true */
  showTitle?: boolean;
  /** Whether to use compact sizing for smaller spaces. Default: false */
  compact?: boolean;
  /** Whether to display cells in multiple rows instead of single row. Default: false */
  multiRow?: boolean;
}

/**
 * A GitHub-style grid component that displays habit completion history as colored cells.
 * Perfect for showing streaks and patterns in habit tracking.
 * 
 * @example
 * // Basic usage in a habit card
 * <RecentGithubCells history={habitHistory} today="2024-01-15" />
 * 
 * @example
 * // Compact usage for smaller spaces (like in a summary view)
 * <RecentGithubCells 
 *   history={habitHistory} 
 *   today="2024-01-15" 
 *   compact={true}
 *   showTitle={false}
 * />
 */
export const RecentGithubCells = ({ history, today, showTitle = true, compact = false, multiRow = false }: RecentGithubCellsProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = Platform.OS !== 'web';
  const screenWidth = Dimensions.get('window').width;
 
  const squareSize = compact ? (isWeb? 16 : isIpad() ? 14 : 12) : (isWeb? 22 : isIpad() ? 21 : 20);
  const gap = compact ? (isWeb? 4 : isIpad() ? 3 : 3) : (isWeb? 5 : isIpad() ? 4 : isMobile ? 3 : 4);
  
  // For multi-row, calculate cells per row and number of rows to fit drawer width
  const cellsPerRow = multiRow ? (compact ? (isIpad() ? 10 : 8) : 7) : null;
  const numberOfRows = multiRow ? 3 : 1;
  const totalCells = multiRow ? cellsPerRow! * numberOfRows : 
    (compact ? (isWeb? 40 : isIpad() ? 30 : isMobile ? 24 : 50) : (isIpad() ? 21 : isMobile ? 14 : isWeb ? screenWidth * 0.025 : 73));

  const timeRangeText = compact 
    ? (isIpad() ? 'Last month' : isMobile ? 'Last 3 weeks' : 'Last 50 days')
    : (isIpad() ? 'Last 3 weeks' : isMobile ? 'Last 2 weeks' : 'Last 3 months');

  return (
    <YStack
      borderRadius={8}
      px={compact ? (isIpad() ? 0 : 2) : (isIpad() ? 12 : 8)}
      py={compact ? (isIpad() ? 8 : 6) : (isIpad() ? 8 : 6)}
      mt={compact ? (isIpad() ? 4 : 2) : (isIpad() ? 6 : 4)}
      backgroundColor={isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'}
      borderWidth={1}
      borderColor={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
      mb={compact ? 4 : 6}
      gap={compact ? 4 : 5}
      pt={compact ? (isIpad() ? 6 : 4) : (isIpad() ? 0 : 4)}
      maxWidth="100%"
      alignItems="flex-start"
    >
      {showTitle && (
        <Text 
          fontFamily="$body" 
          fontSize={compact ? (isIpad() ? 11 : 9) : (isIpad() ? 13 : 11)} 
          color={isDark ? '#999' : '#666'} 
          fontWeight="500"
          mb={-2}
        >
          {timeRangeText}
        </Text>
      )}
      {multiRow ? (
        <YStack gap={gap} alignItems="center" width="100%">
          {Array.from({ length: numberOfRows }).map((_, rowIdx) => (
            <XStack key={`row-${rowIdx}`} gap={gap} justifyContent="center">
              {Array.from({ length: cellsPerRow! }).map((_, colIdx) => {
                const cellIdx = rowIdx * cellsPerRow! + colIdx;
                const daysAgo = totalCells - 1 - cellIdx;
                const cellDate = new Date();
                cellDate.setDate(cellDate.getDate() - daysAgo);
                const year = cellDate.getFullYear();
                const month = String(cellDate.getMonth() + 1).padStart(2, '0');
                const day_num = String(cellDate.getDate()).padStart(2, '0');
                const cellDateString = `${year}-${month}-${day_num}`;
                const day = history.find(h => h.date === cellDateString);
                const isToday = cellDateString === today;
                return (
                  <YStack
                    key={`cell-${cellDateString}`}
                    width={squareSize}
                    height={squareSize}
                    borderRadius={compact ? 2 : 4}
                    backgroundColor={day
                      ? day.completed
                        ? '#00C851'
                        : isDark
                          ? '#2d2d2d'
                          : '#EBEDF0'
                      : isDark
                        ? '#2d2d2d'
                        : '#EBEDF0'}
                    borderWidth={isToday ? 2 : 1}
                    borderColor={isToday 
                      ? (day?.completed ? '#00C851' : (isDark ? '#555' : '#C6C6C6'))
                      : isDark ? '#404040' : '#D1D5DA'}
                    alignItems="center"
                    justifyContent="center"
                    opacity={isToday ? 1 : 0.9}
                    style={{
                      shadowColor: isToday ? '#00C851' : 'transparent',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isToday ? 0.3 : 0,
                      shadowRadius: 2,
                    }}
                  />
                );
              })}
            </XStack>
          ))}
        </YStack>
      ) : (
        <XStack gap={gap} minWidth={isMobile ? undefined : `${totalCells * (squareSize + gap)}px`} justifyContent="flex-start">
          {Array.from({ length: totalCells }).map((_, idx) => {
            const daysAgo = totalCells - 1 - idx;
            const cellDate = new Date();
            cellDate.setDate(cellDate.getDate() - daysAgo);
            const year = cellDate.getFullYear();
            const month = String(cellDate.getMonth() + 1).padStart(2, '0');
            const day_num = String(cellDate.getDate()).padStart(2, '0');
            const cellDateString = `${year}-${month}-${day_num}`;
            const day = history.find(h => h.date === cellDateString);
            const isToday = cellDateString === today; 
            return (
              <YStack
                key={`cell-${cellDateString}`}
                width={squareSize}
                height={squareSize}
                borderRadius={compact ? 3 : 4}
                backgroundColor={day
                  ? day.completed
                    ? '#00C851'
                    : isDark
                      ? '#2d2d2d'
                      : '#EBEDF0'
                  : isDark
                    ? '#2d2d2d'
                    : '#EBEDF0'}
                borderWidth={isToday ? 2 : 1}
                borderColor={isToday 
                  ? (day?.completed ? '#00C851' : (isDark ? '#555' : '#C6C6C6'))
                  : isDark ? '#404040' : '#D1D5DA'}
                alignItems="center"
                justifyContent="center"
                opacity={isToday ? 1 : 0.9}
                style={{
                  shadowColor: isToday ? '#00C851' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isToday ? 0.3 : 0,
                  shadowRadius: 2,
                }}
              />
            );
          })}
        </XStack>
      )}
    </YStack>
  );
}; 