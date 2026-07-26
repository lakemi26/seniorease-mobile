import { View, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { touchSize } from '@/shared/theme/spacing'
import type { Activity } from '@/modules/activities/domain/entities'

interface StepSummaryItemProps {
  step: Activity['steps'][number]
  index: number
  onReopen?: (stepId: string) => void
  canReopen?: boolean
}

export function StepSummaryItem({ step, index, onReopen, canReopen }: StepSummaryItemProps) {
  const { colors, spacing } = useTheme()

  const statusLabel = step.completed ? 'Concluída' : 'Pendente'

  return (
    <View
      style={[
        styles.row,
        {
          gap: spacing.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: 8,
        },
      ]}
    >
      <ThemeText variant="body" color={step.completed ? colors.success : colors.textMuted}>
        {step.completed ? '✓' : `${index + 1}.`}
      </ThemeText>
      <View style={{ flex: 1 }}>
        <ThemeText
          variant="body"
          color={step.completed ? colors.textMuted : colors.text}
          style={step.completed ? styles.completed : undefined}
        >
          {step.title}
        </ThemeText>
        <ThemeText variant="caption" style={{ color: colors.textMuted }}>
          {statusLabel}
        </ThemeText>
      </View>
      {canReopen && step.completed && onReopen && (
        <Pressable
          onPress={() => onReopen(step.id)}
          accessibilityRole="button"
          accessibilityLabel={`Reabrir etapa "${step.title}"`}
          style={{ minHeight: touchSize.min, justifyContent: 'center', paddingHorizontal: spacing.sm }}
        >
          <ThemeText variant="body" color={colors.primary}>Reabrir</ThemeText>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  completed: {
    textDecorationLine: 'line-through',
  },
})
