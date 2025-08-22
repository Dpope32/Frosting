import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, Platform } from 'react-native';
import { useMemo } from 'react';
import { isIpad } from '@/utils';

export const useDrawerStyles = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? 'rgba(14, 14, 15, 1)' : 'rgb(225, 225, 225)';
  const textColor = isDark ? '#fff' : '#070707';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)';
  const isWeb = Platform.OS === 'web';

  return useMemo(() => StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor,
    },
    container: {
      flex: 1,
      backfaceVisibility: 'hidden',
      transform: [{ perspective: 1000 }],
      marginTop: !!isIpad() ? -20 : 0,
    },
    header: {
      paddingTop: isWeb ? (!!isIpad() ? 5 : 16) : 50,
      paddingBottom: isWeb ? (!!isIpad() ? 10 : 0) : 4,
      paddingHorizontal: isWeb ? (!!isIpad() ? 20 : 16) : 24,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor
    },
    profileImage: {
      width: isWeb ? 40 : 40,
      height: isWeb ? 40 : 40,
      borderRadius: isWeb ?  20 : 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.29)" : "rgba(0,0,0,0.5)",
      marginRight: 12
    },
    username: {
      color: textColor,
      fontSize: isWeb ? 21 : (!!isIpad() ? 24 : 20),
      fontWeight: '600'
    },
    content: {
      flex: 1,
      backgroundColor
    },
    scrollView: {
      overflow: 'hidden',
      paddingTop: 6
    },
    scrollViewContent: {
      paddingTop: 6
    }
  }), [backgroundColor, textColor, borderColor, isWeb]);
};
