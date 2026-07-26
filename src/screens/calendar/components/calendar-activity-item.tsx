import { Pressable, StyleSheet, View } from 'react-native'
import { ThemeText } from '@/components/theme/theme-text'
import { useTheme } from '@/contexts/theme-context'
import {
  completedStepsCount,
  getCategoryLabel,
  getPriorityLabel,
  getStatusLabel,
} from '@/modules/activities/domain/activity-utils'
import type { Activity } from '@/modules/activities/domain/entities'
import { formatTime } from '@/shared/utils/date'

interface CalendarActivityItemProps {
  activity: Activity
  onPress: () => void
}

function formatActivityTime(activity: Activity): string {
  return activity.hasTime ? formatTime(activity.scheduledAt) : 'Sem horário'
}

export function CalendarActivityItem({ activity, onPress }: CalendarActivityItemProps) {
  const { colors, spacing, radius, contrast, reduceMotion } = useTheme()
  const isCompleted = activity.status === 'completed'
  const borderWidth = contrast === 'high' ? 2 : 1
  const progress = activity.steps.length > 0 ? `${completedStepsCount(activity.steps)}/${activity.steps.length} etapas` : null
  const accessibilityLabel = [
    activity.title,
    formatActivityTime(activity),
    getCategoryLabel(activity.category),
    getStatusLabel(activity.status),
    `Prioridade ${getPriorityLabel(activity.priority)}`,
    progress,
  ].filter(Boolean).join('. ')

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Abre os detalhes da atividade"
      hitSlop={6}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          borderWidth,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          gap: spacing.sm,
          opacity: isCompleted ? 0.72 : 1,
        },
        pressed && !reduceMotion && styles.pressed,
      ]}
    >
      <View style={[styles.mainRow, { gap: spacing.md }]}>
        <ThemeText
          variant="label"
          style={[styles.time, { color: activity.hasTime ? colors.primary : colors.textMuted }]}
        >
          {formatActivityTime(activity)}
        </ThemeText>

        <View style={styles.content}>
          <ThemeText variant="body" style={styles.title} numberOfLines={2}>
            {activity.title}
          </ThemeText>
          <View style={[styles.metaRow, { gap: spacing.xs }]}>
            {activity.category && (
              <ThemeText variant="caption" color={colors.textMuted} numberOfLines={1}>
                {getCategoryLabel(activity.category)}
              </ThemeText>
            )}
            <ThemeText variant="caption" color={isCompleted ? colors.success : colors.textMuted} numberOfLines={1}>
              {getStatusLabel(activity.status)}
            </ThemeText>
          </View>
        </View>
      </View>

      <View style={[styles.badgeRow, { gap: spacing.xs }]}>
        {activity.priority && (
          <View style={[styles.badge, { backgroundColor: colors.accentGoldSoft }]}>
            <ThemeText variant="caption" color={colors.accentGold}>
              {getPriorityLabel(activity.priority)}
            </ThemeText>
          </View>
        )}
        {progress && (
          <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
            <ThemeText variant="caption" color={colors.primary}>
              {progress}
            </ThemeText>
          </View>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  time: {
    width: 84,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 90,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pressed: {
    opacity: 0.85,
  },
})
