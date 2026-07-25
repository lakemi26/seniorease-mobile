import { View, StyleSheet, Platform, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import type { Activity } from '@/modules/activities/domain/entities'
import { getCategoryLabel, getPriorityLabel, completedStepsCount, formatDate, formatTime } from '@/modules/activities/domain/activity-utils'

interface NextActivityCardProps {
  activity: Activity | null
}

export function NextActivityCard({ activity }: NextActivityCardProps) {
  const { colors, spacing, radius, shadows } = useTheme()
  const router = useRouter()

  const nav = (href: string) => router.push(href as any)

  if (!activity) {
    return (
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
        <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="calendar-outline" size={24} color={colors.primary} />
        </View>
        <View style={{ marginTop: spacing.md }}>
          <ThemeText variant="subtitle" style={{ color: colors.text }}>
            Você não possui atividades próximas.
          </ThemeText>
        </View>
        <View style={{ marginTop: spacing.sm }}>
          <ThemeText variant="body" style={{ color: colors.textMuted }}>
            Adicione uma atividade para organizar seus próximos compromissos.
          </ThemeText>
        </View>
        <View style={{ marginTop: spacing.lg }}>
          <Pressable
            onPress={() => nav('/atividades/nova')}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                paddingVertical: 14,
                paddingHorizontal: spacing.xl,
                borderRadius: radius.md,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Adicionar nova atividade"
          >
            <ThemeText variant="body" style={{ color: colors.surface, fontWeight: '600' }}>
              Adicionar atividade
            </ThemeText>
          </Pressable>
        </View>
      </ThemeView>
    )
  }

  const stepsCount = activity.steps.length
  const completedSteps = completedStepsCount(activity.steps)
  const progress = stepsCount > 0 ? completedSteps / stepsCount : 0

  return (
    <ThemeView
      surface
      style={[
        styles.card,
        styles.featuredCard,
        {
          padding: spacing.lg,
          borderRadius: radius.lg,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
          borderColor: colors.border,
          ...Platform.select({ web: shadows.md, default: shadows.md }),
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel={`Próxima atividade: ${activity.title}`}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <ThemeText variant="subtitle" style={{ flex: 1, color: colors.text }}>
          {activity.title}
        </ThemeText>
        {activity.priority === 'high' && (
          <View style={[styles.priorityBadge, { backgroundColor: colors.dangerLight }]}>
            <ThemeText variant="caption" style={[styles.priorityText, { color: colors.danger }]}>
              {getPriorityLabel(activity.priority)}
            </ThemeText>
          </View>
        )}
      </View>

      <View style={[styles.categoryRow, { marginTop: spacing.sm }]}>
        <View style={[styles.categoryDot, { backgroundColor: colors.primary }]} />
        <ThemeText variant="caption" style={{ color: colors.textMuted }}>
          {getCategoryLabel(activity.category)}
        </ThemeText>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <ThemeText variant="caption" style={{ color: colors.textMuted }}>
            {formatDate(activity.scheduledAt)}
          </ThemeText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <ThemeText variant="caption" style={{ color: colors.textMuted }}>
            {activity.hasTime ? formatTime(activity.scheduledAt) : 'Sem horário definido'}
          </ThemeText>
        </View>
      </View>

      {stepsCount > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <ThemeText variant="caption" style={{ color: colors.textMuted }}>
              Progresso
            </ThemeText>
            <ThemeText variant="caption" style={{ color: colors.primary }}>
              {completedSteps}/{stepsCount}
            </ThemeText>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.surfaceMuted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>
      )}

      <View style={{ marginTop: spacing.lg }}>
        <Pressable
          onPress={() => {
            try {
              nav(`/atividades/${activity.id}`)
            } catch {
              nav('/atividades')
            }
          }}
          style={({ pressed }) => [
            {
              backgroundColor: colors.primary,
              paddingVertical: 14,
              paddingHorizontal: spacing.xl,
              borderRadius: radius.md,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            activity.status === 'inProgress'
              ? `Continuar atividade ${activity.title}`
              : `Ver atividade ${activity.title}`
          }
        >
          <ThemeText variant="body" style={{ color: colors.surface, fontWeight: '600' }}>
            {activity.status === 'inProgress' ? 'Continuar' : 'Ver atividade'}
          </ThemeText>
        </Pressable>
      </View>
    </ThemeView>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  featuredCard: {
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
})
