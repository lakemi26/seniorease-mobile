import type { Activity } from '@/modules/activities/domain/entities'
import { formatTime, isSameDay } from '@/shared/utils/date'
import {
  REMINDER_NEAR_WINDOW_MS,
  UPCOMING_ACTIVITY_WINDOW_MS,
  type ActivityNotification,
  type NotificationType,
} from './entities'

const activeStatuses = new Set<Activity['status']>(['pending', 'inProgress'])

function isActive(activity: Activity): boolean {
  return activeStatuses.has(activity.status)
}

function typeLabel(type: NotificationType): string {
  switch (type) {
    case 'overdue':
      return 'Atrasada'
    case 'reminder':
      return 'Lembrete'
    case 'today':
      return 'Hoje'
    case 'upcoming':
      return 'Próxima'
  }
}

function sortRank(type: NotificationType, readAt: Date | null): number {
  if (readAt) return 5
  switch (type) {
    case 'overdue':
      return 1
    case 'reminder':
      return 2
    case 'today':
      return 3
    case 'upcoming':
      return 4
  }
}

function descriptionFor(activity: Activity, type: NotificationType): string {
  switch (type) {
    case 'overdue':
      return `A atividade ${activity.title} está atrasada.`
    case 'reminder':
      return `Está quase na hora de ${activity.title}.`
    case 'today':
      if (activity.hasTime) {
        return `Você tem ${activity.title} hoje às ${formatTime(activity.scheduledAt)}.`
      }
      return `Você tem ${activity.title} para hoje, sem horário definido.`
    case 'upcoming':
      return `A atividade ${activity.title} está chegando.`
  }
}

function createNotification(
  activity: Activity,
  type: NotificationType,
  relevantAt: Date,
  now: Date,
): ActivityNotification {
  const readAt = activity.reminder.readAt
  return {
    id: `${type}-${activity.id}`,
    activityId: activity.id,
    activity,
    type,
    title: activity.title,
    description: descriptionFor(activity, type),
    typeLabel: typeLabel(type),
    relevantAt,
    scheduledAt: activity.scheduledAt,
    readAt,
    dismissedAt: activity.reminder.dismissedAt,
    isRead: Boolean(readAt),
    isToday: isSameDay(relevantAt, now),
    sortRank: sortRank(type, readAt),
  }
}

export function deriveNotificationFromActivity(
  activity: Activity,
  now = new Date(),
  includeReminders = true,
): ActivityNotification | null {
  if (!isActive(activity)) return null
  if (activity.reminder.dismissedAt) return null

  if (activity.scheduledAt < now) {
    return createNotification(activity, 'overdue', activity.scheduledAt, now)
  }

  const remindAt = activity.reminder.remindAt
  if (
    includeReminders &&
    activity.reminder.enabled &&
    remindAt &&
    remindAt.getTime() <= now.getTime() + REMINDER_NEAR_WINDOW_MS
  ) {
    return createNotification(activity, 'reminder', remindAt, now)
  }

  if (isSameDay(activity.scheduledAt, now) && activity.status === 'pending') {
    return createNotification(activity, 'today', activity.scheduledAt, now)
  }

  if (activity.scheduledAt.getTime() <= now.getTime() + UPCOMING_ACTIVITY_WINDOW_MS) {
    return createNotification(activity, 'upcoming', activity.scheduledAt, now)
  }

  return null
}

export function deriveNotifications(
  activities: Activity[],
  now = new Date(),
  includeReminders = true,
): ActivityNotification[] {
  return activities
    .map((activity) => deriveNotificationFromActivity(activity, now, includeReminders))
    .filter((notification): notification is ActivityNotification => Boolean(notification))
    .sort(sortNotifications)
}

export function sortNotifications(a: ActivityNotification, b: ActivityNotification): number {
  if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank
  return a.relevantAt.getTime() - b.relevantAt.getTime()
}

export function getUnreadCountLabel(count: number): string {
  if (count === 0) return 'Nenhuma notificação não lida'
  if (count === 1) return '1 notificação não lida'
  return `${count} notificações não lidas`
}
