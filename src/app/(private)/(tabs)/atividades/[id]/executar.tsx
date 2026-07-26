import { useCallback, useState } from 'react'
import { View, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTheme } from '@/contexts/theme-context'
import { usePreferences } from '@/contexts/preferences-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { useActivityExecution } from '@/screens/activities/hook/use-activity-execution'
import { ActivityExecutionSkeleton } from '@/screens/activities/components/activity-execution-skeleton'
import { ActivityExecutionErrorState } from '@/screens/activities/components/activity-execution-error-state'
import { ActivityExecutionIntroduction } from '@/screens/activities/components/activity-execution-introduction'
import { GuidedActivityStep } from '@/screens/activities/components/guided-activity-step'
import { ActivityStepsSummary } from '@/screens/activities/components/activity-steps-summary'
import { ActivityCompletionDialog } from '@/screens/activities/components/activity-completion-dialog'
import { ReopenStepDialog } from '@/screens/activities/components/reopen-step-dialog'
import { ReopenActivityDialog } from '@/screens/activities/components/reopen-activity-dialog'

export default function ActivityExecutionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { spacing, interfaceMode, reduceMotion } = useTheme()
  const { preferences } = usePreferences()
  const isComplete = interfaceMode === 'complete'
  const confirmCritical = preferences.confirmCriticalActions

  const {
    state,
    startActivity,
    completeCurrentStep,
    reopenStep,
    completeActivity,
    reopenActivity,
    refetch,
    clearFeedback,
  } = useActivityExecution(id)

  const { mode, activity, currentStep, sortedSteps, completedCount, totalSteps, progressPercent, isProcessing, error, feedbackMessage } = state

  const [showReopenStepDialog, setShowReopenStepDialog] = useState(false)
  const [reopeningStepId, setReopeningStepId] = useState<string | null>(null)
  const [showReopenActivityDialog, setShowReopenActivityDialog] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [showReviewSummary, setShowReviewSummary] = useState(false)

  const handleStart = useCallback(async () => {
    const ok = await startActivity()
    if (ok) {
    }
  }, [startActivity])

  const handleCompleteStep = useCallback(async () => {
    const isLastStep = currentStep && sortedSteps.findIndex(s => s.id === currentStep.id) === sortedSteps.length - 1
    const ok = await completeCurrentStep()
    if (ok && isLastStep) {
      setShowCompletionDialog(true)
    }
  }, [completeCurrentStep, currentStep, sortedSteps])

  const handleCompleteActivity = useCallback(async () => {
    const ok = await completeActivity()
    if (ok) {
      router.replace(`/atividades/${id}` as any)
    }
  }, [completeActivity, id, router])

  const handleReopenStepRequest = useCallback((stepId: string) => {
    setReopeningStepId(stepId)
    setShowReopenStepDialog(true)
  }, [])

  const handleReopenStepConfirm = useCallback(async () => {
    if (!reopeningStepId) return
    await reopenStep(reopeningStepId)
    setShowReopenStepDialog(false)
    setReopeningStepId(null)
  }, [reopeningStepId, reopenStep])

  const handleReopenActivityConfirm = useCallback(async () => {
    const ok = await reopenActivity()
    if (ok) {
      setShowReopenActivityDialog(false)
    }
  }, [reopenActivity])

  const handleGoBack = useCallback(() => {
    router.replace(`/atividades/${id}` as any)
  }, [router, id])

  if (mode === 'loading') {
    return <ActivityExecutionSkeleton />
  }

  if (mode === 'error') {
    return <ActivityExecutionErrorState message={error || ''} onRetry={refetch} />
  }

  if (!activity) {
    return <ActivityExecutionErrorState message="Atividade não encontrada." onRetry={refetch} />
  }

  if (mode === 'introduction') {
    return (
      <ThemeView style={{ flex: 1 }}>
        <ActivityExecutionIntroduction
          activity={activity}
          onStart={handleStart}
          isProcessing={isProcessing}
        />
      </ThemeView>
    )
  }

  if (mode === 'no-steps') {
    return (
      <ThemeView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flex: 1, padding: spacing.xl, gap: spacing.xl }}>
          <View style={{ gap: spacing.md }}>
            <ThemeText variant="display">{activity.title}</ThemeText>
            {activity.description && (
              <ThemeText variant="body" color="muted">{activity.description}</ThemeText>
            )}
          </View>
          <ThemeText variant="body" color="muted">
            Esta atividade não possui etapas cadastradas.
          </ThemeText>
          <View style={{ flex: 1 }} />
          <AppButton
            title="Concluir atividade"
            onPress={handleCompleteActivity}
            variant="primary"
            loading={isProcessing}
            disabled={isProcessing}
          />
        </ScrollView>
      </ThemeView>
    )
  }

  if (mode === 'completion') {
    return (
      <ThemeView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}>
          <View style={{ gap: spacing.md }}>
            <ThemeText variant="display">{activity.title}</ThemeText>
            <ThemeText variant="title" color="success">
              Atividade concluída com sucesso.
            </ThemeText>
          </View>

          {isComplete && (
            <ActivityStepsSummary
              steps={sortedSteps}
              onReopenStep={handleReopenStepRequest}
              canReopen
            />
          )}

          <View style={{ gap: spacing.md }}>
            <AppButton
              title="Voltar para atividade"
              onPress={handleGoBack}
              variant="primary"
            />
            <AppButton
              title="Reabrir atividade"
              onPress={() => setShowReopenActivityDialog(true)}
              variant="outline"
            />
          </View>
        </ScrollView>

        <ReopenStepDialog
          visible={showReopenStepDialog}
          onConfirm={handleReopenStepConfirm}
          onCancel={() => { setShowReopenStepDialog(false); setReopeningStepId(null) }}
          isLoading={isProcessing}
        />

        <ReopenActivityDialog
          visible={showReopenActivityDialog}
          onConfirm={handleReopenActivityConfirm}
          onCancel={() => setShowReopenActivityDialog(false)}
          isLoading={isProcessing}
        />
      </ThemeView>
    )
  }

  if (showReviewSummary) {
    return (
      <ThemeView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}>
          <ThemeText variant="display">{activity.title}</ThemeText>
          <ActivityStepsSummary
            steps={sortedSteps}
            onReopenStep={handleReopenStepRequest}
            canReopen
          />
          <AppButton
            title="Voltar para execução"
            onPress={() => setShowReviewSummary(false)}
            variant="primary"
          />
        </ScrollView>

        <ReopenStepDialog
          visible={showReopenStepDialog}
          onConfirm={handleReopenStepConfirm}
          onCancel={() => { setShowReopenStepDialog(false); setReopeningStepId(null) }}
          isLoading={isProcessing}
        />
      </ThemeView>
    )
  }

  return (
    <ThemeView style={{ flex: 1 }}>
      {currentStep ? (
        <GuidedActivityStep
          activity={activity}
          currentStep={currentStep}
          sortedSteps={sortedSteps}
          completedCount={completedCount}
          totalSteps={totalSteps}
          progressPercent={progressPercent}
          onCompleteStep={handleCompleteStep}
          isProcessing={isProcessing}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <ThemeText variant="body">Carregando etapa…</ThemeText>
        </View>
      )}

      {feedbackMessage && (
        <View
          style={{
            position: 'absolute',
            bottom: 100,
            left: spacing.xl,
            right: spacing.xl,
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderRadius: 12,
            padding: spacing.md,
            alignItems: 'center',
          }}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          <ThemeText variant="body" style={{ color: '#FFFFFF', textAlign: 'center' }}>
            {feedbackMessage}
          </ThemeText>
        </View>
      )}

      <ActivityCompletionDialog
        visible={showCompletionDialog}
        onReviewSteps={() => { setShowCompletionDialog(false); setShowReviewSummary(true) }}
        onComplete={handleCompleteActivity}
        isProcessing={isProcessing}
      />

      <ReopenStepDialog
        visible={showReopenStepDialog}
        onConfirm={handleReopenStepConfirm}
        onCancel={() => { setShowReopenStepDialog(false); setReopeningStepId(null) }}
        isLoading={isProcessing}
      />
    </ThemeView>
  )
}
