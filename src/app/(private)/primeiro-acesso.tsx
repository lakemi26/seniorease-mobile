import { useCallback, useEffect, useRef, useState } from 'react'
import { View, AccessibilityInfo, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/auth-context'
import { usePreferences } from '@/contexts/preferences-context'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout'
import { SelectionCard } from '@/components/onboarding/selection-card'
import { SettingSwitchRow } from '@/components/onboarding/setting-switch-row'
import { DynamicPreviewCard } from '@/components/onboarding/dynamic-preview-card'
import { PreferencesSummary } from '@/components/onboarding/preferences-summary'
import { ErrorMessage } from '@/components/ui/error-message'
import { ONBOARDING_STEPS } from '@/modules/onboarding/domain/steps'
import { createOnboardingUseCases } from '@/modules/onboarding/application/use-cases'
import { createFirebaseOnboardingRepository } from '@/modules/onboarding/infrastructure/firebase-onboarding.repository'

const TOTAL_STEPS = ONBOARDING_STEPS.length

const onboardingRepo = createFirebaseOnboardingRepository()
const onboardingUseCases = createOnboardingUseCases(onboardingRepo)

export default function PrimeiroAcessoScreen() {
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()
  const { effectivePreferences, applyDraft, saveDraftAndClear, isPreviewing, clearDraft } = usePreferences()
  const theme = useTheme()
  const scrollRef = useRef<ScrollView>(null)
  const errorRef = useRef<string | null>(null)
  const ongoingSaveRef = useRef(false)

  const [step, setStep] = useState(Math.min(profile?.onboardingStep ?? 1, TOTAL_STEPS))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isPreviewing) {
      applyDraft(effectivePreferences)
    }
  }, [])

  const updatePreference = useCallback(<K extends keyof typeof effectivePreferences>(key: K, value: (typeof effectivePreferences)[K]) => {
    const draft = { ...effectivePreferences, [key]: value }
    applyDraft(draft)
    const label = String(value)
    AccessibilityInfo.announceForAccessibility(`${String(key)}: ${label}`)
  }, [effectivePreferences, applyDraft])

  const handleSetFontSize = useCallback((value: typeof effectivePreferences.fontSize) => {
    updatePreference('fontSize', value)
  }, [updatePreference])

  const handleSetContrast = useCallback((value: typeof effectivePreferences.contrast) => {
    updatePreference('contrast', value)
  }, [updatePreference])

  const handleSetSpacing = useCallback((value: typeof effectivePreferences.spacing) => {
    updatePreference('spacing', value)
  }, [updatePreference])

  const handleSetInterfaceMode = useCallback((value: typeof effectivePreferences.interfaceMode) => {
    updatePreference('interfaceMode', value)
  }, [updatePreference])

  const announceStep = useCallback((s: number) => {
    const msg = `Etapa ${s} de ${TOTAL_STEPS}. ${ONBOARDING_STEPS[s - 1]?.title}`
    AccessibilityInfo.announceForAccessibility(msg)
  }, [])

  const handleNext = useCallback(async () => {
    if (!user || ongoingSaveRef.current) return
    errorRef.current = null
    setSaving(true)
    ongoingSaveRef.current = true

    try {
      const nextStep = step + 1
      const isLastStep = nextStep > TOTAL_STEPS

      if (isLastStep) {
        await onboardingUseCases.completeFirstAccess(user.uid, effectivePreferences)
        await saveDraftAndClear()
        await refreshProfile()
        router.replace('/dashboard')
        setSaving(false)
        return
      }

      await onboardingUseCases.saveOnboardingProgress(user.uid, step, effectivePreferences)
      setStep(nextStep)
      announceStep(nextStep)
      scrollRef.current?.scrollTo({ y: 0, animated: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível salvar. Tente novamente.'
      errorRef.current = msg
    } finally {
      setSaving(false)
      ongoingSaveRef.current = false
    }
  }, [user, step, effectivePreferences, saveDraftAndClear, refreshProfile, announceStep, router])

  const handleBack = useCallback(() => {
    if (step <= 1) return
    errorRef.current = null
    const prev = step - 1
    setStep(prev)
    announceStep(prev)
    scrollRef.current?.scrollTo({ y: 0, animated: false })
  }, [step, announceStep])

  const { spacing } = theme

  return (
    <OnboardingLayout
      step={step}
      totalSteps={TOTAL_STEPS}
      saving={saving}
      onNext={handleNext}
      onBack={handleBack}
      updatePreference={updatePreference}
    >
      {errorRef.current ? (
        <ErrorMessage message={errorRef.current} onRetry={handleNext} />
      ) : null}

      {step === 1 && (
        <View style={{ gap: spacing.lg }}>
          <ThemeText variant="display" style={{ marginTop: spacing.md }}>
            Olá! Vamos configurar
          </ThemeText>
          <ThemeText variant="body">
            Vamos preparar o SeniorEase do seu jeito. São apenas algumas perguntas
            simples para deixar tudo mais confortável para você.
          </ThemeText>
          <ThemeText variant="body" color={theme.colors.textMuted}>
            Você pode voltar e ajustar qualquer escolha depois, nas configurações do aplicativo.
          </ThemeText>
        </View>
      )}

      {step === 2 && (
        <View style={{ gap: spacing.lg }}>
          <View style={{ gap: spacing.md }}>
            <SelectionCard
              label="Normal"
              description="Tamanho padrão de texto"
              selected={effectivePreferences.fontSize === 'normal'}
              onPress={() => handleSetFontSize('normal')}
            />
            <SelectionCard
              label="Grande"
              description="Texto um pouco maior, ~15% ampliado"
              selected={effectivePreferences.fontSize === 'large'}
              onPress={() => handleSetFontSize('large')}
            />
            <SelectionCard
              label="Extra grande"
              description="Texto bem grande para leitura fácil, ~30% ampliado"
              selected={effectivePreferences.fontSize === 'extraLarge'}
              onPress={() => handleSetFontSize('extraLarge')}
            />
          </View>
          <ThemeText variant="label" color={theme.colors.textMuted}>
            Veja como ficará
          </ThemeText>
          <DynamicPreviewCard />
        </View>
      )}

      {step === 3 && (
        <View style={{ gap: spacing.lg }}>
          <ThemeText variant="subtitle">Contraste</ThemeText>
          <View style={{ gap: spacing.md }}>
            <SelectionCard
              label="Padrão"
              description="Cores claras e suaves"
              selected={effectivePreferences.contrast === 'default'}
              onPress={() => handleSetContrast('default')}
            />
            <SelectionCard
              label="Escuro"
              description="Fundo escuro para menor cansaço visual"
              selected={effectivePreferences.contrast === 'dark'}
              onPress={() => handleSetContrast('dark')}
            />
            <SelectionCard
              label="Alto contraste"
              description="Máximo contraste para melhor visibilidade"
              selected={effectivePreferences.contrast === 'high'}
              onPress={() => handleSetContrast('high')}
            />
          </View>
          <DynamicPreviewCard />
          <ThemeText variant="subtitle" style={{ marginTop: spacing.md }}>Espaçamento</ThemeText>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <SelectionCard
                label="Normal"
                description="Espaços padrão"
                selected={effectivePreferences.spacing === 'normal'}
                onPress={() => handleSetSpacing('normal')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <SelectionCard
                label="Ampliado"
                description="Mais espaço entre blocos"
                selected={effectivePreferences.spacing === 'expanded'}
                onPress={() => handleSetSpacing('expanded')}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: effectivePreferences.spacing === 'expanded' ? 20 : 12,
              padding: effectivePreferences.spacing === 'expanded' ? 20 : 12,
              backgroundColor: theme.colors.surface,
              borderRadius: 8,
            }}
            accessibilityElementsHidden
          >
            <View style={{ flex: 1, height: 4, backgroundColor: theme.colors.primary, borderRadius: 2 }} />
            <View style={{ flex: 1, height: 4, backgroundColor: theme.colors.border, borderRadius: 2 }} />
            <View style={{ flex: 1, height: 4, backgroundColor: theme.colors.primary, borderRadius: 2 }} />
          </View>
        </View>
      )}

      {step === 4 && (
        <View style={{ gap: spacing.lg }}>
          <View style={{ gap: spacing.md }}>
            <SelectionCard
              label="Básico"
              description="Mostra somente o essencial. Recomendado para uma experiência mais direta."
              selected={effectivePreferences.interfaceMode === 'basic'}
              onPress={() => handleSetInterfaceMode('basic')}
            />
            <SelectionCard
              label="Completo"
              description="Mostra todos os recursos, com mais detalhes e atalhos."
              selected={effectivePreferences.interfaceMode === 'complete'}
              onPress={() => handleSetInterfaceMode('complete')}
            />
          </View>
        </View>
      )}

      {step === 5 && (
        <View style={{ gap: spacing.lg }}>
          <SettingSwitchRow
            label="Feedback aprimorado"
            description="Mensagens mais detalhadas após ações."
            value={effectivePreferences.enhancedFeedback}
            onValueChange={(v) => updatePreference('enhancedFeedback', v)}
          />
          <SettingSwitchRow
            label="Confirmar ações críticas"
            description="Pedir confirmação antes de ações importantes."
            value={effectivePreferences.confirmCriticalActions}
            onValueChange={(v) => updatePreference('confirmCriticalActions', v)}
          />
          <SettingSwitchRow
            label="Reduzir movimento"
            description="Menos animações na tela."
            value={effectivePreferences.reduceMotion}
            onValueChange={(v) => updatePreference('reduceMotion', v)}
          />
          <SettingSwitchRow
            label="Lembretes ativos"
            description="Notificações de atividades e compromissos."
            value={effectivePreferences.remindersEnabled}
            onValueChange={(v) => updatePreference('remindersEnabled', v)}
          />
        </View>
      )}

      {step === 6 && (
        <View style={{ gap: spacing.lg }}>
          <PreferencesSummary preferences={effectivePreferences} />
          <ThemeText variant="caption" color={theme.colors.textMuted}>
            Você pode alterar estas preferências a qualquer momento nas configurações do aplicativo.
          </ThemeText>
        </View>
      )}
    </OnboardingLayout>
  )
}
