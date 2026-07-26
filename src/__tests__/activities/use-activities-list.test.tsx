import { renderHook, act } from '@testing-library/react-native'
import type { Activity } from '@/modules/activities/domain/entities'

const mockFn = jest.fn()

const mockFetchActivitiesPage = jest.fn()

jest.mock('@/contexts/auth-context', () => ({
  get useAuth() { return () => mockFn() },
  AuthProvider: ({ children }: any) => children,
}))

jest.mock('@/modules/activities/application/use-cases', () => ({
  createActivityUseCases: () => ({
    getActivity: jest.fn(),
    deleteActivity: jest.fn(),
    createActivity: jest.fn(),
    updateActivity: jest.fn(),
    get fetchActivitiesPage() { return mockFetchActivitiesPage },
  }),
}))

jest.mock('@/modules/activities/infrastructure/repositories/firebase-activity.repository', () => ({
  createFirebaseActivityRepository: () => ({}),
}))

import { useActivitiesList } from '@/screens/activities/hook/use-activities-list'

function makeActivity(id: string, overrides: Partial<Activity> = {}): Activity {
  return {
    id,
    userId: 'user-1',
    title: `Atividade ${id}`,
    description: null,
    category: 'health',
    scheduledAt: new Date(),
    hasTime: false,
    priority: 'medium',
    status: 'pending',
    steps: [],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function mockAuth(overrides = {}) {
  mockFn.mockReturnValue({
    user: { uid: 'test-uid' },
    ...overrides,
  })
}

describe('useActivitiesList', () => {
  beforeEach(() => {
    mockFn.mockReset()
    mockFetchActivitiesPage.mockReset()
    mockFetchActivitiesPage.mockResolvedValue({ data: [], nextCursor: null })
    mockAuth()
  })

  it('starts loading and fetches first page on mount', async () => {
    mockFetchActivitiesPage.mockReturnValueOnce(new Promise(() => {}))
    const { result, unmount } = await renderHook(() => useActivitiesList())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.activities).toEqual([])
    expect(result.current.error).toBeNull()
    expect(mockFetchActivitiesPage).toHaveBeenCalledWith('test-uid', {}, null, 10)

    unmount()
  })

  it('updates activities when first page loads', async () => {
    const activities = [makeActivity('act-1'), makeActivity('act-2')]
    mockFetchActivitiesPage.mockResolvedValueOnce({ data: activities, nextCursor: null })

    const { result } = await renderHook(() => useActivitiesList())

    await act(async () => {})

    expect(result.current.isLoading).toBe(false)
    expect(result.current.activities).toHaveLength(2)
  })

  it('returns empty when user not authenticated', async () => {
    mockFn.mockReturnValue({ user: null })
    const { result } = await renderHook(() => useActivitiesList())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.activities).toEqual([])
  })

  it('filters by search query', async () => {
    const activities = [
      makeActivity('act-1', { title: 'Consulta médica' }),
      makeActivity('act-2', { title: 'Compras mercado' }),
    ]
    mockFetchActivitiesPage.mockResolvedValueOnce({ data: activities, nextCursor: null })

    const { result } = await renderHook(() => useActivitiesList())

    await act(async () => {})
    await act(async () => { result.current.setSearch('consulta') })

    expect(result.current.filteredGroups.flatMap((g: any) => g.data)).toHaveLength(1)
  })

  it('fetches a new page when period changes', async () => {
    const { result } = await renderHook(() => useActivitiesList())

    await act(async () => { result.current.setPeriod('today') })
    await act(async () => {})

    expect(mockFetchActivitiesPage).toHaveBeenLastCalledWith('test-uid', { period: 'today' }, null, 10)
  })

  it('hasMore when the page returns a cursor', async () => {
    mockFetchActivitiesPage.mockResolvedValueOnce({ data: [makeActivity('act-1')], nextCursor: 'cursor-1' })

    const { result } = await renderHook(() => useActivitiesList())
    await act(async () => {})
    expect(result.current.hasMore).toBe(true)
  })

  it('loadMore fetches and appends the next page', async () => {
    mockFetchActivitiesPage
      .mockResolvedValueOnce({ data: [makeActivity('act-1')], nextCursor: 'cursor-1' })
      .mockResolvedValueOnce({ data: [makeActivity('act-2')], nextCursor: null })

    const { result } = await renderHook(() => useActivitiesList())

    await act(async () => {})
    await act(async () => { result.current.loadMore() })
    await act(async () => {})

    expect(mockFetchActivitiesPage).toHaveBeenLastCalledWith('test-uid', {}, 'cursor-1', 10)
    expect(result.current.activities.map((a) => a.id)).toEqual(['act-1', 'act-2'])
  })

  it('clearFilters resets period and search', async () => {
    const { result } = await renderHook(() => useActivitiesList())

    await act(async () => { result.current.setSearch('teste') })
    await act(async () => { result.current.setPeriod('completed') })
    await act(async () => { result.current.clearFilters() })

    expect(result.current.search).toBe('')
    expect(result.current.period).toBe('all')
  })
})
