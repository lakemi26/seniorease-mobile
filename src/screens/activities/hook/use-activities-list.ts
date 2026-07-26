import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { createFirebaseActivityRepository } from '@/modules/activities/infrastructure/repositories/firebase-activity.repository'
import { createActivityUseCases } from '@/modules/activities/application/use-cases'
import type { Activity } from '@/modules/activities/domain/entities'
import type { ActivityFilters, Unsubscribe } from '@/modules/activities/domain/repositories'

const PAGE_SIZE = 10

const repo = createFirebaseActivityRepository()
const useCases = createActivityUseCases(repo)

export type PeriodFilter = 'all' | 'today' | 'upcoming' | 'inProgress' | 'completed'

export interface ActivitiesListState {
  activities: Activity[]
  filteredGroups: { title: string; data: Activity[] }[]
  isLoading: boolean
  error: string | null
  visibleCount: number
  hasMore: boolean
  search: string
  period: PeriodFilter
}

export function useActivitiesList() {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const unsubscribeRef = useRef<Unsubscribe | null>(null)

  useEffect(() => {
    if (!uid) {
      setActivities([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setVisibleCount(PAGE_SIZE)

    const filters: ActivityFilters = {}
    const unsub = useCases.subscribeByUser(
      uid,
      filters,
      (data) => {
        setActivities(data)
        setIsLoading(false)
      },
      (err) => {
        setError(err.message)
        setIsLoading(false)
      },
    )

    unsubscribeRef.current = unsub

    return () => {
      unsub()
      unsubscribeRef.current = null
    }
  }, [uid])

  const clearSearch = useCallback(() => setSearch(''), [])
  const clearFilters = useCallback(() => {
    setPeriod('all')
    setSearch('')
  }, [])

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }, [])

  const filteredGroups = useMemo(() => {
    let filtered = activities

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          a.category.toLowerCase().includes(q),
      )
    }

    if (period === 'inProgress') {
      filtered = filtered.filter((a) => a.status === 'inProgress')
    } else if (period === 'completed') {
      filtered = filtered.filter((a) => a.status === 'completed')
    } else if (period === 'today') {
      const now = new Date()
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter((a) => a.scheduledAt >= start && a.scheduledAt <= end)
    } else if (period === 'upcoming') {
      const now = new Date()
      filtered = filtered.filter((a) => a.scheduledAt > now && a.status !== 'completed' && a.status !== 'cancelled')
    }

    const inProgress = filtered.filter((a) => a.status === 'inProgress')
    const pendingWithTime = filtered.filter(
      (a) => a.status === 'pending' && a.hasTime,
    )
    const pendingWithoutTime = filtered.filter(
      (a) => a.status === 'pending' && !a.hasTime,
    )
    const completed = filtered.filter((a) => a.status === 'completed')

    const sortByScheduledAt = (a: Activity, b: Activity) =>
      a.scheduledAt.getTime() - b.scheduledAt.getTime()

    inProgress.sort(sortByScheduledAt)
    pendingWithTime.sort(sortByScheduledAt)
    pendingWithoutTime.sort(sortByScheduledAt)
    completed.sort(sortByScheduledAt)

    const groups: { title: string; data: Activity[] }[] = []
    if (inProgress.length > 0) groups.push({ title: 'Em andamento', data: inProgress })
    if (pendingWithTime.length > 0) groups.push({ title: 'A fazer', data: pendingWithTime })
    if (pendingWithoutTime.length > 0) groups.push({ title: 'Sem horário', data: pendingWithoutTime })
    if (completed.length > 0 && period === 'completed') groups.push({ title: 'Concluídas', data: completed })

    return groups
  }, [activities, search, period])

  const flatFiltered = useMemo(
    () => filteredGroups.flatMap((g) => g.data),
    [filteredGroups],
  )

  const hasMore = visibleCount < flatFiltered.length

  return {
    activities,
    filteredGroups,
    visibleCount,
    hasMore,
    isLoading,
    error,
    search,
    period,
    setSearch,
    setPeriod,
    loadMore,
    clearSearch,
    clearFilters,
  }
}
