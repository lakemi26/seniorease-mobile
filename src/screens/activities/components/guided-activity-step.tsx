import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { usePreferences } from '@/contexts/preferences-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { ActivityExecutionProgress } from './activity-execution-progress'
import type { Activity } from '@/modules/activities/domain/entities'

interface GuidedActivityStepProps {
  activity: Activity
  currentStep: { id: string; title: string; order: number; completed: boolean; completedAt: Date | null }
  sortedSteps: Activity['steps']
  completedCount: number
  totalSteps: number
  progressPercent: number
  onCompleteStep: () => void
  isProcessing: boolean
}

export function GuidedActivityStep({
  activity,
  currentStep,
  sortedSteps,
  completedCount,
  totalSteps,
  progressPercent,
  onCompleteStep,
  isProcessing,
}: GuidedActivityStepProps) {
  const { spacing } = useTheme()
  const stepIndex = sortedSteps.findIndex(s => s.id === currentStep.id)
  const stepNumber = stepIndex + 1

  return (
    <View style={{ flex: 1, gap: spacing.xl, padding: spacing.xl }}>
      <View style={{ gap: spacing.md }}>
        <ThemeText
          variant="body"
          color="muted"
          accessibilityLabel={`Etapa ${stepNumber} de ${totalSteps}`}
        >
          Etapa {stepNumber} de {totalSteps}
        </ThemeText>
        <ThemeText variant="display">{activity.title}</ThemeText>
      </View>

      <ActivityExecutionProgress
        completedCount={completedCount}
        totalSteps={totalSteps}
        progressPercent={progressPercent}
      />

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          gap: spacing.lg,
        }}
      >
        <ThemeText
          variant="title"
          accessibilityLabel={`${currentStep.title}`}
          style={{ textAlign: 'center' }}
        >
          {currentStep.title}
        </ThemeText>
      </View>

      <View style={{ gap: spacing.md }}>
        <AppButton
          title="Concluir etapa"
          onPress={onCompleteStep}
          variant="primary"
          loading={isProcessing}
          disabled={isProcessing}
          accessibilityHint="Marca esta etapa como concluída e avança para a próxima"
        />
      </View>
    </View>
  )
}
