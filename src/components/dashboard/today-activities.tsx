import { View, StyleSheet, Platform, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { ThemeView } from '@/components/theme/theme-view'
import type { Activity } from '@/modules/activities/domain/entities'
import { getCategoryLabel, getStatusLabel, completedStepsCount, formatTime } from '@/modules/activities/domain/activity-utils'

interface TodayActivitiesProps {
  activities: Activity[]
  maxItems: number
}

export function TodayActivities({ activities, maxItems }: TodayActivitiesProps) {
  const { colors, spacing, radius, shadows } = useTheme()
  const router = useRouter()

  const nav = (href: string) => router.push(href as any)

  if (activities.length === 0) return null

  const displayItems = activities.slice(0, maxItems)

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemeText variant="subtitle" style={{ color: colors.text }}>
          Atividades de hoje
        </ThemeText>
        <Pressable
          onPress={() => nav('/atividades')}
          accessibilityRole="button"
          accessibilityLabel="Ver todas as atividades"
          accessibilityHint="Abre a lista completa de atividades"
          hitSlop={8}
        >
          <ThemeText variant="link" style={{ color: colors.primary }}>
            Ver todas
          </ThemeText>
        </Pressable>
      </View>

      <View style={{ gap: spacing.sm }}>
        {displayItems.map((activity) => {
          const stepsCount = activity.steps.length
          const completedSteps = completedStepsCount(activity.steps)
          const statusLabel = getStatusLabel(activity.status)

          return (
            <ThemeView
              key={activity.id}
              surface
              style={[
                styles.item,
                {
                  padding: spacing.md,
                  borderRadius: radius.md,
                  borderColor: colors.border,
                  ...Platform.select({ web: shadows.sm, default: shadows.sm }),
                },
              ]}
              accessibilityLabel={`Atividade: ${activity.title}, ${statusLabel}`}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
                <View style={{ minWidth: 50 }}>
                  <ThemeText variant="caption" style={{ color: colors.textMuted }}>
                    {activity.hasTime ? formatTime(activity.scheduledAt) : 'Sem horário'}
                  </ThemeText>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ThemeText
                      variant="body"
                      style={{
                        color: colors.text,
                        textDecorationLine: activity.status === 'completed' ? 'line-through' : 'none',
                      }}
                    >
                      {activity.title}
                    </ThemeText>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 }}>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.primaryVerySoft }]}>
                      <ThemeText variant="caption" style={[styles.categoryText, { color: colors.primaryDark }]}>
                        {getCategoryLabel(activity.category)}
                      </ThemeText>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            activity.status === 'completed'
                              ? colors.successLight
                              : activity.status === 'inProgress'
                                ? colors.warningLight
                                : colors.surfaceMuted,
                        },
                      ]}
                    >
                      <ThemeText
                        variant="caption"
                        style={[
                          styles.statusText,
                          {
                            color:
                              activity.status === 'completed'
                                ? colors.success
                                : activity.status === 'inProgress'
                                  ? colors.warning
                                  : colors.textMuted,
                          },
                        ]}
                      >
                        {statusLabel}
                      </ThemeText>
                    </View>
                  </View>

                  {stepsCount > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Ionicons name="checkmark-circle-outline" size={12} color={colors.textMuted} />
                      <ThemeText variant="caption" style={{ color: colors.textMuted }}>
                        {completedSteps}/{stepsCount} etapas
                      </ThemeText>
                    </View>
                  )}
                </View>
              </View>
            </ThemeView>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    borderWidth: 1,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: '500',
  },
})
