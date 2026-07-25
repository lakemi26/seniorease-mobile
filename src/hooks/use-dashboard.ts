import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { createFirebaseActivityRepository } from '@/modules/activities/infrastructure/repositories/firebase-activity.repository'
import { createActivityUseCases } from '@/modules/activities/application/use-cases'
import type { Activity, WeeklySummary } from '@/modules/activities/domain/entities'
import { startOfDay, endOfDay } from '@/shared/utils/date'

export interface DashboardData {
  nextActivity: Activity | null
  todayActivities: Activity[]
  inProgressActivities: Activity[]
  recentCompleted: Activity[]
  weeklySummary: WeeklySummary | null
  reminders: Activity[]
}

export function useDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>({
    nextActivity: null,
    todayActivities: [],
    inProgressActivities: [],
    recentCompleted: [],
    weeklySummary: null,
    reminders: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const unsubRef = useRef<(() => void)[]>([])
  const useCasesRef = useRef(createActivityUseCases(createFirebaseActivityRepository()))
  const mountedRef = useRef(true)

  const cleanup = useCallback(() => {
    unsubRef.current.forEach((unsub) => {
      try {
        unsub()
      } catch {
        /* ignore */
      }
    })
    unsubRef.current = []
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const uid = user?.uid

    if (!uid) {
      cleanup()
      setData({
        nextActivity: null,
        todayActivities: [],
        inProgressActivities: [],
        recentCompleted: [],
        weeklySummary: null,
        reminders: [],
      })
      setIsLoading(false)
      setError(null)
      return cleanup
    }

    setIsLoading(true)
    setError(null)

    const useCases = useCasesRef.current
    const unsubs: (() => void)[] = []
    const update = (partial: Partial<DashboardData>) => {
      if (mountedRef.current) {
        setData((prev) => ({ ...prev, ...partial }))
      }
    }

    useCases
      .getWeeklySummary(uid)
      .then((summary) => update({ weeklySummary: summary }))
      .catch(() => {})

    unsubs.push(
      useCases.subscribeToNextActivity(
        uid,
        (activity) => {
          update({ nextActivity: activity })
          setIsLoading(false)
        },
        () => {
          setError('Não foi possível carregar o início.')
          setIsLoading(false)
        },
      ),
    )

    unsubs.push(
      useCases.subscribeToTodayActivities(
        uid,
        startOfDay(new Date()),
        endOfDay(new Date()),
        (activities) => update({ todayActivities: activities }),
        () => {},
      ),
    )

    unsubs.push(
      useCases.subscribeToInProgressActivities(
        uid,
        (activities) => update({ inProgressActivities: activities }),
        () => {},
      ),
    )

    unsubs.push(
      useCases.subscribeToRecentCompletedActivities(
        uid,
        (activities) => update({ recentCompleted: activities }),
        () => {},
      ),
    )

    unsubs.push(
      useCases.subscribeToDueReminders(
        uid,
        new Date(),
        (activities) => update({ reminders: activities }),
        () => {},
      ),
    )

    unsubRef.current = unsubs

    return () => {
      unsubs.forEach((unsub) => {
        try {
          unsub()
        } catch {
          /* ignore */
        }
      })
    }
  }, [user?.uid])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const refetch = useCallback(() => {
    if (!user?.uid) return
    useCasesRef.current
      .getWeeklySummary(user.uid)
      .then((summary) => {
        if (mountedRef.current) {
          setData((prev) => ({ ...prev, weeklySummary: summary }))
        }
      })
      .catch(() => {})
  }, [user?.uid])

  const sortTodayActivities = useCallback((activities: Activity[]) => {
    const priority: Record<string, number> = {
      inProgress: 0,
      pending: 1,
      completed: 2,
    }
    return [...activities].sort((a, b) => {
      const pa = priority[a.status] ?? 1
      const pb = priority[b.status] ?? 1
      if (pa !== pb) return pa - pb
      if (a.hasTime && b.hasTime) return a.scheduledAt.getTime() - b.scheduledAt.getTime()
      if (a.hasTime) return -1
      if (b.hasTime) return 1
      return a.scheduledAt.getTime() - b.scheduledAt.getTime()
    })
  }, [])

  return {
    ...data,
    todayActivitiesSorted: sortTodayActivities(data.todayActivities),
    isLoading,
    error,
    refetch,
  }
}
