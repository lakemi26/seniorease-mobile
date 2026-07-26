import { useCallback, useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { useActivityDetails } from '@/screens/activities/hook/use-activity-details'
import { DeleteActivityDialog } from '@/screens/activities/components/delete-activity-dialog'
import { ReopenActivityDialog } from '@/screens/activities/components/reopen-activity-dialog'
import { getStatusLabel, getPriorityLabel, getCategoryLabel, completedStepsCount } from '@/modules/activities/domain/activity-utils'
import { createFirebaseActivityRepository } from '@/modules/activities/infrastructure/repositories/firebase-activity.repository'
import { createActivityUseCases } from '@/modules/activities/application/use-cases'
import type { Activity } from '@/modules/activities/domain/entities'

const repo = createFirebaseActivityRepository()
const useCases = createActivityUseCases(repo)

function DetailsContent({ activity }: { activity: Activity }) {
  const { colors, spacing } = useTheme()
  const progress = activity.steps.length > 0
    ? completedStepsCount(activity.steps)
    : null

  const dateStr = () => {
    const d = activity.scheduledAt
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    let s = `${day}/${month}/${year}`
    if (activity.hasTime) {
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      s += ` às ${h}:${m}`
    } else {
      s += ' (sem horário)'
    }
    return s
  }

  const reminderStr = () => {
    if (!activity.reminder.enabled || !activity.reminder.remindAt) return 'Nenhum'
    const r = activity.reminder.remindAt
    const day = String(r.getDate()).padStart(2, '0')
    const month = String(r.getMonth() + 1).padStart(2, '0')
    const year = r.getFullYear()
    const h = String(r.getHours()).padStart(2, '0')
    const m = String(r.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${h}:${m}`
  }

  return (
    <View style={{ gap: spacing.lg }}>
      <View>
        <ThemeText variant="title">{activity.title}</ThemeText>
        {activity.description && (
          <ThemeText variant="body" color="muted" style={{ marginTop: spacing.sm }}>
            {activity.description}
          </ThemeText>
        )}
      </View>

      <View style={[styles.infoGrid, { gap: spacing.md }]}>
        <InfoRow label="Status" value={getStatusLabel(activity.status)} />
        <InfoRow label="Categoria" value={getCategoryLabel(activity.category)} />
        <InfoRow label="Prioridade" value={getPriorityLabel(activity.priority)} />
        <InfoRow label="Data" value={dateStr()} />
        <InfoRow label="Lembrete" value={reminderStr()} />
      </View>

      {activity.steps.length > 0 && (
        <View style={{ gap: spacing.sm }}>
          <ThemeText variant="subtitle">
            Etapas {progress !== null && `(${progress}/${activity.steps.length})`}
          </ThemeText>
          {activity.steps.map((step, i) => (
            <View
              key={step.id}
              style={[
                styles.stepRow,
                {
                  gap: spacing.md,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: 8,
                },
              ]}
            >
              <ThemeText variant="body" color={step.completed ? colors.success : colors.textMuted}>
                {step.completed ? '✓' : `${i + 1}.`}
              </ThemeText>
              <ThemeText
                variant="body"
                color={step.completed ? colors.textMuted : colors.text}
                style={step.completed ? styles.completed : undefined}
              >
                {step.title}
              </ThemeText>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { spacing } = useTheme()
  return (
    <View style={[styles.infoRow, { gap: spacing.sm }]}>
      <ThemeText variant="label" style={styles.infoLabel}>{label}</ThemeText>
      <ThemeText variant="body">{value}</ThemeText>
    </View>
  )
}

export default function ActivityDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { spacing, confirmCriticalActions } = useTheme()
  const { user } = useAuth()
  const { activity, isLoading, error, remove } = useActivityDetails(id)
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [showReopenActivity, setShowReopenActivity] = useState(false)
  const [isReopening, setIsReopening] = useState(false)

  const handleEdit = useCallback(() => {
    router.push(`/atividades/${id}/editar` as any)
  }, [router, id])

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    const ok = await remove()
    if (ok) {
      router.replace('/atividades')
    } else {
      setIsDeleting(false)
      setShowDelete(false)
    }
  }, [remove, router])

  const handleStartActivity = useCallback(async () => {
    if (!id || !user?.uid || isStarting) return
    setIsStarting(true)
    try {
      await useCases.startActivity(id, user.uid)
      router.replace(`/atividades/${id}/executar` as any)
    } catch {
      setIsStarting(false)
    }
  }, [id, user, isStarting, router])

  const handleReopenActivity = useCallback(async () => {
    if (!id || !user?.uid || isReopening) return
    setIsReopening(true)
    try {
      await useCases.reopenActivity(id, user.uid)
      router.replace(`/atividades/${id}/executar` as any)
    } catch {
      setIsReopening(false)
      setShowReopenActivity(false)
    }
  }, [id, user, isReopening, router])

  if (isLoading) {
    return (
      <ThemeView style={[styles.centered, { padding: spacing.xl }]}>
        <ThemeText variant="body">Carregando…</ThemeText>
      </ThemeView>
    )
  }

  if (error || !activity) {
    return (
      <ThemeView style={[styles.centered, { padding: spacing.xl, gap: spacing.lg }]}>
        <ThemeText variant="title">Atividade não encontrada.</ThemeText>
        <ThemeText variant="body" color="muted">
          Ela pode ter sido removida ou não estar mais disponível.
        </ThemeText>
        <AppButton
          title="Voltar para atividades"
          onPress={() => router.replace('/atividades')}
          variant="primary"
        />
      </ThemeView>
    )
  }

  return (
    <ThemeView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxxl + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <DetailsContent activity={activity} />

        <View style={{ gap: spacing.md }}>
          {(activity.status === 'pending') && (
            <AppButton
              title="Iniciar atividade"
              onPress={handleStartActivity}
              variant="primary"
              loading={isStarting}
              disabled={isStarting}
            />
          )}
          {activity.status === 'inProgress' && (
            <AppButton
              title="Continuar atividade"
              onPress={() => router.push(`/atividades/${id}/executar` as any)}
              variant="primary"
            />
          )}
          {activity.status === 'completed' && (
            <AppButton
              title="Reabrir atividade"
              onPress={() => setShowReopenActivity(true)}
              variant="primary"
            />
          )}
          <AppButton
            title="Editar atividade"
            onPress={handleEdit}
            variant="outline"
          />
          <AppButton
            title="Excluir atividade"
            onPress={() => setShowDelete(true)}
            variant="danger"
          />
        </View>
      </ScrollView>

      <DeleteActivityDialog
        visible={showDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        isDeleting={isDeleting}
      />

      <ReopenActivityDialog
        visible={showReopenActivity}
        onConfirm={handleReopenActivity}
        onCancel={() => { setShowReopenActivity(false); setIsReopening(false) }}
        isLoading={isReopening}
      />
    </ThemeView>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoGrid: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: 100,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  completed: {
    textDecorationLine: 'line-through',
  },
})
