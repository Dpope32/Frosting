import { useColorScheme } from './useColorScheme';
import { TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { isIpad } from '@/utils/deviceUtils';

type MarkdownStyle = {
  [key: string]: TextStyle | ViewStyle | ImageStyle;
};

/**
 * Hook that provides consistent markdown styling
 * for markdown rendering throughout the app
 */
export const useMarkdownStyles = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isTablet = isIpad();

  const colors = {
    background: isDark ? 'rgba(190, 190, 190, 0.1)' : '#FFFFFF',
    text: isDark ? '#FCF5E5' : '#000000',
    textSecondary: isDark ? '#8E8E93' : '#6C757D',
    shadow: isDark ? '#000000' : '#000000',
    accent: isDark ? '#0A84FF' : '#007AFF',
    cardBorderDragging: isDark ? '#0A84FF' : '#007AFF',
    cardBorder: isDark ? '#444444' : '#DDDDDD',
    blockquoteBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    blockquoteBorder: isDark ? '#555' : '#DDD',
    codeBg: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    hr: isDark ? '#444' : '#CCC',
    tableBorder: isDark ? '#555' : '#DDD',
  };

  // Markdown styles for react-native-markdown-display
  const markdownStyles: MarkdownStyle = {
    body: { 
      color: colors.text, 
      fontFamily: '$body', 
      marginBottom: 8,
      fontSize: isTablet ? 18 : 16
    } as TextStyle,
    heading1: { 
      color: colors.text, 
      fontFamily: '$heading', 
      fontSize: isTablet ? 24 : 24, 
      marginBottom: 12, 
      marginTop: 16 
    } as TextStyle,
    heading2: { 
      color: colors.text, 
      fontFamily: '$heading', 
      fontSize: isTablet ? 24 : 20, 
      marginBottom: 10, 
      marginTop: 14 
    } as TextStyle,
    heading3: { 
      color: colors.text, 
      fontFamily: '$heading', 
      fontSize: isTablet ? 22 : 18, 
      marginBottom: 8, 
      marginTop: 12 
    } as TextStyle,
    heading4: { 
      color: colors.text, 
      fontFamily: '$heading', 
      fontSize: isTablet ? 20 : 16, 
      marginBottom: 8, 
      marginTop: 10 
    } as TextStyle,
    link: { 
      color: colors.accent 
    } as TextStyle,
    blockquote: { 
      backgroundColor: colors.blockquoteBg, 
      padding: 8, 
      borderRadius: 4, 
      borderLeftWidth: 0, 
      borderLeftColor: colors.blockquoteBorder,
      marginVertical: 12
    } as ViewStyle,
    code_inline: { 
      backgroundColor: colors.codeBg, 
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4, 
      fontFamily: 'monospace',
      marginVertical: 2,
      fontSize: isTablet ? 16 : 14
    } as TextStyle,
    code_block: { 
      backgroundColor: colors.codeBg, 
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 4, 
      fontFamily: 'monospace',
      marginVertical: 12,
      fontSize: isTablet ? 16 : 14
    } as TextStyle,
    list_item: { 
      color: colors.text, 
      marginBottom: 6,
      marginTop: 4,
      fontSize: isTablet ? 18 : 16
    } as TextStyle,
    bullet_list: { 
      color: colors.text,
      marginVertical: 8
    } as TextStyle,
    ordered_list: { 
      color: colors.text,
      marginVertical: 8
    } as TextStyle,
    hr: { 
      backgroundColor: colors.hr, 
      height: 1, 
      marginVertical: 16 
    } as ViewStyle,
    table: { 
      borderWidth: 1, 
      borderColor: colors.tableBorder, 
      marginVertical: 12 
    } as ViewStyle,
    thead: { 
      backgroundColor: colors.cardBorder 
    } as ViewStyle,
    th: { 
      padding: 4, 
      borderWidth: 1, 
      borderColor: colors.tableBorder, 
      color: colors.text,
      fontSize: isTablet ? 18 : 16
    } as TextStyle,
    td: { 
      padding: 4, 
      borderWidth: 1, 
      borderColor: colors.tableBorder, 
      color: colors.text,
      fontSize: isTablet ? 18 : 16
    } as TextStyle,
    em: { 
      fontStyle: 'italic' as const,
      fontFamily: '$body' 
    } as TextStyle,
    strong: { 
      fontWeight: 'bold' as const,
      fontFamily: '$body' 
    } as TextStyle,
    del: { 
      textDecorationLine: 'line-through' as const
    } as TextStyle,
    u: { 
      textDecorationLine: 'underline' as const
    } as TextStyle,
    image: { 
      marginVertical: 12, 
      borderRadius: 4 
    } as ImageStyle,
    paragraph: { 
      marginBottom: 10,
      marginTop: 6,
      fontSize: isTablet ? 18 : 16
    } as TextStyle
  };

  /**
   * Detects if text contains markdown formatting
   */
  const detectMarkdown = (content: string): boolean => {
    if (!content) return false;
    return Boolean(
      content.match(/(\*\*.*?\*\*)|(\*.*?\*)|^#+ |!\[.*?\]\(.*?\)|^- |\n- |```.*?```|> |\[.*?\]\(.*?\)|~~.*?~~|^[-*] |\n[-*] |__.*?__|`.*?`/)
    );
  };

  return {
    colors,
    markdownStyles,
    detectMarkdown
  };
};
