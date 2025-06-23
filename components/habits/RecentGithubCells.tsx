import React from 'react';
import { Platform, Dimensions, Pressable, View } from 'react-native';
import { XStack, YStack, Text, isWeb } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
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
  /** Callback when today's cell is clicked (only for clickable today cells) */
  onTodayClick?: () => void;
  /** Whether today is completed (for clickable today cells) */
  todayCompleted?: boolean;
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
 * 
 * @example
 * // Clickable today cell (for drawer usage)
 * <RecentGithubCells 
 *   history={habitHistory} 
 *   today="2024-01-15" 
 *   compact={true}
 *   multiRow={true}
 *   onTodayClick={() => toggleHabit()}
 *   todayCompleted={true}
 * />
 */
export const RecentGithubCells = ({ 
  history, 
  today, 
  showTitle = true, 
  compact = false, 
  multiRow = false, 
  onTodayClick,
  todayCompleted 
}: RecentGithubCellsProps) => {
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

  const renderCell = (cellDateString: string, day: any, isToday: boolean, cellIdx: number) => {
    const isClickableToday = isToday && onTodayClick;
    
    const cellContent = (
      <YStack
        key={`cell-${cellDateString}`}
        width={squareSize}
        height={squareSize}
        borderRadius={compact ? (multiRow ? 2 : 3) : 4}
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

    if (isClickableToday) {
      return (
        <View key={`cell-${cellDateString}`} style={{ position: 'relative' }}>
          {cellContent}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
            pointerEvents="box-none"
          >
            <Pressable
              onPress={onTodayClick}
              style={{
                width: squareSize,
                height: squareSize,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
              }}
              hitSlop={8}
            >
              <View
                style={{
                  width: squareSize - 4,
                  height: squareSize - 4,
                  borderRadius: compact ? 1 : 2,
                  borderColor: todayCompleted ? '#00C851' : isDark ? '#333' : 'rgb(52, 54, 55)',
                  backgroundColor: todayCompleted
                    ? 'rgba(0, 200, 81, 0.1)'
                    : isDark
                    ? 'rgba(110, 110, 110, 0.65)'
                    : 'rgba(255,255,255,0.65)',
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {todayCompleted && (
                  <Ionicons 
                    name="checkmark-sharp" 
                    size={compact ? 8 : 10} 
                    color="#00C851" 
                  />
                )}
              </View>
            </Pressable>
          </View>
        </View>
      );
    }

    return cellContent;
  };

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
                
                return renderCell(cellDateString, day, isToday, cellIdx);
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
            
            return renderCell(cellDateString, day, isToday, idx);
          })}
        </XStack>
      )}
    </YStack>
  );
}; 