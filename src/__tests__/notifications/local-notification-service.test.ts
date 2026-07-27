import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import type { Activity } from '@/modules/activities/domain/entities'
import { ACTIVITY_REMINDERS_CHANNEL_ID, localNotificationService } from '@/infrastructure/notifications/local-notification-service'

const storage: Record<string, string> = {}
const now = new Date('2026-07-27T12:00:00')
const originalOS = Platform.OS

function mockPlatform(os: 'android' | 'ios' | 'web') {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os })
}

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'act-1',
    userId: 'user-1',
    title: 'Consulta médica',
    description: null,
    category: 'health',
    scheduledAt: new Date('2026-07-28T14:00:00'),
    hasTime: true,
    status: 'pending',
    priority: 'medium',
    steps: [],
    reminder: { enabled: true, remindAt: new Date('2026-07-28T13:45:00'), readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function mockGrantedPermission() {
  ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, status: 'granted' })
}

describe('localNotificationService', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now)
    mockPlatform('android')
    for (const key of Object.keys(storage)) delete storage[key]
    ;(AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => Promise.resolve(storage[key] ?? null))
    ;(AsyncStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
      storage[key] = value
      return Promise.resolve()
    })
    jest.clearAllMocks()
    mockGrantedPermission()
    ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, status: 'granted' })
    ;(Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('native-1')
    ;(Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS })
  })

  it('configures the Android channel before requesting permission', async () => {
    await localNotificationService.requestPermission()

    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      ACTIVITY_REMINDERS_CHANNEL_ID,
      expect.objectContaining({
        name: 'Lembretes de atividades',
        description: 'Avisos sobre atividades agendadas no SeniorEase.',
        importance: Notifications.AndroidImportance.DEFAULT,
      }),
    )
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled()
  })

  it('returns denied when permission is denied', async () => {
    ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, status: 'denied' })

    await expect(localNotificationService.getPermissionState()).resolves.toBe('denied')
  })

  it('schedules a granted local reminder with safe activity data', async () => {
    const identifier = await localNotificationService.scheduleActivityReminder(makeActivity(), true)

    expect(identifier).toBe('native-1')
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({
        title: 'Lembrete do SeniorEase',
        body: expect.stringContaining('Consulta médica'),
        data: {
          activityId: 'act-1',
          route: '/atividades/act-1',
          notificationType: 'activity-reminder',
        },
      }),
      trigger: expect.objectContaining({
        channelId: ACTIVITY_REMINDERS_CHANNEL_ID,
        date: new Date('2026-07-28T13:45:00'),
      }),
    }))
  })

  it('does not schedule when remindersEnabled is false', async () => {
    await localNotificationService.scheduleActivityReminder(makeActivity(), false)

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled()
  })

  it('does not schedule when reminder is disabled', async () => {
    await localNotificationService.scheduleActivityReminder(makeActivity({ reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null } }), true)

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled()
  })

  it('does not schedule reminders in the past', async () => {
    await localNotificationService.scheduleActivityReminder(makeActivity({ reminder: { enabled: true, remindAt: new Date('2026-07-27T11:00:00'), readAt: null, dismissedAt: null } }), true)

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled()
  })

  it('cancels an existing notification', async () => {
    storage['@seniorease:activity-reminder-notifications'] = JSON.stringify({
      'act-1': { identifier: 'native-old', remindAt: 'x', scheduledAt: 'y', title: 'z' },
    })

    await localNotificationService.cancelActivityReminder('act-1')

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('native-old')
    expect(storage['@seniorease:activity-reminder-notifications']).toBe('{}')
  })

  it('re-schedules edited reminders by cancelling the old identifier', async () => {
    storage['@seniorease:activity-reminder-notifications'] = JSON.stringify({
      'act-1': { identifier: 'native-old', remindAt: 'old', scheduledAt: 'old', title: 'old' },
    })

    await localNotificationService.scheduleActivityReminder(makeActivity(), true)

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('native-old')
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1)
  })

  it('keeps sync idempotent when the stored reminder is already scheduled', async () => {
    const activity = makeActivity()
    storage['@seniorease:activity-reminder-notifications'] = JSON.stringify({
      'act-1': {
        identifier: 'native-1',
        remindAt: activity.reminder.remindAt!.toISOString(),
        scheduledAt: activity.scheduledAt.toISOString(),
        title: activity.title,
      },
    })
    ;(Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([{ identifier: 'native-1' }])

    await localNotificationService.syncLocalActivityNotifications([activity], true)

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled()
  })

  it('creates a missing scheduled notification without duplicating existing ones', async () => {
    const activity = makeActivity()
    storage['@seniorease:activity-reminder-notifications'] = JSON.stringify({
      'act-1': {
        identifier: 'native-missing',
        remindAt: activity.reminder.remindAt!.toISOString(),
        scheduledAt: activity.scheduledAt.toISOString(),
        title: activity.title,
      },
    })
    ;(Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([])

    await localNotificationService.syncLocalActivityNotifications([activity], true)

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1)
  })

  it('surfaces scheduling errors to callers', async () => {
    ;(Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(new Error('native fail'))

    await expect(localNotificationService.scheduleActivityReminder(makeActivity(), true)).rejects.toThrow('native fail')
  })

  it('cleans every local reminder on logout', async () => {
    storage['@seniorease:activity-reminder-notifications'] = JSON.stringify({
      'act-1': { identifier: 'native-1', remindAt: 'x', scheduledAt: 'y', title: 'z' },
      'act-2': { identifier: 'native-2', remindAt: 'x', scheduledAt: 'y', title: 'z' },
    })

    await localNotificationService.cancelAllActivityReminders()

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('native-1')
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('native-2')
    expect(storage['@seniorease:activity-reminder-notifications']).toBe('{}')
  })

  it('handles notification responses by exposing the activity route', () => {
    let listener: any
    ;(Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation((callback) => {
      listener = callback
      return { remove: jest.fn() }
    })
    const onActivityOpen = jest.fn()

    localNotificationService.addNotificationResponseListener(onActivityOpen)
    listener({
      notification: {
        request: {
          content: {
            data: {
              activityId: 'act-1',
              route: '/atividades/act-1',
              notificationType: 'activity-reminder',
            },
          },
        },
      },
    })

    expect(onActivityOpen).toHaveBeenCalledWith(expect.objectContaining({
      activityId: 'act-1',
      route: '/atividades/act-1',
      notificationType: 'activity-reminder',
    }))
  })

  it('handles foreground received notifications without navigating by itself', () => {
    let listener: any
    ;(Notifications.addNotificationReceivedListener as jest.Mock).mockImplementation((callback) => {
      listener = callback
      return { remove: jest.fn() }
    })
    const onReceived = jest.fn()

    localNotificationService.addNotificationReceivedListener(onReceived)
    listener({
      request: {
        identifier: 'received-1',
        content: {
          data: {
            activityId: 'act-1',
            notificationType: 'activity-reminder',
          },
        },
      },
    })

    expect(onReceived).toHaveBeenCalledWith(expect.objectContaining({
      activityId: 'act-1',
      route: '/atividades/act-1',
      notificationType: 'activity-reminder',
    }))
  })

  it('falls back to notifications route when activityId is absent', () => {
    let listener: any
    ;(Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation((callback) => {
      listener = callback
      return { remove: jest.fn() }
    })
    const onActivityOpen = jest.fn()

    localNotificationService.addNotificationResponseListener(onActivityOpen)
    listener({ notification: { request: { identifier: 'r1', content: { data: {} } } } })

    expect(onActivityOpen).toHaveBeenCalledWith(expect.objectContaining({
      activityId: null,
      route: '/notificacoes',
    }))
  })

  it('reads and clears the initial notification response', async () => {
    ;(Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue({
      notification: {
        request: {
          identifier: 'initial-1',
          content: { data: { activityId: 'act-1', notificationType: 'activity-reminder' } },
        },
      },
    })

    await expect(localNotificationService.getInitialNotificationResponse()).resolves.toEqual(expect.objectContaining({
      activityId: 'act-1',
      route: '/atividades/act-1',
      responseIdentifier: 'initial-1',
    }))
    await localNotificationService.clearInitialNotificationResponse()

    expect(Notifications.clearLastNotificationResponseAsync).toHaveBeenCalled()
  })
})
