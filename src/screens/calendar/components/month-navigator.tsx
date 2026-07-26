import { StyleSheet, View } from 'react-native'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { IconButton } from '@/components/ui/icon-button'
import { useTheme } from '@/contexts/theme-context'

interface MonthNavigatorProps {
  monthLabel: string
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export function MonthNavigator({ monthLabel, onPreviousMonth, onNextMonth, onToday }: MonthNavigatorProps) {
  const { colors, spacing } = useTheme()

  return (
    <View style={{ gap: spacing.sm }} accessibilityLiveRegion="polite">
      <View style={[styles.monthRow, { gap: spacing.sm }]}>
        <IconButton
          icon="chevron-back-outline"
          onPress={onPreviousMonth}
          color={colors.primary}
          accessibilityLabel="Mês anterior"
        />
        <ThemeText
          variant="title"
          accessibilityRole="header"
          accessibilityLabel={`Mês exibido: ${monthLabel}`}
          style={[styles.monthTitle, { color: colors.text }]}
        >
          {monthLabel}
        </ThemeText>
        <IconButton
          icon="chevron-forward-outline"
          onPress={onNextMonth}
          color={colors.primary}
          accessibilityLabel="Próximo mês"
        />
      </View>

      <View style={styles.todayRow}>
        <AppButton title="Hoje" onPress={onToday} variant="outline" fullWidth={false} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  todayRow: {
    alignItems: 'center',
  },
})
