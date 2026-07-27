import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getActivityUseCases } from '@/infrastructure/composition/activity-service'
import type { Activity } from '@/modules/activities/domain/entities'
import {
  formatDateFull,
  formatMonthYear,
  isSameDay,
  isToday,
  startOfMonth,
  startOfNextMonth,
  startOfWeek,
} from '@/shared/utils/date'

const useCases = getActivityUseCases()

export interface CalendarDay {
  date: Date
  key: string
  dayNumber: number
  isCurrentMonth: boolean
  isSelected: boolean
  isToday: boolean
  activities: Activity[]
}

export function toLocalDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function startOfLocalDay(date: Date): Date {
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  return day
}

export function sortAgendaActivities(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (a.status !== 'completed' && b.status === 'completed') return -1
    if (a.hasTime && !b.hasTime) return -1
    if (!a.hasTime && b.hasTime) return 1
    if (a.hasTime && b.hasTime) return a.scheduledAt.getTime() - b.scheduledAt.getTime()
    return a.title.localeCompare(b.title, 'pt-BR')
  })
}

export function useCalendar() {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => startOfLocalDay(new Date()))
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) {
      setActivities([])
      setIsLoading(false)
      return
    }

    const startDate = startOfMonth(visibleMonth)
    const endDate = startOfNextMonth(visibleMonth)

    setIsLoading(true)
    setError(null)

    const unsubscribe = useCases.subscribeToCalendarActivities(
      uid,
      startDate,
      endDate,
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
  }, [uid, visibleMonth])

  const activitiesByDay = useMemo(() => {
    const groups = new Map<string, Activity[]>()
    for (const activity of activities) {
      const key = toLocalDayKey(activity.scheduledAt)
      groups.set(key, [...(groups.get(key) ?? []), activity])
    }
    return groups
  }, [activities])

  const days = useMemo<CalendarDay[]>(() => {
    const monthStart = startOfMonth(visibleMonth)
    const gridStart = startOfWeek(monthStart)

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + index)
      const key = toLocalDayKey(date)

      return {
        date,
        key,
        dayNumber: date.getDate(),
        isCurrentMonth:
          date.getMonth() === visibleMonth.getMonth() &&
          date.getFullYear() === visibleMonth.getFullYear(),
        isSelected: isSameDay(date, selectedDate),
        isToday: isToday(date),
        activities: activitiesByDay.get(key) ?? [],
      }
    })
  }, [activitiesByDay, selectedDate, visibleMonth])

  const selectedActivities = useMemo(
    () => sortAgendaActivities(activities.filter((activity) => isSameDay(activity.scheduledAt, selectedDate))),
    [activities, selectedDate],
  )

  const goToPreviousMonth = useCallback(() => {
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)
    setVisibleMonth(next)
    setSelectedDate(next)
  }, [visibleMonth])

  const goToNextMonth = useCallback(() => {
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
    setVisibleMonth(next)
    setSelectedDate(next)
  }, [visibleMonth])

  const goToToday = useCallback(() => {
    const today = startOfLocalDay(new Date())
    setVisibleMonth(startOfMonth(today))
    setSelectedDate(today)
  }, [])

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(startOfLocalDay(date))
    if (date.getMonth() !== visibleMonth.getMonth() || date.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(startOfMonth(date))
    }
  }, [visibleMonth])

  const retry = useCallback(() => {
    setVisibleMonth((current) => new Date(current))
  }, [])

  return {
    days,
    selectedDate,
    selectedDateLabel: formatDateFull(selectedDate),
    selectedActivities,
    monthLabel: formatMonthYear(visibleMonth),
    isLoading,
    error,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
    retry,
  }
}
