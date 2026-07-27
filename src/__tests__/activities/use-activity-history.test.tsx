import { renderHook, act, waitFor } from '@testing-library/react-native'
import type { Activity } from '@/modules/activities/domain/entities'

const mockUseAuth = jest.fn()
const mockFetchCompletedActivitiesPage = jest.fn()

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock('@/infrastructure/composition/activity-service', () => ({
  getActivityUseCases: () => ({
    get fetchCompletedActivitiesPage() { return mockFetchCompletedActivitiesPage },
  }),
}))

import { useActivityHistory } from '@/screens/activities/hook/use-activity-history'

function makeActivity(id: string, completedAt = new Date('2026-07-27T12:00:00')): Activity {
  return {
    id,
    userId: 'user-1',
    title: `Atividade ${id}`,
    description: null,
    category: 'health',
    scheduledAt: new Date('2026-07-27T10:00:00'),
    hasTime: true,
    status: 'completed',
    priority: 'medium',
    steps: [],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt,
    createdAt: completedAt,
    updatedAt: completedAt,
  }
}

describe('useActivityHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { uid: 'user-1' } })
    mockFetchCompletedActivitiesPage.mockResolvedValue({ data: [], nextCursor: null })
  })

  it('loads completed activities from Firebase pagination', async () => {
    const activities = [makeActivity('a'), makeActivity('b')]
    mockFetchCompletedActivitiesPage.mockResolvedValue({ data: activities, nextCursor: 'cursor-1' })

    const { result } = await renderHook(() => useActivityHistory())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.activities).toEqual(activities)
    expect(result.current.hasMore).toBe(true)
    expect(mockFetchCompletedActivitiesPage).toHaveBeenCalledWith(
      'user-1',
      { period: 'all', category: 'all' },
      null,
      10,
    )
  })

  it('loads the next completed page and appends it', async () => {
    mockFetchCompletedActivitiesPage
      .mockResolvedValueOnce({ data: [makeActivity('a')], nextCursor: 'cursor-1' })
      .mockResolvedValueOnce({ data: [makeActivity('b')], nextCursor: null })

    const { result } = await renderHook(() => useActivityHistory())

    await waitFor(() => expect(result.current.hasMore).toBe(true))
    await act(async () => { result.current.loadMore() })
    await waitFor(() => expect(result.current.isLoadingMore).toBe(false))

    expect(result.current.activities.map((activity) => activity.id)).toEqual(['a', 'b'])
    expect(result.current.hasMore).toBe(false)
    expect(mockFetchCompletedActivitiesPage).toHaveBeenLastCalledWith(
      'user-1',
      { period: 'all', category: 'all' },
      'cursor-1',
      10,
    )
  })

  it('does not query Firebase without an authenticated user', async () => {
    mockUseAuth.mockReturnValue({ user: null })

    const { result } = await renderHook(() => useActivityHistory())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.activities).toEqual([])
    expect(mockFetchCompletedActivitiesPage).not.toHaveBeenCalled()
  })
})
