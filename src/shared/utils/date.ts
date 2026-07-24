import type { Activity } from '@/modules/activities/domain/entities'

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function startOfNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateWeekday(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function formatDateFull(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export interface DayGroup {
  date: Date
  label: string
  activities: Activity[]
}

export function groupByDay(activities: Activity[]): DayGroup[] {
  const groups = new Map<string, DayGroup>()

  for (const activity of activities) {
    const key = `${activity.scheduledAt.getFullYear()}-${activity.scheduledAt.getMonth()}-${activity.scheduledAt.getDate()}`
    if (!groups.has(key)) {
      groups.set(key, {
        date: activity.scheduledAt,
        label: formatDateWeekday(activity.scheduledAt),
        activities: [],
      })
    }
    groups.get(key)!.activities.push(activity)
  }

  return Array.from(groups.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )
}

export function isReminderOverdue(remindAt: Date): boolean {
  return remindAt < new Date()
}
