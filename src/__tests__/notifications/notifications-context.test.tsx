import { renderHook, act } from '@testing-library/react-native'
import * as Notifications from 'expo-notifications'
import type { Activity } from '@/modules/activities/domain/entities'

let mockUseAuth: jest.Mock
let mockUsePreferences: jest.Mock
let mockRouter: { push: jest.Mock }
const mockSubscribeByUser = jest.fn()
const mockGetActivity = jest.fn()
const mockMarkReminderAsRead = jest.fn()
const mockMarkAllRemindersAsRead = jest.fn()
const mockDismissReminder = jest.fn()
let onData: ((activities: Activity[]) => void) | null = null
let unsubscribe: jest.Mock
let receivedCallback: ((notification: any) => void) | null = null
let responseCallback: ((response: any) => void) | null = null
let receivedRemove: jest.Mock
let responseRemove: jest.Mock

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}))

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock('@/contexts/preferences-context', () => ({
  usePreferences: () => mockUsePreferences(),
}))

jest.mock('@/infrastructure/composition/activity-service', () => ({
  getActivityUseCases: () => ({
    getActivity: mockGetActivity,
    subscribeByUser: mockSubscribeByUser,
    markReminderAsRead: mockMarkReminderAsRead,
    markAllRemindersAsRead: mockMarkAllRemindersAsRead,
    dismissReminder: mockDismissReminder,
  }),
}))

import { NotificationsProvider, useNotifications } from '@/contexts/notifications-context'

const now = new Date('2026-07-27T12:00:00')

