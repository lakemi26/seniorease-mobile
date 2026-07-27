import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { activityFormSchema, type ActivityFormData } from '@/modules/activities/application/schemas/activity.schema'
import { getActivityUseCases } from '@/infrastructure/composition/activity-service'
import { useAuth } from '@/contexts/auth-context'
import { usePreferences } from '@/contexts/preferences-context'
import { localNotificationService } from '@/infrastructure/notifications/local-notification-service'
import type { Activity, CreateActivityInput } from '@/modules/activities/domain/entities'


const useCases = getActivityUseCases()

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
  const { preferences } = usePreferences()
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null)
  const [pastDateConfirm, setPastDateConfirm] = useState(false)
  const [showPastDateDialog, setShowPastDateDialog] = useState(false)
  const [showNotificationPermissionDialog, setShowNotificationPermissionDialog] = useState(false)
  const [isRequestingNotificationPermission, setIsRequestingNotificationPermission] = useState(false)

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

  const syncLocalNotification = useCallback(async (activity: Activity) => {
    try {
      await localNotificationService.syncActivityReminder(activity, preferences.remindersEnabled)
    } catch {
      setNotificationMessage('Atividade salva, mas não foi possível agendar o lembrete local neste dispositivo.')
    }
  }, [preferences.remindersEnabled])

  const handleReminderOptionChange = useCallback(async (option: string) => {
    setValue('reminderOption', option as ActivityFormData['reminderOption'])
    setNotificationMessage(null)

    if (option === 'none') return

    if (!preferences.remindersEnabled) {
      setNotificationMessage('Os lembretes estão desativados nas preferências. Ative-os para receber notificações do sistema.')
      return
    }

    const permissionState = await localNotificationService.getPermissionState()
    if (permissionState === 'undetermined') {
      setShowNotificationPermissionDialog(true)
      return
    }
    if (permissionState === 'denied') {
      setNotificationMessage('As notificações estão bloqueadas. Abra as configurações do sistema para permitir lembretes do SeniorEase.')
    }
  }, [preferences.remindersEnabled, setValue])

  const requestNotificationPermission = useCallback(async () => {
    setIsRequestingNotificationPermission(true)
    try {
      const permissionState = await localNotificationService.requestPermission()
      setShowNotificationPermissionDialog(false)
      if (permissionState === 'granted') {
        setNotificationMessage(null)
      } else {
        setNotificationMessage('As notificações foram negadas. Você pode permitir lembretes nas configurações do sistema quando quiser.')
      }
    } finally {
      setIsRequestingNotificationPermission(false)
    }
  }, [])

  const dismissNotificationPermissionDialog = useCallback(() => {
    setShowNotificationPermissionDialog(false)
  }, [])

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
          await syncLocalNotification(updated)
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
        await syncLocalNotification(created)
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
    [user, isEditing, existingActivity, pastDateConfirm, checkPastDate, syncLocalNotification],
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
    notificationMessage,
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
    handleReminderOptionChange,
    showNotificationPermissionDialog,
    requestNotificationPermission,
    dismissNotificationPermissionDialog,
    isRequestingNotificationPermission,
  }
}
