import { View, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { radius } from '@/shared/theme/radius'
import { touchSize } from '@/shared/theme/spacing'
import { getPriorityLabel } from '@/modules/activities/domain/activity-utils'
import type { ActivityPriority } from '@/modules/activities/domain/entities'

const OPTIONS: ActivityPriority[] = ['low', 'medium', 'high']

interface PrioritySelectorProps {
  value: ActivityPriority
  onChange: (priority: ActivityPriority) => void
  error?: string
}

export function PrioritySelector({ value, onChange, error }: PrioritySelectorProps) {
  const { colors, spacing } = useTheme()

  const priorityColors: Record<string, string> = {
    low: colors.success,
    medium: colors.warning,
    high: colors.danger,
  }

  return (
    <View style={{ gap: spacing.xs }}>
      <ThemeText variant="label">
        Prioridade <ThemeText variant="caption" color={colors.danger}>*</ThemeText>
      </ThemeText>

      <View style={[styles.row, { gap: spacing.sm }]} accessibilityRole="radiogroup" accessibilityLabel="Selecionar prioridade">
        {OPTIONS.map((opt) => {
          const selected = value === opt
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${getPriorityLabel(opt)}${selected ? ', selecionado' : ''}`}
              style={[
                styles.option,
                {
                  borderRadius: radius.md,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  minHeight: touchSize.min,
                  minWidth: 80,
                },
                selected
                  ? {
                      backgroundColor: priorityColors[opt] + '20',
                      borderColor: priorityColors[opt],
                    }
                  : {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
              ]}
            >
              <ThemeText
                variant="label"
                color={selected ? priorityColors[opt] : colors.text}
                style={styles.center}
              >
                {getPriorityLabel(opt)}
              </ThemeText>
            </Pressable>
          )
        })}
      </View>

      {error && (
        <ThemeText variant="caption" color={colors.danger} accessibilityRole="alert">
          {error}
        </ThemeText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  center: {
    textAlign: 'center',
  },
})
