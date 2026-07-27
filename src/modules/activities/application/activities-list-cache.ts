import type { Activity } from '../domain/entities'
import type { ActivityFilters } from '../domain/repositories'

const CACHE_TTL_MS = 2 * 60 * 1000
const PRELOAD_PAGE_SIZE = 10

interface CachedActivitiesList {
  activities: Activity[]
  nextCursor: unknown | null
  storedAt: number
}

const cache = new Map<string, CachedActivitiesList>()

type ActivitiesPageFetcher = {
  fetchActivitiesPage(
    uid: string,
    filters: ActivityFilters,
    cursor: unknown | null,
    pageSize: number
  ): Promise<{ data: Activity[]; nextCursor: unknown | null }>
}

export function getActivitiesListCacheKey(uid: string, filters: ActivityFilters): string {
  return JSON.stringify({
    uid,
    period: filters.period ?? 'all',
    status: filters.status ?? 'all',
    category: filters.category ?? 'all',
  })
}

export function readActivitiesListCache(uid: string, filters: ActivityFilters): CachedActivitiesList | null {
  const entry = cache.get(getActivitiesListCacheKey(uid, filters))
  if (!entry) return null
  if (Date.now() - entry.storedAt > CACHE_TTL_MS) {
    cache.delete(getActivitiesListCacheKey(uid, filters))
    return null
  }
  return entry
}

export function writeActivitiesListCache(
  uid: string,
  filters: ActivityFilters,
  activities: Activity[],
  nextCursor: unknown | null,
): void {
  cache.set(getActivitiesListCacheKey(uid, filters), {
    activities,
    nextCursor,
    storedAt: Date.now(),
  })
}

export async function preloadActivitiesList(uid: string, fetcher: ActivitiesPageFetcher): Promise<void> {
  const filters: ActivityFilters = {}
  if (readActivitiesListCache(uid, filters)) return

  try {
    const page = await fetcher.fetchActivitiesPage(uid, filters, null, PRELOAD_PAGE_SIZE)
    writeActivitiesListCache(uid, filters, page.data, page.nextCursor)
  } catch {
    // Preload is opportunistic; the screen will fetch normally if this fails.
  }
}
