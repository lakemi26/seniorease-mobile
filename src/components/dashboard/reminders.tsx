import { View, StyleSheet, Platform, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { ThemeView } from '@/components/theme/theme-view'
import type { Activity } from '@/modules/activities/domain/entities'
import { getStatusLabel, getCategoryLabel } from '@/modules/activities/domain/activity-utils'

interface RemindersProps {
  reminders: Activity[]
  maxItems: number
}

export function Reminders({ reminders, maxItems }: RemindersProps) {
  const { colors, spacing, radius, shadows } = useTheme()
  const router = useRouter()

  const nav = (href: string) => router.push(href as any)

  if (reminders.length === 0) {
    return (
      <View style={{ gap: spacing.md }}>
        <ThemeText variant="subtitle" style={{ color: colors.text }}>
          Lembretes
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
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="notifications-off-outline" size={22} color={colors.primary} />
            </View>
            <ThemeText variant="body" style={{ color: colors.text, textAlign: 'center' }}>
              Nenhum lembrete agora.
            </ThemeText>
            <ThemeText variant="caption" style={{ color: colors.textMuted, textAlign: 'center' }}>
              Os lembretes das suas atividades aparecerão aqui.
            </ThemeText>
          </View>
        </ThemeView>
      </View>
    )
  }

  const displayItems = reminders.slice(0, maxItems)

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemeText variant="subtitle" style={{ color: colors.text }}>
          Lembretes
        </ThemeText>
        <Pressable
          onPress={() => nav('/notificacoes')}
          accessibilityRole="button"
          accessibilityLabel="Ver notificações"
          accessibilityHint="Abre a página de notificações"
          hitSlop={8}
        >
          <ThemeText variant="link" style={{ color: colors.primary }}>
            Ver notificações
          </ThemeText>
        </Pressable>
      </View>

      <View style={{ gap: spacing.sm }}>
        {displayItems.map((activity) => (
          <ThemeView
            key={activity.id}
            surface
            style={[
              styles.card,
              styles.reminderItem,
              {
                padding: spacing.md,
                borderRadius: radius.md,
                borderLeftWidth: 3,
                borderLeftColor: colors.accentGold,
                borderColor: colors.border,
                ...Platform.select({ web: shadows.sm, default: shadows.sm }),
              },
            ]}
            accessibilityLabel={`Lembrete: ${activity.title}`}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Ionicons name="notifications-outline" size={20} color={colors.accentGold} />
              <View style={{ flex: 1 }}>
                <ThemeText variant="body" style={{ color: colors.text }}>
                  {activity.title}
                </ThemeText>
                <ThemeText variant="caption" style={{ color: colors.textMuted }}>
                  {getCategoryLabel(activity.category)} · {getStatusLabel(activity.status)}
                </ThemeText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </ThemeView>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  reminderItem: {
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
