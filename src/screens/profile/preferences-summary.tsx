import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/contexts/theme-context'
import { usePreferences } from '@/contexts/preferences-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { ProfileActionRow } from './profile-action-row'

const FONT_SIZE_LABELS: Record<string, string> = {
  normal: 'Normal',
  large: 'Grande',
  extraLarge: 'Extra grande',
}

const CONTRAST_LABELS: Record<string, string> = {
  default: 'Padrão',
  high: 'Alto contraste',
  dark: 'Escuro',
}

const SPACING_LABELS: Record<string, string> = {
  normal: 'Normal',
  expanded: 'Ampliado',
}

const INTERFACE_LABELS: Record<string, string> = {
  basic: 'Modo básico',
  complete: 'Modo completo',
}

export function PreferencesSummary() {
  const { colors, spacing } = useTheme()
  const { effectivePreferences, isLoading } = usePreferences()
  const router = useRouter()

  if (isLoading) return null

  const prefs = effectivePreferences
  const isComplete = prefs.interfaceMode === 'complete'

  return (
    <View style={{ gap: spacing.sm }}>
      <ProfileActionRow
        label="Tamanho do texto"
        value={FONT_SIZE_LABELS[prefs.fontSize] ?? prefs.fontSize}
      />
      <ProfileActionRow
        label="Contraste"
        value={CONTRAST_LABELS[prefs.contrast] ?? prefs.contrast}
      />
      <ProfileActionRow
        label="Espaçamento"
        value={SPACING_LABELS[prefs.spacing] ?? prefs.spacing}
      />
      <ProfileActionRow
        label="Modo da interface"
        value={INTERFACE_LABELS[prefs.interfaceMode] ?? prefs.interfaceMode}
      />
      {isComplete ? (
        <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
          <ThemeText variant="caption" color={colors.textMuted}>
            {prefs.enhancedFeedback ? 'Feedback aprimorado ativo. ' : ''}
            {prefs.confirmCriticalActions ? 'Confirmação de ações críticas ativa. ' : ''}
            {prefs.reduceMotion ? 'Movimento reduzido. ' : ''}
            {prefs.remindersEnabled ? 'Lembretes ativos.' : ''}
          </ThemeText>
        </View>
      ) : null}
      <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
        <AppButton
          title="Abrir configurações"
          onPress={() => router.push('/configuracoes')}
          variant="outline"
          fullWidth
          accessibilityLabel="Abrir configurações de acessibilidade e aparência"
          accessibilityHint="Navega para a tela de configurações"
        />
      </View>
    </View>
  )
}
