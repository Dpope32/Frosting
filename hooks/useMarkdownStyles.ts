import { useColorScheme } from './useColorScheme';

/**
 * Hook that provides consistent markdown styling
 * for markdown rendering throughout the app
 */
export const useMarkdownStyles = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? 'rgba(146, 143, 143, 0.1)' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#8E8E93' : '#6C757D',
    shadow: isDark ? '#000000' : '#000000',
    accent: isDark ? '#0A84FF' : '#007AFF',
    cardBorderDragging: isDark ? '#0A84FF' : '#007AFF',
    cardBorder: isDark ? '#444444' : '#DDDDDD',
    blockquoteBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    blockquoteBorder: isDark ? '#555' : '#DDD',
    codeBg: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    hr: isDark ? '#444' : '#CCC',
    tableBorder: isDark ? '#555' : '#DDD',
  };

  // Markdown styles for react-native-markdown-display
  const markdownStyles = {
    body: { color: colors.text, fontFamily: '$body' },
    heading1: { color: colors.text, fontFamily: '$heading', fontSize: 24, marginBottom: 8, marginTop: 12 },
    heading2: { color: colors.text, fontFamily: '$heading', fontSize: 20, marginBottom: 8, marginTop: 12 },
    heading3: { color: colors.text, fontFamily: '$heading', fontSize: 18, marginBottom: 6, marginTop: 10 },
    heading4: { color: colors.text, fontFamily: '$heading', fontSize: 16, marginBottom: 4, marginTop: 8 },
    link: { color: colors.accent },
    blockquote: { backgroundColor: colors.blockquoteBg, padding: 8, borderRadius: 4, borderLeftWidth: 0, borderLeftColor: colors.blockquoteBorder },
    code_inline: { backgroundColor: colors.codeBg, padding: 4, borderRadius: 4, fontFamily: 'monospace' },
    code_block: { backgroundColor: colors.codeBg, padding: 8, borderRadius: 4, fontFamily: 'monospace' },
    list_item: { color: colors.text, marginBottom: 4 },
    bullet_list: { color: colors.text },
    ordered_list: { color: colors.text },
    hr: { backgroundColor: colors.hr, height: 1, marginVertical: 8 },
    table: { borderWidth: 1, borderColor: colors.tableBorder, marginVertical: 8 },
    thead: { backgroundColor: colors.cardBorder },
    th: { padding: 4, borderWidth: 1, borderColor: colors.tableBorder, color: colors.text },
    td: { padding: 4, borderWidth: 1, borderColor: colors.tableBorder, color: colors.text },
    em: { fontStyle: 'italic', fontFamily: '$body' },
    strong: { fontWeight: 'bold', fontFamily: '$body' },
    del: { textDecorationLine: 'line-through' },
    u: { textDecorationLine: 'underline' },
    image: { marginVertical: 8, borderRadius: 4 },
    paragraph: { marginBottom: 8 }
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
