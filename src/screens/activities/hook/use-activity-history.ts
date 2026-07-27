import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getActivityUseCases } from '@/infrastructure/composition/activity-service'
import type { Activity, ActivityHistoryFilters } from '@/modules/activities/domain/entities'

const PAGE_SIZE = 10
const filters: ActivityHistoryFilters = { period: 'all', category: 'all' }
const useCases = getActivityUseCases()

export function useActivityHistory() {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const cursorRef = useRef<unknown | null>(null)
  const requestRef = useRef(0)

  const loadPage = useCallback(async (cursor: unknown | null = null) => {
    if (!uid) {
      setActivities([])
      setHasMore(false)
      setIsLoading(false)
      setIsLoadingMore(false)
      return
    }

    const requestId = ++requestRef.current
    const isFirstPage = cursor === null
    if (isFirstPage) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }
    setError(null)

    try {
      const page = await useCases.fetchCompletedActivitiesPage(uid, filters, cursor, PAGE_SIZE)
      if (requestId !== requestRef.current) return

      cursorRef.current = page.nextCursor
      setHasMore(Boolean(page.nextCursor))
      setActivities((current) => isFirstPage ? page.data : [...current, ...page.data])
    } catch (err) {
      if (requestId !== requestRef.current) return
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico.')
    } finally {
      if (requestId === requestRef.current) {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }
  }, [uid])

  useEffect(() => {
    cursorRef.current = null
    void loadPage(null)
    return () => {
      requestRef.current += 1
    }
  }, [loadPage])

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return
    void loadPage(cursorRef.current)
  }, [hasMore, isLoadingMore, loadPage])

  const refresh = useCallback(() => {
    cursorRef.current = null
    void loadPage(null)
  }, [loadPage])

  return {
    activities,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}
