import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { useRouter } from 'expo-router'
import { useActivityHistory } from '@/screens/activities/hook/use-activity-history'
import { completedStepsCount, formatDate, formatTime, getCategoryLabel } from '@/modules/activities/domain/activity-utils'
import type { Activity } from '@/modules/activities/domain/entities'

function formatCompletedAt(activity: Activity): string {
  if (!activity.completedAt) return 'Conclusão não informada'
  return `Concluída em ${formatDate(activity.completedAt)}`
}

function HistoryItem({ activity, onPress }: { activity: Activity; onPress: () => void }) {
  const { colors, spacing, radius, shadows } = useTheme()
  const stepsCount = activity.steps.length
  const completedCount = completedStepsCount(activity.steps)

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${activity.title}, ${getCategoryLabel(activity.category)}, concluída`}
      accessibilityHint="Abre os detalhes da atividade concluída"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
          opacity: pressed ? 0.85 : 1,
          ...shadows.sm,
        },
      ]}
    >
      <View style={{ gap: spacing.sm }}>
        <View style={[styles.cardHeader, { gap: spacing.md }]}> 
          <ThemeText variant="subtitle" style={{ flex: 1, color: colors.text }} numberOfLines={2}>
            {activity.title}
          </ThemeText>
          <View style={[styles.badge, { backgroundColor: colors.successLight }]}> 
            <ThemeText variant="caption" style={{ color: colors.success, fontWeight: '700' }}>
              Concluída
            </ThemeText>
          </View>
        </View>

        <ThemeText variant="caption" style={{ color: colors.textMuted }}>
          {getCategoryLabel(activity.category)} · {activity.hasTime ? formatTime(activity.scheduledAt) : formatDate(activity.scheduledAt)}
        </ThemeText>
        <ThemeText variant="caption" style={{ color: colors.textMuted }}>
          {formatCompletedAt(activity)}
        </ThemeText>
        {stepsCount > 0 ? (
          <ThemeText variant="caption" style={{ color: colors.textMuted }}>
            {completedCount}/{stepsCount} etapas concluídas
          </ThemeText>
        ) : null}
      </View>
    </Pressable>
  )
}

export default function HistoricoScreen() {
  const { colors, spacing } = useTheme()
  const router = useRouter()
  const { activities, isLoading, isLoadingMore, error, hasMore, loadMore, refresh } = useActivityHistory()

  return (
    <ThemeView style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md }}>
        <AppButton title="Voltar" onPress={() => router.back()} variant="ghost" />
        <ThemeText variant="title" style={{ color: colors.text }}>Histórico</ThemeText>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <ThemeText variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>
            Carregando histórico...
          </ThemeText>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md }}>
          <ThemeText variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>
            Não foi possível carregar o histórico.
          </ThemeText>
          <AppButton title="Tentar novamente" onPress={refresh} variant="outline" />
        </View>
      ) : activities.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <ThemeText variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>
            Nenhuma atividade concluída ainda.
          </ThemeText>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          <ThemeText variant="body" style={{ color: colors.textMuted }}>
            {activities.length} atividades concluídas carregadas.
          </ThemeText>
          {activities.map((activity) => (
            <HistoryItem
              key={activity.id}
              activity={activity}
              onPress={() => router.push(`/atividades/${activity.id}` as any)}
            />
          ))}
          {hasMore ? (
            <AppButton
              title="Carregar mais"
              onPress={loadMore}
              loading={isLoadingMore}
              disabled={isLoadingMore}
              variant="outline"
            />
          ) : null}
        </ScrollView>
      )}
    </ThemeView>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
})
