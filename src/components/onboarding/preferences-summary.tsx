import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { ThemeView } from '@/components/theme/theme-view'
import { radius as radiusTokens } from '@/shared/theme/radius'
import type { UserPreferences } from '@/modules/authentication/domain/entities'

interface PreferencesSummaryProps {
  preferences: UserPreferences
}

const labels: Record<string, Record<string, string>> = {
  fontSize: { normal: 'Normal', large:'Grande', extraLarge:'Extra grande' },
  contrast: { default:'Padrão', high:'Alto contraste', dark:'Escuro' },
  spacing: { normal:'Normal', expanded:'Expandido' },
  interfaceMode: { basic:'Básico', complete:'Completo' },
}

export function PreferencesSummary({ preferences }: PreferencesSummaryProps) {
  const { colors, spacing } = useTheme()

  const items: { label: string; value: string }[] = [
    { label:'Tamanho do texto', value: labels.fontSize[preferences.fontSize] ?? preferences.fontSize },
    { label:'Contraste', value: labels.contrast[preferences.contrast] ?? preferences.contrast },
    { label:'Espaçamento', value: labels.spacing[preferences.spacing] ?? preferences.spacing },
    { label:'Modo da interface', value: labels.interfaceMode[preferences.interfaceMode] ?? preferences.interfaceMode },
    { label:'Feedback aprimorado', value: preferences.enhancedFeedback ? 'Sim' : 'Não' },
    { label:'Confirmar ações críticas', value: preferences.confirmCriticalActions ? 'Sim' : 'Não' },
    { label:'Reduzir movimento', value: preferences.reduceMotion ? 'Sim' : 'Não' },
    { label:'Lembretes ativos', value: preferences.remindersEnabled ? 'Sim' : 'Não' },
  ]

  return (
    <ThemeView surface style={[styles.card, { padding: spacing.md, borderRadius: radiusTokens.md, gap: spacing.md }]}>
      <ThemeText variant="bodyLarge">Suas escolhas</ThemeText>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.row, { gap: spacing.sm }]}
          accessibilityRole="text"
          accessibilityLabel={`${item.label}: ${item.value}`}
        >
          <ThemeText variant="body" style={styles.label}>{item.label}</ThemeText>
          <ThemeText variant="bodyLarge" color={colors.primaryDark}>{item.value}</ThemeText>
        </View>
      ))}
    </ThemeView>
  )
}

const styles = StyleSheet.create({
  card: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {},
})
