import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { activityFormSchema, type ActivityFormData } from '@/modules/activities/application/schemas/activity.schema'
import { createFirebaseActivityRepository } from '@/modules/activities/infrastructure/repositories/firebase-activity.repository'
import { createActivityUseCases } from '@/modules/activities/application/use-cases'
import { useAuth } from '@/contexts/auth-context'
import type { Activity, CreateActivityInput } from '@/modules/activities/domain/entities'


const repo = createFirebaseActivityRepository()
const useCases = createActivityUseCases(repo)

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toFormDataFromActivity(activity: Activity): ActivityFormData {
  const dateStr = toDateInputValue(activity.scheduledAt)
  const timeStr = activity.hasTime
    ? `${String(activity.scheduledAt.getHours()).padStart(2, '0')}:${String(activity.scheduledAt.getMinutes()).padStart(2, '0')}`
    : ''

  return {
    title: activity.title,
    description: activity.description ?? '',
    category: activity.category,
    date: dateStr,
    hasTime: activity.hasTime,
    time: timeStr,
    priority: activity.priority,
    steps: activity.steps.map((s) => ({ _key: s.id, title: s.title })),
    reminderOption: activity.reminder.enabled
      ? 'atTime'
      : 'none',
    reminderDate: '',
    reminderTime: '',
    confirmPastDate: false,
  }
}

function computeRemindAt(
  scheduledDate: Date,
  hasTime: boolean,
  reminderOption: string,
  reminderDate?: string,
  reminderTime?: string,
): Date | null {
  if (reminderOption === 'none') return null

  if (reminderOption === 'custom' && reminderDate && reminderTime) {
    return new Date(`${reminderDate}T${reminderTime}:00`)
  }

  const offsets: Record<string, number> = {
    atTime: 0,
    '15min': 15 * 60 * 1000,
    '30min': 30 * 60 * 1000,
    '1hour': 60 * 60 * 1000,
    '1day': 24 * 60 * 60 * 1000,
  }

  const offset = offsets[reminderOption]
  if (offset === undefined) return null

  const remindAt = new Date(scheduledDate.getTime() - offset)

  if (!hasTime && reminderOption !== 'custom') {
    remindAt.setHours(0, 0, 0, 0)
  }

  return remindAt
}

export function useActivityForm(existingActivity?: Activity) {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pastDateConfirm, setPastDateConfirm] = useState(false)
  const [showPastDateDialog, setShowPastDateDialog] = useState(false)

  const isEditing = !!existingActivity

  const defaultValues = useMemo<ActivityFormData>(
    () =>
      existingActivity
        ? toFormDataFromActivity(existingActivity)
        : {
            title: '',
            description: '',
            category: undefined as any,
            date: '',
            hasTime: false,
            time: '',
            priority: 'medium' as const,
            steps: [],
            reminderOption: 'none' as const,
            reminderDate: '',
            reminderTime: '',
            confirmPastDate: false,
          },
    [existingActivity],
  )

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema) as any,
    defaultValues,
  })

  const watchedDate = watch('date')
  const watchedTime = watch('time')
  const watchedHasTime = watch('hasTime')
  const watchedReminderOption = watch('reminderOption')

  const checkPastDate = useCallback(
    (data: ActivityFormData): boolean => {
      if (data.confirmPastDate) return false

      const scheduledDate = new Date(
        data.date + (data.hasTime && data.time ? `T${data.time}:00` : 'T23:59:59'),
      )
      const now = new Date()

      if (data.hasTime) {
        return scheduledDate < now
      }
      const dayEnd = new Date(scheduledDate)
      dayEnd.setHours(23, 59, 59, 999)
      return dayEnd < now
    },
    [],
  )

  const save = useCallback(
    async (data: ActivityFormData): Promise<Activity | null> => {
      if (!user?.uid) {
        setSaveError('Usuário não autenticado.')
        return null
      }

      if (!pastDateConfirm && checkPastDate(data)) {
        setShowPastDateDialog(true)
        return null
      }

      setIsSaving(true)
      setSaveError(null)

      try {
        const scheduledDate = new Date(
          data.date + (data.hasTime && data.time ? `T${data.time}:00` : 'T00:00:00'),
        )

        const remindAt = computeRemindAt(
          scheduledDate,
          data.hasTime ?? false,
          data.reminderOption ?? 'none',
          data.reminderDate,
          data.reminderTime,
        )

        if (isEditing && existingActivity) {
          const input: Partial<CreateActivityInput> = {
            title: data.title,
            description: data.description || null,
            category: data.category,
            scheduledAt: scheduledDate,
            hasTime: data.hasTime ?? false,
            priority: data.priority,
            steps: (data.steps ?? []).map((s, i) => ({
              id: s._key,
              title: s.title,
              order: i + 1,
            })),
            reminder: {
              enabled: data.reminderOption !== 'none',
              remindAt,
              readAt: null,
              dismissedAt: null,
            },
          }

          const updated = await useCases.updateActivity(existingActivity.id, input)
          return updated
        }

        const input: CreateActivityInput = {
          userId: user.uid,
          title: data.title,
          description: data.description || null,
          category: data.category,
          scheduledAt: scheduledDate,
          hasTime: data.hasTime ?? false,
          priority: data.priority,
          steps: (data.steps ?? []).map((s, i) => ({
            id: s._key || generateId(),
            title: s.title,
            order: i + 1,
          })),
          reminder: {
            enabled: data.reminderOption !== 'none',
            remindAt,
            readAt: null,
            dismissedAt: null,
          },
        }

        const created = await useCases.createActivity(input)
        return created
      } catch (err: any) {
        const msg = isEditing
          ? 'Não foi possível atualizar a atividade. Tente novamente.'
          : 'Não foi possível criar a atividade. Tente novamente.'
        setSaveError(err?.message || msg)
        return null
      } finally {
        setIsSaving(false)
      }
    },
    [user, isEditing, existingActivity, pastDateConfirm, checkPastDate],
  )

  const confirmPastDateAndSave = useCallback(
    async (data: ActivityFormData): Promise<Activity | null> => {
      setPastDateConfirm(true)
      setShowPastDateDialog(false)
      setValue('confirmPastDate', true)
      return save({ ...data, confirmPastDate: true })
    },
    [save, setValue],
  )

  const dismissPastDateDialog = useCallback(() => {
    setShowPastDateDialog(false)
  }, [])

  return {
    control: control as any,
    errors,
    isSaving,
    saveError,
    handleSubmit,
    save,
    watchedDate,
    watchedTime,
    watchedHasTime,
    watchedReminderOption,
    setValue,
    watch,
    reset,
    isEditing,
    showPastDateDialog,
    confirmPastDateAndSave,
    dismissPastDateDialog,
  }
}
