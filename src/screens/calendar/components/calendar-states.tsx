import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { useTheme } from '@/contexts/theme-context'

interface CalendarEmptyStateProps {
  onCreatePress: () => void
}

interface CalendarLoadingStateProps {
  message?: string
}

interface CalendarErrorStateProps {
  error: string
  onRetry: () => void
  onBack: () => void
}

export function CalendarEmptyState({ onCreatePress }: CalendarEmptyStateProps) {
  const { colors, spacing, radius, contrast } = useTheme()
  const borderWidth = contrast === 'high' ? 2 : 1

  return (
    <View
      accessible
      accessibilityLabel="Nenhuma atividade neste dia. Você pode adicionar uma atividade para organizar este dia."
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          borderWidth,
          padding: spacing.xl,
          gap: spacing.md,
        },
      ]}
    >
      <ThemeText variant="subtitle" style={styles.centerText}>Nenhuma atividade neste dia</ThemeText>
      <ThemeText variant="body" style={[styles.centerText, { color: colors.textMuted }]}>
        Você pode adicionar uma atividade para organizar este dia.
      </ThemeText>
      <AppButton title="Adicionar atividade" onPress={onCreatePress} variant="outline" />
    </View>
  )
}

export function CalendarLoadingState({ message = 'Carregando atividades...' }: CalendarLoadingStateProps) {
  const { colors, spacing, radius, contrast } = useTheme()
  const borderWidth = contrast === 'high' ? 2 : 1

  return (
    <View
      accessible
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          borderWidth,
          padding: spacing.xl,
          gap: spacing.md,
        },
      ]}
    >
      <ActivityIndicator color={colors.primary} />
      <ThemeText variant="body" style={[styles.centerText, { color: colors.textMuted }]}>
        {message}
      </ThemeText>
    </View>
  )
}

export function CalendarErrorState({ error, onRetry, onBack }: CalendarErrorStateProps) {
  const { colors, spacing } = useTheme()

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`Erro ao carregar calendário. ${error}`}
      style={[styles.centered, { padding: spacing.xl, gap: spacing.lg }]}
    >
      <ThemeText variant="title" style={styles.centerText}>Erro ao carregar calendário</ThemeText>
      <ThemeText variant="body" style={[styles.centerText, { color: colors.textMuted }]}>
        {error}
      </ThemeText>
      <AppButton title="Tentar novamente" onPress={onRetry} variant="primary" />
      <AppButton title="Voltar" onPress={onBack} variant="ghost" />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
})
