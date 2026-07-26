import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { StepSummaryItem } from './step-summary-item'
import type { Activity } from '@/modules/activities/domain/entities'

interface ActivityStepsSummaryProps {
  steps: Activity['steps']
  onReopenStep?: (stepId: string) => void
  canReopen?: boolean
}

export function ActivityStepsSummary({ steps, onReopenStep, canReopen }: ActivityStepsSummaryProps) {
  const { spacing } = useTheme()
  const sorted = [...steps].sort((a, b) => a.order - b.order)

  return (
    <View style={{ gap: spacing.sm }}>
      <ThemeText variant="subtitle">Etapas</ThemeText>
      {sorted.map((step, i) => (
        <StepSummaryItem
          key={step.id}
          step={step}
          index={i}
          onReopen={onReopenStep}
          canReopen={canReopen}
        />
      ))}
    </View>
  )
}
