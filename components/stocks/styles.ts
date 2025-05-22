import { useColorScheme } from 'react-native'

export const useStockStyles = (primaryColor: string, isFocused = false) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  
  return {
    input: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
      borderColor: isFocused 
        ? primaryColor 
        : (isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)"),
      borderWidth: isFocused ? 2 : 1,
      color: "$color",
      fontSize: 16,
      height: 48,
      px: "$3",
      py: "$3",
      br: 12,
    },
    container: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      borderWidth: 1,
      br: 12,
    }
  }
} 