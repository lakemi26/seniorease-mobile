import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, ScrollView, StyleSheet, BackHandler, AccessibilityInfo, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/contexts/theme-context'
import { usePreferences } from '@/contexts/preferences-context'
import { ThemeText } from '@/components/theme/theme-text'
import { ThemeView } from '@/components/theme/theme-view'
import { AppButton } from '@/components/ui/app-button'
import { SelectionCard } from '@/components/onboarding/selection-card'
import { SettingSwitchRow } from '@/components/onboarding/setting-switch-row'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { ErrorMessage } from '@/components/ui/error-message'
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '@/modules/authentication/domain/entities'
import { SettingsActionFooter } from '@/screens/settings/settings-action-footer'
import { UnsavedChangesDialog } from '@/screens/settings/unsaved-changes-dialog'
import { RestoreDialog } from '@/screens/settings/restore-dialog'
import { Ionicons } from '@expo/vector-icons'

export default function ConfiguracoesScreen() {
  const { preferences, effectivePreferences, isLoading, isPreviewing, applyDraft, clearDraft, saveDraftAndClear } = usePreferences()
  const { colors, spacing, radius, fontSizeMultiplier } = useTheme()
  const router = useRouter()
  const { width: screenWidth } = useWindowDimensions()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)

  const ongoingSaveRef = useRef(false)
  const savedFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSavedFeedbackTimer = useCallback(() => {
    if (savedFeedbackTimerRef.current) {
      clearTimeout(savedFeedbackTimerRef.current)
      savedFeedbackTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearSavedFeedbackTimer()
    }
  }, [clearSavedFeedbackTimer])

  const isNarrow = screenWidth < 380 || fontSizeMultiplier > 1.15

  useEffect(() => {
    if (!isLoading && !isPreviewing) {
      applyDraft(preferences)
    }
  }, [isLoading])

  const hasUnsavedChanges = useMemo(() => {
    if (!isPreviewing) return false
    return (
      effectivePreferences.fontSize !== preferences.fontSize ||
      effectivePreferences.contrast !== preferences.contrast ||
      effectivePreferences.spacing !== preferences.spacing ||
      effectivePreferences.interfaceMode !== preferences.interfaceMode ||
      effectivePreferences.enhancedFeedback !== preferences.enhancedFeedback ||
      effectivePreferences.confirmCriticalActions !== preferences.confirmCriticalActions ||
      effectivePreferences.reduceMotion !== preferences.reduceMotion ||
      effectivePreferences.remindersEnabled !== preferences.remindersEnabled
    )
  }, [isPreviewing, effectivePreferences, preferences])

  const updateDraft = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    applyDraft({ ...effectivePreferences, [key]: value })
  }, [effectivePreferences, applyDraft])

  useEffect(() => {
    if (!hasUnsavedChanges) return
    const onBackPress = () => {
      setShowUnsavedDialog(true)
      return true
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress)
    return () => sub.remove()
  }, [hasUnsavedChanges])

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true)
      return
    }
    clearDraft()
    router.back()
  }, [hasUnsavedChanges, clearDraft, router])

  const handleDiscard = useCallback(() => {
    clearDraft()
    setShowUnsavedDialog(false)
    router.back()
  }, [clearDraft, router])

  const handleSave = useCallback(async () => {
    if (ongoingSaveRef.current) return
    setError(null)
    setSaving(true)
    ongoingSaveRef.current = true
    try {
      await saveDraftAndClear()
      clearSavedFeedbackTimer()
      setShowSavedFeedback(true)
      AccessibilityInfo.announceForAccessibility('Configurações salvas com sucesso.')
      savedFeedbackTimerRef.current = setTimeout(() => {
        setShowSavedFeedback(false)
        savedFeedbackTimerRef.current = null
      }, 3000)
    } catch {
      setError('Não foi possível salvar suas configurações. Verifique sua conexão e tente novamente.')
    } finally {
      setSaving(false)
      ongoingSaveRef.current = false
    }
  }, [clearSavedFeedbackTimer, saveDraftAndClear])

  const handleRestore = useCallback(() => {
    applyDraft(DEFAULT_USER_PREFERENCES)
    setShowRestoreDialog(false)
    AccessibilityInfo.announceForAccessibility('Preferências restauradas para o padrão. Salve as alterações para confirmar.')
  }, [applyDraft])

  if (isLoading) {
    return <LoadingScreen message="Carregando configurações..." />
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.flex}>
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              backgroundColor: colors.surface,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
              gap: spacing.xs,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <AppButton
              title="Voltar"
              onPress={handleBack}
              variant="ghost"
              fullWidth={false}
              accessibilityLabel="Voltar"
              accessibilityHint="Retorna para a tela anterior"
            />
            <ThemeText variant="title" style={{ color: colors.text }}>
              Configurações
            </ThemeText>
          </View>
          <ThemeText variant="caption" color={colors.textMuted} style={{ paddingLeft: spacing.sm + 2 }}>
            Ajuste o SeniorEase para ficar mais confortável para você.
          </ThemeText>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xxxl,
            gap: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <ErrorMessage message={error} onRetry={handleSave} />
          ) : null}

          {showSavedFeedback ? (
            <View
              style={[
                styles.successBanner,
                {
                  backgroundColor: colors.successLight,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  borderColor: colors.success,
                  borderWidth: 1,
                },
              ]}
              accessibilityRole="alert"
              accessibilityLabel="Configurações salvas"
            >
              <ThemeText variant="body" color={colors.success}>
                Configurações salvas.
              </ThemeText>
            </View>
          ) : null}

          <View style={{ gap: spacing.md }}>
            <ThemeText variant="subtitle" style={{ color: colors.text }}>
              Aparência
            </ThemeText>
            <ThemeText variant="caption" color={colors.textMuted}>
              Ajuste como textos, cores e espaços aparecem na tela.
            </ThemeText>
          </View>

          <ThemeView surface style={[styles.card, { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md }]}>
            <View style={{ gap: spacing.xs }}>
              <ThemeText variant="body" style={{ color: colors.text }}>
                Tamanho do texto
              </ThemeText>
              <ThemeText variant="caption" color={colors.textMuted}>
                Escolha o tamanho que fica mais confortável para leitura.
              </ThemeText>
            </View>
            <View style={{ gap: spacing.sm }}>
              <SelectionCard
                label="Normal"
                description="Tamanho padrão de texto"
                selected={effectivePreferences.fontSize === 'normal'}
                onPress={() => updateDraft('fontSize', 'normal')}
              />
              <SelectionCard
                label="Grande"
                description="Texto ampliado para leitura mais fácil"
                selected={effectivePreferences.fontSize === 'large'}
                onPress={() => updateDraft('fontSize', 'large')}
              />
              <SelectionCard
                label="Extra grande"
                description="Texto bem grande para leitura confortável"
                selected={effectivePreferences.fontSize === 'extraLarge'}
                onPress={() => updateDraft('fontSize', 'extraLarge')}
              />
            </View>
          </ThemeView>

          <ThemeView surface style={[styles.card, { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md }]}>
            <View style={{ gap: spacing.xs }}>
              <ThemeText variant="body" style={{ color: colors.text }}>
                Contraste da tela
              </ThemeText>
              <ThemeText variant="caption" color={colors.textMuted}>
                Escolha a combinação de cores mais confortável.
              </ThemeText>
            </View>
            <View style={{ gap: spacing.sm }}>
              <SelectionCard
                label="Padrão"
                description="Cores claras e suaves."
                selected={effectivePreferences.contrast === 'default'}
                onPress={() => updateDraft('contrast', 'default')}
              />
              <SelectionCard
                label="Alto contraste"
                description="Bordas fortes e maior diferença entre texto e fundo."
                selected={effectivePreferences.contrast === 'high'}
                onPress={() => updateDraft('contrast', 'high')}
              />
              <SelectionCard
                label="Escuro"
                description="Fundo azul-noturno para reduzir a claridade."
                selected={effectivePreferences.contrast === 'dark'}
                onPress={() => updateDraft('contrast', 'dark')}
              />
            </View>
          </ThemeView>

          <ThemeView surface style={[styles.card, { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md }]}>
            <View style={{ gap: spacing.xs }}>
              <ThemeText variant="body" style={{ color: colors.text }}>
                Espaçamento entre elementos
              </ThemeText>
              <ThemeText variant="caption" color={colors.textMuted}>
                Um espaço maior pode facilitar a leitura e o toque nos controles.
              </ThemeText>
            </View>
            <View style={[isNarrow ? styles.column : styles.row, { gap: spacing.sm }]}>
              <View style={isNarrow ? styles.full : { flex: 1 }}>
                <SelectionCard
                  label="Normal"
                  description="Espaços padrão."
                  selected={effectivePreferences.spacing === 'normal'}
                  onPress={() => updateDraft('spacing', 'normal')}
                />
              </View>
              <View style={isNarrow ? styles.full : { flex: 1 }}>
                <SelectionCard
                  label="Ampliado"
                  description="Mais espaço entre blocos e controles."
                  selected={effectivePreferences.spacing === 'expanded'}
                  onPress={() => updateDraft('spacing', 'expanded')}
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: effectivePreferences.spacing === 'expanded' ? 20 : 10,
                paddingVertical: effectivePreferences.spacing === 'expanded' ? spacing.md : spacing.sm,
                paddingHorizontal: spacing.sm,
              }}
              accessibilityElementsHidden
            >
              <View style={{ flex: 1, height: 6, backgroundColor: colors.primary, borderRadius: 3 }} />
              <View style={{ flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3 }} />
            </View>
          </ThemeView>

          <View style={{ gap: spacing.md }}>
            <ThemeText variant="subtitle" style={{ color: colors.text }}>
              Quantidade de informações
            </ThemeText>
            <ThemeText variant="caption" color={colors.textMuted}>
              Escolha uma interface mais simples ou com todos os recursos.
            </ThemeText>
          </View>

          <ThemeView surface style={[styles.card, { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md }]}>
            <View style={[isNarrow ? styles.column : styles.row, { gap: spacing.sm }]}>
              <View style={isNarrow ? styles.full : { flex: 1 }}>
                <SelectionCard
                  label="Básico"
                  description="Mostra somente as informações e ações mais importantes."
                  selected={effectivePreferences.interfaceMode === 'basic'}
                  onPress={() => updateDraft('interfaceMode', 'basic')}
                />
              </View>
              <View style={isNarrow ? styles.full : { flex: 1 }}>
                <SelectionCard
                  label="Completo"
                  description="Mostra recursos adicionais, atalhos e informações detalhadas."
                  selected={effectivePreferences.interfaceMode === 'complete'}
                  onPress={() => updateDraft('interfaceMode', 'complete')}
                />
              </View>
            </View>
          </ThemeView>

          <View style={{ gap: spacing.md }}>
            <ThemeText variant="subtitle" style={{ color: colors.text }}>
              Segurança e feedback
            </ThemeText>
          </View>

          <ThemeView surface style={[styles.card, { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: 0 }]}>
            <SettingSwitchRow
              label="Feedback aprimorado"
              description="Mostra mensagens mais detalhadas depois das ações."
              value={effectivePreferences.enhancedFeedback}
              onValueChange={(v) => updateDraft('enhancedFeedback', v)}
            />
            <SettingSwitchRow
              label="Confirmar ações críticas"
              description="Pede confirmação antes de excluir ou concluir ações importantes."
              value={effectivePreferences.confirmCriticalActions}
              onValueChange={(v) => updateDraft('confirmCriticalActions', v)}
            />
            <SettingSwitchRow
              label="Reduzir movimento"
              description="Diminui animações e transições na interface."
              value={effectivePreferences.reduceMotion}
              onValueChange={(v) => updateDraft('reduceMotion', v)}
            />
          </ThemeView>

          <View style={{ gap: spacing.md }}>
            <ThemeText variant="subtitle" style={{ color: colors.text }}>
              Lembretes
            </ThemeText>
          </View>

          <ThemeView surface style={[styles.card, { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: 0 }]}>
            <SettingSwitchRow
              label="Lembretes ativos"
              description="Receba avisos sobre atividades e compromissos."
              value={effectivePreferences.remindersEnabled}
              onValueChange={(v) => updateDraft('remindersEnabled', v)}
            />
          </ThemeView>

          <View style={{ gap: spacing.md }}>
            <ThemeText variant="subtitle" style={{ color: colors.text }}>
              Restaurar configurações
            </ThemeText>
            <ThemeText variant="caption" color={colors.textMuted}>
              Retorne às preferências iniciais do SeniorEase.
            </ThemeText>
          </View>

          <View>
            <AppButton
              title="Restaurar preferências padrão"
              onPress={() => setShowRestoreDialog(true)}
              variant="outline"
              fullWidth
              accessibilityLabel="Restaurar preferências padrão"
              accessibilityHint="Abre uma confirmação para restaurar as configurações originais"
            />
          </View>
        </ScrollView>

        <SettingsActionFooter
          hasUnsavedChanges={hasUnsavedChanges}
          saving={saving}
          onDiscard={handleDiscard}
          onSave={handleSave}
        />
      </View>

      <UnsavedChangesDialog
        visible={showUnsavedDialog}
        onContinueEditing={() => setShowUnsavedDialog(false)}
        onDiscard={handleDiscard}
      />

      <RestoreDialog
        visible={showRestoreDialog}
        onCancel={() => setShowRestoreDialog(false)}
        onRestore={handleRestore}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  full: {
    width: '100%',
  },
  card: {},
  header: {},
  successBanner: {},
})
