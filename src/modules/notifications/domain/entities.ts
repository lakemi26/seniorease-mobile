import type { Activity } from '@/modules/activities/domain/entities'

export type NotificationType = 'reminder' | 'overdue' | 'today' | 'upcoming'

export interface ActivityNotification {
  id: string
  activityId: string
  activity: Activity
  type: NotificationType
  title: string
  description: string
  typeLabel: string
  relevantAt: Date
  scheduledAt: Date
  readAt: Date | null
  dismissedAt: Date | null
  isRead: boolean
  isToday: boolean
  sortRank: number
}

export type NotificationFilter = 'all' | 'unread'

export const UPCOMING_ACTIVITY_WINDOW_MS = 24 * 60 * 60 * 1000
export const REMINDER_NEAR_WINDOW_MS = 30 * 60 * 1000
