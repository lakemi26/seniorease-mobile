import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import type { HelpArticleStep } from '@/modules/help/data/help-content'

interface HelpStepListProps {
  steps: HelpArticleStep[]
}

export function HelpStepList({ steps }: HelpStepListProps) {
  const { colors, spacing } = useTheme()

  return (
    <View style={{ gap: spacing.md }}>
      {steps.map((step, index) => (
        <View key={step.id} style={[styles.step, { gap: spacing.xs }]}>
          <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
            <ThemeText variant="caption" style={{ color: colors.primary }}>
              {index + 1}
            </ThemeText>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <ThemeText variant="body" style={{ fontWeight: '600' }}>
              {step.title}
            </ThemeText>
            <ThemeText variant="body" style={{ color: colors.textMuted }}>
              {step.description}
            </ThemeText>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 8,
  },
})
