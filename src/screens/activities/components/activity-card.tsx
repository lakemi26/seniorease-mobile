import { useMemo } from 'react'
import { Pressable, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { radius } from '@/shared/theme/radius'
import { touchSize } from '@/shared/theme/spacing'
import { getStatusLabel, getPriorityLabel, getCategoryLabel, completedStepsCount } from '@/modules/activities/domain/activity-utils'
import type { Activity } from '@/modules/activities/domain/entities'

interface ActivityCardProps {
  activity: Activity
  onPress: () => void
  compact?: boolean
}

export function ActivityCard({ activity, onPress, compact = false }: ActivityCardProps) {
  const { colors, spacing } = useTheme()
  const progress = activity.steps.length > 0
    ? completedStepsCount(activity.steps)
    : null

  const priorityColors: Record<string, string> = useMemo(
    () => ({
      low: colors.success,
      medium: colors.warning,
      high: colors.danger,
    }),
    [colors],
  )

  const dateStr = useMemo(() => {
    const d = activity.scheduledAt
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    let result = `${day}/${month}/${year}`
    if (activity.hasTime) {
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      result += ` ${h}:${m}`
    }
    return result
  }, [activity])

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${activity.title}, ${getCategoryLabel(activity.category)}, ${getStatusLabel(activity.status)}, ${dateStr}`}
      accessibilityHint="Abre os detalhes da atividade"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding: spacing.lg,
          borderRadius: radius.lg,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.titleRow, { gap: spacing.sm }]}>
          <ThemeText variant="subtitle" style={styles.title} numberOfLines={2}>
            {activity.title}
          </ThemeText>
          {activity.reminder.enabled && (
            <ThemeText variant="caption" color={colors.info}>
              🔔
            </ThemeText>
          )}
        </View>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: priorityColors[activity.priority] + '20' },
          ]}
        >
          <ThemeText
            variant="caption"
            style={{ color: priorityColors[activity.priority] }}
          >
            {getPriorityLabel(activity.priority)}
          </ThemeText>
        </View>
      </View>

      <View style={[styles.meta, { gap: spacing.sm, marginTop: spacing.sm }]}>
        <ThemeText variant="caption">
          {getCategoryLabel(activity.category)}
        </ThemeText>
        <ThemeText variant="caption" color={colors.textMuted}>
          {dateStr}
        </ThemeText>
      </View>

      <View style={[styles.footer, { gap: spacing.sm, marginTop: spacing.sm }]}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <ThemeText variant="caption" color={colors.primary}>
            {getStatusLabel(activity.status)}
          </ThemeText>
        </View>

        {progress !== null && (
          <ThemeText variant="caption" color={colors.textMuted}>
            {progress}/{activity.steps.length} etapas
          </ThemeText>
        )}
      </View>

      {!compact && activity.description && (
        <ThemeText
          variant="body"
          color={colors.textMuted}
          numberOfLines={2}
          style={{ marginTop: spacing.sm }}
        >
          {activity.description}
        </ThemeText>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    minHeight: touchSize.min,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    flexShrink: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
})
