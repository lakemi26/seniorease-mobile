import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from './auth-context'
import { usePreferences } from './preferences-context'
import type { getActivityUseCases } from '@/infrastructure/composition/activity-service'
import type { Activity } from '@/modules/activities/domain/entities'
import { deriveNotifications } from '@/modules/notifications/domain/notification-utils'
import type { ActivityNotification } from '@/modules/notifications/domain/entities'
import { localNotificationService, type ActivityNotificationNavigationRequest } from '@/infrastructure/notifications/local-notification-service'

interface NotificationsContextValue {
  notifications: ActivityNotification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  notice: string | null
  markAsRead: (notification: ActivityNotification) => Promise<void>
  markAllAsRead: () => Promise<void>
  dismissNotification: (notification: ActivityNotification) => Promise<void>
  refresh: () => void
  clearNotice: () => void
}

const defaultValue: NotificationsContextValue = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  notice: null,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  dismissNotification: async () => {},
  refresh: () => {},
  clearNotice: () => {},
}

const NotificationsContext = createContext<NotificationsContextValue>(defaultValue)

function getUseCases(): ReturnType<typeof getActivityUseCases> {
  const service = require('@/infrastructure/composition/activity-service') as { getActivityUseCases: typeof getActivityUseCases }
  return service.getActivityUseCases()
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const router = useRouter()
  const { user } = useAuth()
  const { preferences } = usePreferences()
  const uid = user?.uid ?? null
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [notificationTick, setNotificationTick] = useState(0)
  const refreshTickRef = useRef(0)
  const handledResponseRef = useRef<string | null>(null)
  const [, forceRefresh] = useState(0)

  useEffect(() => {
    localNotificationService.configureForegroundHandler()
  }, [])

  useEffect(() => {
    const useCases = getUseCases()

    const handleNotificationOpen = async (request: ActivityNotificationNavigationRequest) => {
      if (!uid) return

      const dedupeKey = request.responseIdentifier ?? `${request.activityId ?? 'notifications'}:${request.route}`
      if (handledResponseRef.current === dedupeKey) return
      handledResponseRef.current = dedupeKey

      if (!request.activityId) {
        router.push('/notificacoes' as any)
        return
      }

      try {
        await useCases.getActivity(request.activityId)
        await useCases.markReminderAsRead(request.activityId, uid).catch(() => {})
        setNotificationTick((value) => value + 1)
        router.push(`/atividades/${request.activityId}` as any)
      } catch {
        setNotice('Esta atividade não está mais disponível.')
        setNotificationTick((value) => value + 1)
        router.push('/notificacoes' as any)
      }
    }

    const receivedSubscription = localNotificationService.addNotificationReceivedListener(() => {
      setNotificationTick((value) => value + 1)
    })
    const responseSubscription = localNotificationService.addNotificationResponseListener((request) => {
      void handleNotificationOpen(request)
    })

    void localNotificationService.getInitialNotificationResponse().then((request) => {
      if (!request) return
      void handleNotificationOpen(request).finally(() => {
        void localNotificationService.clearInitialNotificationResponse().catch(() => {})
      })
    }).catch(() => {})

    return () => {
      receivedSubscription.remove()
      responseSubscription.remove()
    }
  }, [router, uid])

  useEffect(() => {
    if (!uid) {
      setActivities([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    const useCases = getUseCases()

    const unsubscribe = useCases.subscribeByUser(
      uid,
      {},
      (data) => {
        setActivities(data)
        setIsLoading(false)
      },
      (err) => {
        setError(err.message)
        setIsLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [uid, refreshTickRef.current])

  useEffect(() => {
    if (!uid || isLoading) return
    void localNotificationService.syncLocalActivityNotifications(activities, preferences.remindersEnabled).catch(() => {})
  }, [activities, isLoading, preferences.remindersEnabled, uid])

  const notifications = useMemo(
    () => deriveNotifications(activities, new Date(), preferences.remindersEnabled),
    [activities, preferences.remindersEnabled, notificationTick],
  )

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  )

  const markAsRead = useCallback(async (notification: ActivityNotification) => {
    if (!uid || notification.isRead) return
    const useCases = getUseCases()
    await useCases.markReminderAsRead(notification.activityId, uid)
  }, [uid])

  const markAllAsRead = useCallback(async () => {
    if (!uid) return
    const useCases = getUseCases()
    const ids = Array.from(
      new Set(notifications.filter((notification) => !notification.isRead).map((notification) => notification.activityId)),
    )
    await useCases.markAllRemindersAsRead(ids, uid)
  }, [notifications, uid])

  const dismissNotification = useCallback(async (notification: ActivityNotification) => {
    if (!uid) return
    const useCases = getUseCases()
    await useCases.dismissReminder(notification.activityId, uid)
  }, [uid])

  const refresh = useCallback(() => {
    refreshTickRef.current += 1
    forceRefresh(refreshTickRef.current)
  }, [])

  const clearNotice = useCallback(() => {
    setNotice(null)
  }, [])

  const value = useMemo<NotificationsContextValue>(() => ({
    notifications,
    unreadCount,
    isLoading,
    error,
    notice,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refresh,
    clearNotice,
  }), [clearNotice, dismissNotification, error, isLoading, markAllAsRead, markAsRead, notice, notifications, refresh, unreadCount])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationsContextValue {
  return useContext(NotificationsContext)
}
