import { StyleSheet, View } from 'react-native'
import { ThemeText } from '@/components/theme/theme-text'
import { IconButton } from '@/components/ui/icon-button'
import { useTheme } from '@/contexts/theme-context'

interface CalendarHeaderProps {
  onBack: () => void
}

export function CalendarHeader({ onBack }: CalendarHeaderProps) {
  const { colors, spacing } = useTheme()

  return (
    <View style={[styles.container, { padding: spacing.lg, gap: spacing.md }]}>
      <IconButton
        icon="arrow-back-outline"
        onPress={onBack}
        color={colors.primary}
        accessibilityLabel="Voltar"
        accessibilityHint="Retorna para a tela anterior"
      />
      <ThemeText variant="display" style={styles.title}>Calendário</ThemeText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
})
