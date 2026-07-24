import type { Activity } from './entities'

function startOfLocalDay(date: Date): Date {
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  return day
}

export function isActivityScheduledBefore(activity: Activity, referenceDate = new Date()): boolean {
  if (activity.hasTime) {
    return activity.scheduledAt.getTime() < referenceDate.getTime()
  }

  return startOfLocalDay(activity.scheduledAt).getTime() < startOfLocalDay(referenceDate).getTime()
}

export function isActivityDelayed(activity: Activity, referenceDate = new Date()): boolean {
  if (activity.status === 'completed' || activity.status === 'cancelled') return false
  return isActivityScheduledBefore(activity, referenceDate)
}
