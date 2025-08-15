import { useColorScheme } from './useColorScheme';
import { TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { isIpad } from '@/utils';

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
    codeBg: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', // Back to original colors
    hr: isDark ? '#444' : '#CCC',
    tableBorder: isDark ? '#555' : '#DDD',
  };

  // Markdown styles for react-native-markdown-display
  const markdownStyles: MarkdownStyle = {
    body: { 
      color: colors.text, 
      fontFamily: '$body', 
      marginBottom: 0,
      fontSize: isTablet ? 16 : 14
    } as TextStyle,
    heading1: { 
      color: colors.text, 
      fontFamily: '$heading', 
      fontSize: isTablet ? 18 : 16, 
      fontWeight: '700',
      marginTop: 4,
    } as TextStyle,
    heading2: { 
      color: colors.text, 
      fontFamily: '$heading', 
      fontSize: isTablet ? 18 : 16, 
      marginLeft: isTablet ? 4 : 3,
      marginBottom: 1, 
      fontWeight: '500',
      marginTop: 6 
    } as TextStyle,
    heading3: { 
      color: colors.text, 
      fontFamily: '$heading', 
      fontSize: isTablet ? 17 : 15, 
      marginLeft: isTablet ? 5 : 4,
      marginBottom: 2, 
      marginTop: 5 
    } as TextStyle,
    heading4: { 
      color: colors.text, 
      fontFamily: '$heading', 
      fontSize: isTablet ? 16 : 14, 
      marginLeft: isTablet ? 6 : 5,
      marginBottom: 0, 
      marginTop: 10 
    } as TextStyle,
    link: { 
      color: colors.accent 
    } as TextStyle,
    blockquote: { 
      backgroundColor: colors.blockquoteBg, 
      padding: 8, 
      marginLeft: isTablet ? 7 : 6,
      borderRadius: 4, 
      borderLeftWidth: 0, 
      borderLeftColor: colors.blockquoteBorder,
      marginVertical: 12,
      marginHorizontal: 10,
    } as ViewStyle,
    code_inline: { 
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)', 
      fontFamily: 'monospace',
      fontSize: isTablet ? 15 : 14,
      color: colors.text, 
      fontWeight: '500',
      lineHeight: isTablet ? 28 : 24, // This works for vertical!
      letterSpacing: 1,
      borderRadius: 4,
      marginHorizontal: isTablet ? 8 : 6, // Try margin for horizontal spacing
    } as TextStyle,
    code_block: { 
      // Using custom rule now, this style is just a fallback
      backgroundColor: 'transparent',
      color: colors.text,
      fontFamily: 'monospace',
      fontSize: isTablet ? 15 : 14,
    } as TextStyle,
    list_item: { 
      color: colors.text, 
      marginBottom: 3,
      marginTop: 1,
      fontSize: isTablet ? 16 : 15,
      marginLeft: 10,
    } as TextStyle,
    bullet_list: { 
      color: colors.text,
      marginTop: 1,
      marginBottom: 4
    } as TextStyle,
    list_item_bullet: { 
      marginLeft: isTablet ? 7 : 6,
    } as TextStyle,
    ordered_list: { 
      color: colors.text,
      marginTop: 1,
      marginBottom: 4
    } as TextStyle,
    hr: { 
      backgroundColor: colors.hr, 
      height: 1, 
      marginVertical: 16,
      marginLeft: isTablet ? 7 : 6,
    } as ViewStyle,
    table: { 
      borderWidth: 1, 
      borderColor: colors.tableBorder, 
      marginLeft: isTablet ? 7 : 6,
      marginVertical: 12 
    } as ViewStyle,
    thead: { 
      backgroundColor: colors.cardBorder,
      marginLeft: isTablet ? 7 : 6,
    } as ViewStyle,
    th: { 
      padding: 4, 
      borderWidth: 1, 
      borderColor: colors.tableBorder, 
      color: colors.text,
      fontSize: isTablet ? 16 : 14,
      marginLeft: isTablet ? 7 : 6,
    } as TextStyle,
    td: { 
      padding: 5, 
      borderWidth: 1, 
      borderColor: colors.tableBorder, 
      color: colors.text,
      fontSize: isTablet ? 16 : 14
    } as TextStyle,
    em: { 
      fontStyle: 'italic' as const,
      fontFamily: '$body',
      fontWeight: 'normal',
      face: 'italic'
    } as TextStyle,
    strong: { 
      fontWeight: 'bold' as const,
      fontFamily: '$body',
      face: 'bold'
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
      marginBottom: 4,
      marginTop: 4,
      marginHorizontal: 8,
      fontSize: isTablet ? 16 : 14
    } as TextStyle,
    checkbox: {
      color: colors.text,
      fontFamily: '$body',
        fontSize: isTablet ? 16 : 15,
      marginLeft: isTablet ? 10 : 9,
      marginBottom: 3,
      marginTop: 1,
      position: 'relative',
      paddingLeft: 8,
    } as TextStyle,
    checkbox_unchecked: {
      width: 15,
      height: 15,
      borderWidth: 1.5,
      marginLeft: isTablet ? 10 : 9,
      borderRadius: 3,
      marginRight: -8,
      borderColor: colors.textSecondary,
    } as ViewStyle,
    checkbox_checked: {
      backgroundColor: 'rgba(0, 200, 81, 0.1)',
      borderColor: '#00C851',
      marginLeft: isTablet ? 10 : 9,
      width: 15,
      height: 15,
      marginRight: -8,
    } as ViewStyle,
    checkbox_icon: {
      color: '#00C851',
      fontSize: 10,
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
    } as TextStyle,
    bullet_list_icon: {
      color: colors.text,
      fontSize: 16,
      marginRight: 8,
    } as TextStyle,
    tally: {
      fontFamily: 'monospace',
      fontSize: isTablet ? 14 : 13,
      color: colors.text,
      fontWeight: '500',
      letterSpacing: 0.5,
      position: 'relative',
      textDecorationLine: 'line-through',
      textDecorationColor: colors.text,
    } as TextStyle,
  };

  /**
   * Detects if text contains markdown formatting
   * Simple and non-aggressive to avoid cursor positioning issues
   */
  const detectMarkdown = (content: string): boolean => {
    if (!content) return false;
    
    // Only detect obvious markdown - be very conservative
    return Boolean(
      content.match(/(\*\*.*?\*\*)|(`.*?`)|^#{1,6}\s|```|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)|^>\s|(\W|^)(I{3,})(\W|$)/m)
    );
  };

  /**
   * Converts sequences of "I" characters into proper tally mark bundles
   * Groups of 5 get the classic diagonal slash: ||||/
   */
  const processTallyMarks = (content: string): string => {
    return content.replace(/(\W|^)(I{3,})(\W|$)/g, (match, before, tallies, after) => {
      const count = tallies.length;
      let result = '';
      
      // Create bundles of 5 with diagonal slash
      const fullBundles = Math.floor(count / 5);
      const remainder = count % 5;
      
      // Add full bundles (groups of 5 with special markdown)
      for (let i = 0; i < fullBundles; i++) {
        result += i > 0 ? ' ' : '';
        result += '[TALLY:5]';
      }
      
      // Add remainder tallies
      if (remainder > 0) {
        if (fullBundles > 0) result += ' ';
        result += `[TALLY:${remainder}]`;
      }
      
      return before + result + after;
    });
  };

  return {
    colors,
    markdownStyles,
    detectMarkdown,
    processTallyMarks
  };
};
