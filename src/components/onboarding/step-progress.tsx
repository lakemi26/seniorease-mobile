import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'

interface StepProgressProps {
  current: number
  total: number
}

export function StepProgress({ current, total }: StepProgressProps) {
  const { colors, spacing } = useTheme()

  return (
    <View
      style={[styles.container, { gap: spacing.sm }]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Etapa ${current} de ${total}`}
      accessibilityValue={{ now: current, min: 1, max: total }}
    >
      <ThemeText variant="caption">
        Etapa {current} de {total}
      </ThemeText>
      <View style={[styles.bar, { backgroundColor: colors.border, borderRadius: 5 }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: colors.primary,
              width: `${(current / total) * 100}%`,
              borderRadius: 5,
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  bar: {
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
})
