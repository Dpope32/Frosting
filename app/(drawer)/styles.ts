
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, Platform } from 'react-native';
import { useUserStore } from '@/store/UserStore';

export const useDrawerStyles = () => {
  const colorScheme = useColorScheme();
  const { primaryColor } = useUserStore(s => s.preferences);
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#0e0e0e' : '#F5F5F5';
  const textColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)';
  const borderRightColor = isDark ? primaryColor : 'rgba(0, 0, 0, 0.1)';
  const isWeb = Platform.OS === 'web';

  return StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor,
    },
    container: {
      flex: 1,
    },
    header: {
      paddingTop: isWeb ? 20: 50,
      paddingBottom: isWeb ? 10: 20,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor
    },
    profileImage: {
      width: isWeb ? 40 : 50,
      height: isWeb ? 40 : 50,
      borderRadius: isWeb ?  20 : 25,
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
      marginTop: 10
    },
    scrollViewContent: {
      paddingTop: 0
    }
  });
};
