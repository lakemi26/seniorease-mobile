import { View, StyleSheet, Platform } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { ThemeView } from '@/components/theme/theme-view'
import type { WeeklySummary } from '@/modules/activities/domain/entities'

interface WeeklySummaryProps {
  summary: WeeklySummary
}

export function WeeklySummaryCard({ summary }: WeeklySummaryProps) {
  const { colors, spacing, radius, shadows } = useTheme()

  const total = Math.max(summary.total, 1)
  const completedPct = (summary.completed / total) * 100
  const pendingPct = (summary.pending / total) * 100
  const inProgressPct = (summary.inProgress / total) * 100

  return (
    <View style={{ gap: spacing.md }}>
      <ThemeText variant="subtitle" style={{ color: colors.text }}>
        Resumo da semana
      </ThemeText>

      <ThemeView
        surface
        style={[
          styles.card,
          {
            padding: spacing.lg,
            borderRadius: radius.lg,
            borderColor: colors.border,
            ...Platform.select({ web: shadows.sm, default: shadows.sm }),
          },
        ]}
      >
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <ThemeText variant="title" style={{ color: colors.success }}>
              {summary.completed}
            </ThemeText>
            <ThemeText variant="caption" style={{ color: colors.textMuted }}>
              Concluídas
            </ThemeText>
          </View>
          <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <ThemeText variant="title" style={{ color: colors.warning }}>
              {summary.pending}
            </ThemeText>
            <ThemeText variant="caption" style={{ color: colors.textMuted }}>
              Pendentes
            </ThemeText>
          </View>
          <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <ThemeText variant="title" style={{ color: colors.info }}>
              {summary.inProgress}
            </ThemeText>
            <ThemeText variant="caption" style={{ color: colors.textMuted }}>
              Em andamento
            </ThemeText>
          </View>
        </View>

        {summary.total > 0 && (
          <View style={[styles.progressBar, { backgroundColor: colors.surfaceMuted, marginTop: spacing.md }]}>
            {completedPct > 0 && (
              <View style={[styles.segment, { width: `${completedPct}%`, backgroundColor: colors.success }]} />
            )}
            {inProgressPct > 0 && (
              <View style={[styles.segment, { width: `${inProgressPct}%`, backgroundColor: colors.info }]} />
            )}
            {pendingPct > 0 && (
              <View style={[styles.segment, { width: `${pendingPct}%`, backgroundColor: colors.warning }]} />
            )}
          </View>
        )}
      </ThemeView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
})
