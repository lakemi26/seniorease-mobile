import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import type { Activity } from '@/modules/activities/domain/entities'

export const ACTIVITY_REMINDERS_CHANNEL_ID = 'activity-reminders'

const STORAGE_KEY = '@seniorease:activity-reminder-notifications'

type PermissionState = 'granted' | 'denied' | 'undetermined'

export interface ActivityNotificationNavigationRequest {
  activityId: string | null
  route: string
  notificationType: string | null
  responseIdentifier: string | null
}

interface StoredNotificationRecord {
  identifier: string
  remindAt: string
  scheduledAt: string
  title: string
}

type StoredNotificationMap = Record<string, StoredNotificationRecord>

function isNativePlatform(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios'
}

function isPermissionGranted(status: Notifications.NotificationPermissionsStatus): boolean {
  return Boolean(
    status.granted ||
    status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
  )
}

function normalizePermission(status: Notifications.NotificationPermissionsStatus): PermissionState {
  if (isPermissionGranted(status)) return 'granted'
  return status.status === 'denied' ? 'denied' : 'undetermined'
}

function canScheduleActivityReminder(activity: Activity, remindersEnabled: boolean, now = new Date()): boolean {
  return Boolean(
    remindersEnabled &&
    activity.reminder.enabled &&
    activity.reminder.remindAt &&
    activity.reminder.remindAt.getTime() > now.getTime() &&
    activity.status !== 'completed' &&
    activity.status !== 'cancelled',
  )
}

function formatActivityDateTime(activity: Activity): string {
  return activity.scheduledAt.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: activity.hasTime ? '2-digit' : undefined,
    minute: activity.hasTime ? '2-digit' : undefined,
  })
}

async function readMap(): Promise<StoredNotificationMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as StoredNotificationMap
  } catch {
    return {}
  }
}

async function writeMap(map: StoredNotificationMap): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function recordMatches(record: StoredNotificationRecord, activity: Activity): boolean {
  return (
    record.remindAt === activity.reminder.remindAt?.toISOString() &&
    record.scheduledAt === activity.scheduledAt.toISOString() &&
    record.title === activity.title
  )
}

function parseNavigationRequest(
  notification: Notifications.Notification,
  responseIdentifier: string | null = null,
): ActivityNotificationNavigationRequest {
  const data = notification.request.content.data as Record<string, unknown>
  const activityId = typeof data.activityId === 'string' && data.activityId.trim() ? data.activityId : null
  const notificationType = typeof data.notificationType === 'string' ? data.notificationType : null
  const route = activityId ? `/atividades/${activityId}` : '/notificacoes'

  return { activityId, route, notificationType, responseIdentifier }
}

let handlerConfigured = false

