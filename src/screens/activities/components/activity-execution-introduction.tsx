import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { formatDate, formatTime } from '@/modules/activities/domain/activity-utils'
import type { Activity } from '@/modules/activities/domain/entities'

interface ActivityExecutionIntroductionProps {
  activity: Activity
  onStart: () => void
  isProcessing: boolean
}

export function ActivityExecutionIntroduction({ activity, onStart, isProcessing }: ActivityExecutionIntroductionProps) {
  const { colors, spacing } = useTheme()
  const stepsCount = activity.steps.length

  return (
    <View style={{ flex: 1, gap: spacing.xl, padding: spacing.xl }}>
      <View style={{ gap: spacing.md }}>
        <ThemeText variant="display">{activity.title}</ThemeText>
        {activity.description && (
          <ThemeText variant="body" style={{ color: colors.textMuted }}>{activity.description}</ThemeText>
        )}
      </View>

      <View style={{ gap: spacing.sm }}>
        <ThemeText variant="subtitle">Sobre esta atividade</ThemeText>
        <View style={{ gap: spacing.xs }}>
          <ThemeText variant="body">
            {stepsCount === 1 ? '1 etapa' : `${stepsCount} etapas`}
          </ThemeText>
          {activity.hasTime && (
            <ThemeText variant="body" style={{ color: colors.textMuted }}>
              {formatDate(activity.scheduledAt)} às {formatTime(activity.scheduledAt)}
            </ThemeText>
          )}
          {!activity.hasTime && (
            <ThemeText variant="body" style={{ color: colors.textMuted }}>
              {formatDate(activity.scheduledAt)} (sem horário)
            </ThemeText>
          )}
        </View>
      </View>

      <ThemeText variant="body" style={{ color: colors.textMuted }}>
        Vamos realizar esta atividade uma etapa de cada vez.
      </ThemeText>

      <View style={{ flex: 1 }} />

      <AppButton
        title="Começar"
        onPress={onStart}
        variant="primary"
        loading={isProcessing}
        disabled={isProcessing}
        accessibilityHint="Inicia a atividade e abre a primeira etapa"
      />
    </View>
  )
}
