import { View, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { StepProgress } from './step-progress'
import { StickyActionFooter } from './sticky-action-footer'
import type { UserPreferences } from '@/modules/authentication/domain/entities'
import { ONBOARDING_STEPS } from '@/modules/onboarding/domain/steps'

interface OnboardingLayoutProps {
  step: number
  totalSteps: number
  saving: boolean
  onNext: () => void
  onBack: () => void
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
}

const TOTAL_STEPS = ONBOARDING_STEPS.length

export function OnboardingLayout({
  step,
  totalSteps,
  saving,
  onNext,
  onBack,
  children,
}: React.PropsWithChildren<OnboardingLayoutProps>) {
  const { colors, spacing } = useTheme()
  const insets = useSafeAreaInsets()

  const stepInfo = ONBOARDING_STEPS[step - 1]
  const isLastStep = step >= totalSteps
  const isFirstStep = step <= 1

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { padding: spacing.xl, paddingTop: insets.top + spacing.md, gap: spacing.lg }]}>
          <StepProgress current={step} total={TOTAL_STEPS} />

          {step === 1 ? null : (
            <View style={{ gap: spacing.xs }}>
              <ThemeText variant="title">{stepInfo?.title}</ThemeText>
              <ThemeText variant="body" color={colors.textMuted}>
                {stepInfo?.description}
              </ThemeText>
            </View>
          )}

          {children}
        </View>
      </ScrollView>

      <StickyActionFooter
        showBack={!isFirstStep}
        nextLabel={isLastStep ? 'Concluir' : 'Continuar'}
        onBack={onBack}
        onNext={onNext}
        saving={saving}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {},
})