export const localNotificationService = {
  configureForegroundHandler(): void {
    if (handlerConfigured || !isNativePlatform()) return
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      }),
    })
    handlerConfigured = true
  },

  async ensureAndroidChannel(): Promise<void> {
    if (Platform.OS !== 'android') return
    await Notifications.setNotificationChannelAsync(ACTIVITY_REMINDERS_CHANNEL_ID, {
      name: 'Lembretes de atividades',
      description: 'Avisos sobre atividades agendadas no SeniorEase.',
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  },

  async getPermissionState(): Promise<PermissionState> {
    if (!isNativePlatform()) return 'denied'
    const status = await Notifications.getPermissionsAsync()
    return normalizePermission(status)
  },

  async requestPermission(): Promise<PermissionState> {
    if (!isNativePlatform()) return 'denied'
    await this.ensureAndroidChannel()
    const status = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: false,
      },
    })
    return normalizePermission(status)
  },

  async listScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    if (!isNativePlatform()) return []
    return Notifications.getAllScheduledNotificationsAsync()
  },

  async scheduleActivityReminder(activity: Activity, remindersEnabled: boolean): Promise<string | null> {
    if (!isNativePlatform() || !canScheduleActivityReminder(activity, remindersEnabled)) {
      await this.cancelActivityReminder(activity.id)
      return null
    }

    const permissionState = await this.getPermissionState()
    if (permissionState !== 'granted') {
      await this.cancelActivityReminder(activity.id)
      return null
    }

    await this.ensureAndroidChannel()
    await this.cancelActivityReminder(activity.id)

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete do SeniorEase',
        body: `${activity.title} - ${formatActivityDateTime(activity)}`,
        data: {
          activityId: activity.id,
          route: `/atividades/${activity.id}`,
          notificationType: 'activity-reminder',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: activity.reminder.remindAt!,
        channelId: ACTIVITY_REMINDERS_CHANNEL_ID,
      },
    })

    const map = await readMap()
    map[activity.id] = {
      identifier,
      remindAt: activity.reminder.remindAt!.toISOString(),
      scheduledAt: activity.scheduledAt.toISOString(),
      title: activity.title,
    }
    await writeMap(map)
    return identifier
  },

  async cancelActivityReminder(activityId: string): Promise<void> {
    const map = await readMap()
    const record = map[activityId]
    if (record && isNativePlatform()) {
      await Notifications.cancelScheduledNotificationAsync(record.identifier)
    }
    if (record) {
      delete map[activityId]
      await writeMap(map)
    }
  },

  async cancelAllActivityReminders(): Promise<void> {
    const map = await readMap()
    const records = Object.values(map)
    if (isNativePlatform()) {
      await Promise.all(records.map((record) => Notifications.cancelScheduledNotificationAsync(record.identifier)))
    }
    await writeMap({})
  },

  async syncActivityReminder(activity: Activity, remindersEnabled: boolean): Promise<void> {
    const map = await readMap()
    const record = map[activity.id]
    if (canScheduleActivityReminder(activity, remindersEnabled) && record && recordMatches(record, activity)) {
      return
    }
    await this.scheduleActivityReminder(activity, remindersEnabled)
  },

  async syncLocalActivityNotifications(activities: Activity[], remindersEnabled: boolean): Promise<void> {
    const map = await readMap()
    const validIds = new Set(
      activities
        .filter((activity) => canScheduleActivityReminder(activity, remindersEnabled))
        .map((activity) => activity.id),
    )

    for (const activityId of Object.keys(map)) {
      if (!validIds.has(activityId)) {
        await this.cancelActivityReminder(activityId)
      }
    }

    if (!remindersEnabled || (await this.getPermissionState()) !== 'granted') return

    const scheduledIdentifiers = new Set(
      (await this.listScheduledNotifications()).map((notification) => notification.identifier),
    )

    for (const activity of activities) {
      if (!canScheduleActivityReminder(activity, remindersEnabled)) continue
      const currentMap = await readMap()
      const record = currentMap[activity.id]
      if (record && recordMatches(record, activity) && scheduledIdentifiers.has(record.identifier)) continue
      await this.scheduleActivityReminder(activity, remindersEnabled)
    }
  },

  addNotificationReceivedListener(onReceived: (request: ActivityNotificationNavigationRequest) => void): { remove: () => void } {
    if (!isNativePlatform()) return { remove: () => {} }
    return Notifications.addNotificationReceivedListener((notification) => {
      onReceived(parseNavigationRequest(notification))
    })
  },

  addNotificationResponseListener(onOpen: (request: ActivityNotificationNavigationRequest) => void): { remove: () => void } {
    if (!isNativePlatform()) return { remove: () => {} }
    return Notifications.addNotificationResponseReceivedListener((response) => {
      onOpen(parseNavigationRequest(response.notification, response.notification.request.identifier))
    })
  },

  async getInitialNotificationResponse(): Promise<ActivityNotificationNavigationRequest | null> {
    if (!isNativePlatform()) return null
    const response = await Notifications.getLastNotificationResponseAsync()
    if (!response) return null
    return parseNavigationRequest(response.notification, response.notification.request.identifier)
  },

  async clearInitialNotificationResponse(): Promise<void> {
    if (!isNativePlatform()) return
    await Notifications.clearLastNotificationResponseAsync()
  },
}
