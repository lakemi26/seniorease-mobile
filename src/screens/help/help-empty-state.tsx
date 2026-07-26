import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'

interface HelpEmptyStateProps {
  query: string
}

export function HelpEmptyState({ query }: HelpEmptyStateProps) {
  const { colors, spacing } = useTheme()

  return (
    <View style={[styles.container, { gap: spacing.lg, paddingVertical: spacing.xxxl }]}>
      <Ionicons name="search-outline" size={48} color={colors.disabled} />
      <ThemeText variant="title" style={styles.center}>
        Nenhum resultado encontrado
      </ThemeText>
      <ThemeText variant="body" style={[styles.center, { color: colors.textMuted }]}>
        Nenhum artigo ou pergunta corresponde a "{query}".
      </ThemeText>
      <ThemeText variant="body" style={[styles.center, { color: colors.textMuted }]}>
        Tente usar outros termos ou palavras-chave.
      </ThemeText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  center: {
    textAlign: 'center',
  },
})
