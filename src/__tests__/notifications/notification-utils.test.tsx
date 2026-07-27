import type { Activity } from '@/modules/activities/domain/entities'
import { deriveNotifications, getUnreadCountLabel } from '@/modules/notifications/domain/notification-utils'

const baseNow = new Date('2026-07-27T12:00:00')

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
    createdAt: baseNow,
    updatedAt: baseNow,
    ...overrides,
  }
}

describe('notification derivation', () => {
  it('returns no notifications when there are no activities', () => {
    expect(deriveNotifications([], baseNow)).toEqual([])
  })

  it('creates reminder notifications from due reminders', () => {
    const activity = makeActivity('reminder', {
      title: 'Consulta médica',
      reminder: { enabled: true, remindAt: new Date('2026-07-27T11:55:00'), readAt: null, dismissedAt: null },
    })

    const [notification] = deriveNotifications([activity], baseNow)

    expect(notification.type).toBe('reminder')
    expect(notification.description).toBe('Está quase na hora de Consulta médica.')
    expect(notification.isRead).toBe(false)
  })

  it('creates today notifications for pending activities scheduled today', () => {
    const activity = makeActivity('today', { title: 'Organizar documentos', hasTime: false })
    const [notification] = deriveNotifications([activity], baseNow)

    expect(notification.type).toBe('today')
    expect(notification.description).toBe('Você tem Organizar documentos para hoje, sem horário definido.')
  })

  it('creates overdue notifications for active past activities', () => {
    const activity = makeActivity('overdue', {
      title: 'Organizar documentos',
      scheduledAt: new Date('2026-07-26T10:00:00'),
    })
    const [notification] = deriveNotifications([activity], baseNow)

    expect(notification.type).toBe('overdue')
    expect(notification.description).toBe('A atividade Organizar documentos está atrasada.')
  })

  it('creates upcoming notifications for activities scheduled soon', () => {
    const activity = makeActivity('upcoming', {
      title: 'Comprar remédio',
      scheduledAt: new Date('2026-07-28T08:00:00'),
    })
    const [notification] = deriveNotifications([activity], baseNow)

    expect(notification.type).toBe('upcoming')
  })

  it('sorts unread overdue, reminders, today, upcoming, then read items', () => {
    const readOverdue = makeActivity('read-overdue', {
      scheduledAt: new Date('2026-07-26T09:00:00'),
      reminder: { enabled: false, remindAt: null, readAt: new Date('2026-07-27T10:00:00'), dismissedAt: null },
    })
    const upcoming = makeActivity('upcoming', { scheduledAt: new Date('2026-07-28T08:00:00') })
    const today = makeActivity('today', { scheduledAt: new Date('2026-07-27T15:00:00') })
    const reminder = makeActivity('reminder', {
      scheduledAt: new Date('2026-07-27T16:00:00'),
      reminder: { enabled: true, remindAt: new Date('2026-07-27T12:10:00'), readAt: null, dismissedAt: null },
    })
    const overdue = makeActivity('overdue', { scheduledAt: new Date('2026-07-26T08:00:00') })

    const notifications = deriveNotifications([readOverdue, upcoming, today, reminder, overdue], baseNow)

    expect(notifications.map((notification) => notification.type)).toEqual([
      'overdue',
      'reminder',
      'today',
      'upcoming',
      'overdue',
    ])
    expect(notifications[4].isRead).toBe(true)
  })

  it('ignores dismissed, completed and cancelled activities', () => {
    const dismissed = makeActivity('dismissed', {
      reminder: { enabled: true, remindAt: baseNow, readAt: null, dismissedAt: baseNow },
    })
    const completed = makeActivity('completed', { status: 'completed' })
    const cancelled = makeActivity('cancelled', { status: 'cancelled' })

    expect(deriveNotifications([dismissed, completed, cancelled], baseNow)).toEqual([])
  })

  it('respects remindersEnabled when deriving reminder notifications', () => {
    const activity = makeActivity('reminder', {
      scheduledAt: new Date('2026-07-28T08:00:00'),
      reminder: { enabled: true, remindAt: new Date('2026-07-27T12:10:00'), readAt: null, dismissedAt: null },
    })

    expect(deriveNotifications([activity], baseNow, false)[0].type).toBe('upcoming')
  })

  it('formats singular and plural unread count labels', () => {
    expect(getUnreadCountLabel(0)).toBe('Nenhuma notificação não lida')
    expect(getUnreadCountLabel(1)).toBe('1 notificação não lida')
    expect(getUnreadCountLabel(2)).toBe('2 notificações não lidas')
  })
})
