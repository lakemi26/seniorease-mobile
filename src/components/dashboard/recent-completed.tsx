import { View, StyleSheet, Platform, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { ThemeView } from '@/components/theme/theme-view'
import type { Activity } from '@/modules/activities/domain/entities'
import { getCategoryLabel, formatDate, formatTime } from '@/modules/activities/domain/activity-utils'

interface RecentCompletedProps {
  activities: Activity[]
  maxItems: number
}

export function RecentCompleted({ activities, maxItems }: RecentCompletedProps) {
  const { colors, spacing, radius, shadows } = useTheme()
  const router = useRouter()

  const nav = (href: string) => router.push(href as any)

  if (activities.length === 0) return null

  const displayItems = activities.slice(0, maxItems)

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemeText variant="subtitle" style={{ color: colors.text }}>
          Concluídas recentemente
        </ThemeText>
        <Pressable
          onPress={() => nav('/historico')}
          accessibilityRole="button"
          accessibilityLabel="Ver histórico completo"
          accessibilityHint="Abre o histórico de atividades concluídas"
          hitSlop={8}
        >
          <ThemeText variant="link" style={{ color: colors.primary }}>
            Ver histórico completo
          </ThemeText>
        </Pressable>
      </View>

      <View style={{ gap: spacing.sm }}>
        {displayItems.map((activity) => (
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
            accessibilityLabel={`Concluída: ${activity.title}`}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
              <View style={[styles.completedIcon, { backgroundColor: colors.successLight }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemeText variant="body" style={{ color: colors.text }}>
                  {activity.title}
                </ThemeText>
                <ThemeText variant="caption" style={{ color: colors.textMuted, marginTop: 2 }}>
                  {getCategoryLabel(activity.category)} · {activity.hasTime ? formatTime(activity.scheduledAt) : formatDate(activity.scheduledAt)}
                </ThemeText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.successLight }]}>
                <ThemeText variant="caption" style={[styles.statusText, { color: colors.success }]}>
                  Concluída
                </ThemeText>
              </View>
            </View>
          </ThemeView>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    borderWidth: 1,
  },
  completedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
