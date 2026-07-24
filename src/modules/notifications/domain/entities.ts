export type NotificationStatus = 'upcoming' | 'due' | 'overdue'

export interface ReminderNotification {
  id: string
  activityId: string
  title: string
  message: string
  remindAt: Date
  scheduledAt: Date
  readAt: Date | null
  dismissedAt: Date | null
  status: NotificationStatus
}

export const OVERDUE_WINDOW_MS = 2 * 60 * 60 * 1000
