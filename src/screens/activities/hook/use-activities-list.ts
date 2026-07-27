import { useState, useEffect, useRef, useCallback, useMemo, useDeferredValue } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getActivityUseCases } from '@/infrastructure/composition/activity-service'
import { readActivitiesListCache, writeActivitiesListCache } from '@/modules/activities/application/activities-list-cache'
import type { Activity } from '@/modules/activities/domain/entities'
import type { ActivityFilters } from '@/modules/activities/domain/repositories'

const PAGE_SIZE = 10

const useCases = getActivityUseCases()

function buildActivityFilters(period: PeriodFilter): ActivityFilters {
  if (period === 'all') return {}
  return { period }
}

export type PeriodFilter = 'all' | 'today' | 'upcoming' | 'inProgress' | 'completed' | 'overdue'

export interface ActivitiesListState {
  activities: Activity[]
  filteredGroups: { title: string; data: Activity[] }[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  search: string
  period: PeriodFilter
}

export function useActivitiesList() {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [hasMore, setHasMore] = useState(false)

  const cursorRef = useRef<unknown | null>(null)
  const requestRef = useRef(0)

  const loadPage = useCallback(async (cursor: unknown | null = null, keepCurrent = false) => {
    if (!uid) {
      setActivities([])
      setHasMore(false)
      setIsLoading(false)
      setIsLoadingMore(false)
      return
    }

    const requestId = ++requestRef.current
    const isFirstPage = cursor === null

    if (isFirstPage && !keepCurrent) {
      setIsLoading(true)
    } else if (!isFirstPage) {
      setIsLoadingMore(true)
    }
    setError(null)

    const filters = buildActivityFilters(period)

    try {
      const page = await useCases.fetchActivitiesPage(uid, filters, cursor, PAGE_SIZE)
      if (requestId !== requestRef.current) return

      cursorRef.current = page.nextCursor
      setHasMore(Boolean(page.nextCursor))
      setActivities((current) => {
        const nextActivities = isFirstPage ? page.data : [...current, ...page.data]
        writeActivitiesListCache(uid, filters, nextActivities, page.nextCursor)
        return nextActivities
      })
    } catch (err) {
      if (requestId !== requestRef.current) return
      if (!keepCurrent) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar atividades.')
      }
    } finally {
      if (requestId === requestRef.current) {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }
  }, [period, uid])

  useEffect(() => {
    cursorRef.current = null
    let hasCached = false
    if (uid) {
      const filters = buildActivityFilters(period)
      const cached = readActivitiesListCache(uid, filters)
      if (cached) {
        hasCached = true
        setActivities(cached.activities)
        setHasMore(Boolean(cached.nextCursor))
        cursorRef.current = cached.nextCursor
        setIsLoading(false)
      }
    }
    void loadPage(null, hasCached)
    return () => {
      requestRef.current += 1
    }
  }, [loadPage])

  const clearSearch = useCallback(() => setSearch(''), [])
  const clearFilters = useCallback(() => {
    setPeriod('all')
    setSearch('')
  }, [])

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return
    void loadPage(cursorRef.current)
  }, [hasMore, isLoadingMore, loadPage])

  const refresh = useCallback(() => {
    cursorRef.current = null
    void loadPage(null)
  }, [loadPage])

  const filteredGroups = useMemo(() => {
    let filtered = activities

    if (deferredSearch.trim()) {
      const q = deferredSearch.trim().toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          a.category.toLowerCase().includes(q),
      )
    }

    const now = new Date()

    if (period === 'overdue') {
      filtered = filtered.filter((a) => a.scheduledAt < now)
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
  }, [activities, deferredSearch, period])

  return {
    activities,
    filteredGroups,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    search,
    period,
    setSearch,
    setPeriod,
    loadMore,
    refresh,
    clearSearch,
    clearFilters,
  }
}
