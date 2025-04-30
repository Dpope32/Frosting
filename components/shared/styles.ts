import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, Platform } from 'react-native';
import { useMemo } from 'react';
import { isIpad } from '@/utils/deviceUtils';

export const useDrawerStyles = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? 'rgba(14, 14, 15, 1)' : 'rgb(200, 200, 200)';
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
      marginTop: isIpad() ? -12 : 0,
    },
    header: {
      paddingTop: isWeb ? isIpad() ? 20 : 50 : 50,
      paddingBottom: isWeb ? isIpad() ? 10 : 15 : 15,
      paddingHorizontal: isWeb ? isIpad() ? 20 : 18 : 24,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor
    },
    profileImage: {
      width: isWeb ? 40 : 40,
      height: isWeb ? 40 : 40,
      borderRadius: isWeb ?  20 : 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.5)",
      marginRight: 12
    },
    username: {
      color: textColor,
      fontSize: 18,
      fontWeight: '600'
    },
    content: {
      flex: 1,
      backgroundColor
    },
    scrollView: {
      overflowX: 'hidden',
      overflowY: 'auto'
    },
    scrollViewContent: {
      paddingTop: 6
    }
  }), [backgroundColor, textColor, borderColor, isWeb]);
};