function makeActivity(id: string, overrides: Partial<Activity> = {}): Activity {
  return {
    id,
    userId: 'user-1',
    title: `Atividade ${id}`,
    description: null,
    category: 'health',
    scheduledAt: new Date('2026-07-27T14:00:00'),
    hasTime: true,
    status: 'pending',
    priority: 'medium',
    steps: [],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('NotificationsProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now)
    mockRouter = { push: jest.fn() }
    mockUseAuth = jest.fn(() => ({ user: { uid: 'user-1' } }))
    mockUsePreferences = jest.fn(() => ({ preferences: { remindersEnabled: true } }))
    unsubscribe = jest.fn()
    onData = null
    receivedCallback = null
    responseCallback = null
    receivedRemove = jest.fn()
    responseRemove = jest.fn()
    ;(Notifications.addNotificationReceivedListener as jest.Mock).mockImplementation((callback) => {
      receivedCallback = callback
      return { remove: receivedRemove }
    })
    ;(Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation((callback) => {
      responseCallback = callback
      return { remove: responseRemove }
    })
    ;(Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null)
    ;(Notifications.clearLastNotificationResponseAsync as jest.Mock).mockResolvedValue(undefined)
    mockSubscribeByUser.mockReset()
    mockSubscribeByUser.mockImplementation((_uid, _filters, dataCallback) => {
      onData = dataCallback
      return unsubscribe
    })
    mockGetActivity.mockReset().mockResolvedValue(makeActivity('act-1'))
    mockMarkReminderAsRead.mockReset().mockResolvedValue(undefined)
    mockMarkAllRemindersAsRead.mockReset().mockResolvedValue(undefined)
    mockDismissReminder.mockReset().mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('subscribes and derives unread notifications', async () => {
    const { result } = await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    await act(async () => {
      onData!([makeActivity('today')])
    })

    expect(mockSubscribeByUser).toHaveBeenCalledWith('user-1', {}, expect.any(Function), expect.any(Function))
    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.unreadCount).toBe(1)
    expect(result.current.isLoading).toBe(false)
  })

  it('marks one notification as read', async () => {
    const { result } = await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    await act(async () => {
      onData!([makeActivity('today')])
    })

    await act(async () => {
      await result.current.markAsRead(result.current.notifications[0])
    })

    expect(mockMarkReminderAsRead).toHaveBeenCalledWith('today', 'user-1')
  })

  it('marks all unread notifications as read', async () => {
    const { result } = await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    await act(async () => {
      onData!([makeActivity('a'), makeActivity('b')])
    })

    await act(async () => {
      await result.current.markAllAsRead()
    })

    expect(mockMarkAllRemindersAsRead).toHaveBeenCalledWith(['a', 'b'], 'user-1')
  })

  it('dismisses a notification without deleting the activity', async () => {
    const { result } = await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    await act(async () => {
      onData!([makeActivity('a')])
    })

    await act(async () => {
      await result.current.dismissNotification(result.current.notifications[0])
    })

    expect(mockDismissReminder).toHaveBeenCalledWith('a', 'user-1')
  })

  it('reports loading errors and cleans up listeners', async () => {
    mockSubscribeByUser.mockImplementation((_uid, _filters, _dataCallback, errorCallback) => {
      errorCallback(new Error('Falha'))
      return unsubscribe
    })

    const { result, unmount } = await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    expect(result.current.error).toBe('Falha')
    await act(async () => unmount())
    expect(unsubscribe).toHaveBeenCalled()
  })

  it('updates the center when a local notification is received while open', async () => {
    await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    await act(async () => {
      receivedCallback!({ request: { identifier: 'received-1', content: { data: { activityId: 'act-1' } } } })
    })

    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled()
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('opens the activity and marks the reminder as read from a foreground/background response', async () => {
    await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    await act(async () => {
      responseCallback!({
        notification: { request: { identifier: 'response-1', content: { data: { activityId: 'act-1', notificationType: 'activity-reminder' } } } },
      })
    })

    expect(mockGetActivity).toHaveBeenCalledWith('act-1')
    expect(mockMarkReminderAsRead).toHaveBeenCalledWith('act-1', 'user-1')
    expect(mockRouter.push).toHaveBeenCalledWith('/atividades/act-1')
  })

  it('opens the activity when the app starts from a notification tap', async () => {
    ;(Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue({
      notification: { request: { identifier: 'initial-1', content: { data: { activityId: 'act-1', notificationType: 'activity-reminder' } } } },
    })

    await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    await act(async () => {})

    expect(mockRouter.push).toHaveBeenCalledWith('/atividades/act-1')
    expect(Notifications.clearLastNotificationResponseAsync).toHaveBeenCalled()
  })

  it('does not navigate from a notification response when user is logged out', async () => {
    mockUseAuth.mockReturnValue({ user: null })
    await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    await act(async () => {
      responseCallback!({
        notification: { request: { identifier: 'logged-out-1', content: { data: { activityId: 'act-1' } } } },
      })
    })

    expect(mockRouter.push).not.toHaveBeenCalled()
    expect(mockMarkReminderAsRead).not.toHaveBeenCalled()
  })

  it('opens notifications when activityId is missing', async () => {
    await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    await act(async () => {
      responseCallback!({ notification: { request: { identifier: 'missing-id-1', content: { data: {} } } } })
    })

    expect(mockRouter.push).toHaveBeenCalledWith('/notificacoes')
  })

  it('shows fallback when the tapped activity no longer exists', async () => {
    mockGetActivity.mockRejectedValue(new Error('Atividade não encontrada.'))
    const { result } = await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    await act(async () => {
      responseCallback!({
        notification: { request: { identifier: 'deleted-1', content: { data: { activityId: 'act-1' } } } },
      })
    })

    expect(result.current.notice).toBe('Esta atividade não está mais disponível.')
    expect(mockRouter.push).toHaveBeenCalledWith('/notificacoes')
  })

  it('prevents duplicate navigation for the same response', async () => {
    await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })
    const response = {
      notification: { request: { identifier: 'same-response', content: { data: { activityId: 'act-1' } } } },
    }

    await act(async () => {
      responseCallback!(response)
      responseCallback!(response)
    })

    expect(mockRouter.push).toHaveBeenCalledTimes(1)
  })

  it('removes received and response listeners on cleanup', async () => {
    const { unmount } = await renderHook(() => useNotifications(), { wrapper: NotificationsProvider })

    await act(async () => unmount())

    expect(receivedRemove).toHaveBeenCalled()
    expect(responseRemove).toHaveBeenCalled()
  })
})
