import { renderHook, act } from '@testing-library/react-native'
import type { Activity } from '@/modules/activities/domain/entities'

const mockFn = jest.fn()
let mockSubscribeCallback: ((data: Activity[]) => void) | null = null

const mockSubscribeByUser = jest.fn()

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
    get subscribeByUser() { return mockSubscribeByUser },
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
    mockSubscribeByUser.mockReset()
    mockSubscribeByUser.mockImplementation((_uid: string, _filters: any, onData: (data: Activity[]) => void, _onError: (err: Error) => void) => {
      mockSubscribeCallback = onData
      return jest.fn()
    })
    mockAuth()
    mockSubscribeCallback = null
  })

  it('starts loading and subscribes on mount', async () => {
    const { result } = await renderHook(() => useActivitiesList())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.activities).toEqual([])
    expect(result.current.error).toBeNull()
    expect(mockSubscribeByUser).toHaveBeenCalled()
  })

  it('updates activities when subscription delivers data', async () => {
    const { result } = await renderHook(() => useActivitiesList())

    const activities = [makeActivity('act-1'), makeActivity('act-2')]
    await act(async () => { mockSubscribeCallback!(activities) })

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
    const { result } = await renderHook(() => useActivitiesList())

    const activities = [
      makeActivity('act-1', { title: 'Consulta médica' }),
      makeActivity('act-2', { title: 'Compras mercado' }),
    ]
    await act(async () => { mockSubscribeCallback!(activities) })
    await act(async () => { result.current.setSearch('consulta') })

    expect(result.current.filteredGroups.flatMap((g: any) => g.data)).toHaveLength(1)
  })

  it('filters by period', async () => {
    const { result } = await renderHook(() => useActivitiesList())

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const activities = [
      makeActivity('act-1', { scheduledAt: today, status: 'pending' }),
      makeActivity('act-2', { scheduledAt: yesterday, status: 'pending' }),
    ]
    await act(async () => { mockSubscribeCallback!(activities) })
    await act(async () => { result.current.setPeriod('today') })

    const allFiltered = result.current.filteredGroups.flatMap((g: any) => g.data)
    expect(allFiltered.some((a: any) => a.id === 'act-1')).toBe(true)
  })

  it('hasMore when visible count less than total', async () => {
    const { result } = await renderHook(() => useActivitiesList())

    const items = Array.from({ length: 15 }, (_, i) => makeActivity(`act-${i}`))
    await act(async () => { mockSubscribeCallback!(items) })

    expect(result.current.hasMore).toBe(true)
    expect(result.current.visibleCount).toBe(10)
  })

  it('loadMore increases visible count', async () => {
    const { result } = await renderHook(() => useActivitiesList())

    const items = Array.from({ length: 15 }, (_, i) => makeActivity(`act-${i}`))
    await act(async () => { mockSubscribeCallback!(items) })
    await act(async () => { result.current.loadMore() })

    expect(result.current.visibleCount).toBe(20)
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
