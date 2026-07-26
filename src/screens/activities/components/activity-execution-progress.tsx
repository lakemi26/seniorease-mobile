import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'

interface ActivityExecutionProgressProps {
  completedCount: number
  totalSteps: number
  progressPercent: number
}

export function ActivityExecutionProgress({ completedCount, totalSteps, progressPercent }: ActivityExecutionProgressProps) {
  const { colors, spacing } = useTheme()
  const label = `${completedCount} de ${totalSteps} etapas concluídas`

  return (
    <View
      style={{ gap: spacing.sm }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: progressPercent }}
      accessibilityLabel={label}
    >
      <View style={[styles.barContainer, { backgroundColor: colors.surfaceMuted, borderRadius: 8 }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: progressPercent === 100 ? colors.success : colors.primary,
              borderRadius: 8,
            },
          ]}
        />
      </View>
      <ThemeText variant="caption" color="muted">{label}</ThemeText>
    </View>
  )
}

const styles = StyleSheet.create({
  barContainer: {
    height: 12,
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
})
