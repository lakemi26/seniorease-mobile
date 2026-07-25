import { View, StyleSheet, Platform } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { ThemeView } from '@/components/theme/theme-view'
import { AppButton } from '@/components/ui/app-button'

interface DashboardErrorProps {
  message: string
  onRetry: () => void
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  const { colors, spacing, radius, shadows } = useTheme()

  return (
    <ThemeView
      surface
      style={[
        styles.card,
        {
          padding: spacing.xl,
          borderRadius: radius.lg,
          borderColor: colors.border,
          ...Platform.select({ web: shadows.md, default: shadows.md }),
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel="Erro ao carregar o dashboard"
    >
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <ThemeText variant="subtitle" style={{ color: colors.text, textAlign: 'center' }}>
          Não foi possível carregar o início.
        </ThemeText>
        <ThemeText variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>
          {message}
        </ThemeText>
        <AppButton
          title="Tentar novamente"
          onPress={onRetry}
          variant="primary"
          accessibilityLabel="Tentar carregar o dashboard novamente"
        />
      </View>
    </ThemeView>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
})
