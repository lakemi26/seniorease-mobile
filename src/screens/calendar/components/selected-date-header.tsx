import { StyleSheet, View } from 'react-native'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { useTheme } from '@/contexts/theme-context'

interface SelectedDateHeaderProps {
  dateLabel: string
  activityCount: number
  onCreatePress: () => void
}

export function SelectedDateHeader({ dateLabel, activityCount, onCreatePress }: SelectedDateHeaderProps) {
  const { colors, spacing } = useTheme()
  const countLabel = activityCount === 1 ? '1 atividade' : `${activityCount} atividades`

  return (
    <View
      style={[styles.container, { gap: spacing.md }]}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Data selecionada: ${dateLabel}. ${countLabel}.`}
    >
      <View style={styles.textBlock}>
        <ThemeText variant="title">Agenda do dia</ThemeText>
        <ThemeText variant="body" style={{ color: colors.textMuted }}>
          {dateLabel}
        </ThemeText>
        <ThemeText variant="label" style={{ color: colors.primary }}>
          {countLabel}
        </ThemeText>
      </View>

      <AppButton title="Adicionar atividade" onPress={onCreatePress} variant="primary" fullWidth={false} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  textBlock: {
    flex: 1,
    minWidth: 160,
  },
})
