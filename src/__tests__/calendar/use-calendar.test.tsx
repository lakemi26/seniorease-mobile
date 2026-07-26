import { act, renderHook, waitFor } from '@testing-library/react-native'
import type { Activity } from '@/modules/activities/domain/entities'

let mockUseAuth: jest.Mock
const mockCleanup = jest.fn()
const mockSubscribeToCalendarActivities = jest.fn()
let onCalendarData: ((activities: Activity[]) => void) | null = null
let onCalendarError: ((error: Error) => void) | null = null

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock('@/modules/activities/application/use-cases', () => ({
  createActivityUseCases: () => ({
    get subscribeToCalendarActivities() { return mockSubscribeToCalendarActivities },
  }),
}))

jest.mock('@/modules/activities/infrastructure/repositories/firebase-activity.repository', () => ({
  createFirebaseActivityRepository: () => ({}),
}))

import { sortAgendaActivities, toLocalDayKey, useCalendar } from '@/screens/calendar/hook/use-calendar'

function makeActivity(id: string, overrides: Partial<Activity> = {}): Activity {
  return {
    id,
    userId: 'user-1',
    title: `Atividade ${id}`,
    description: null,
    category: 'health',
    scheduledAt: new Date(2026, 6, 24, 9, 0, 0),
    hasTime: true,
    status: 'pending',
    priority: 'medium',
    steps: [],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: null,
    createdAt: new Date(2026, 6, 1),
    updatedAt: new Date(2026, 6, 1),
    ...overrides,
  }
}

describe('useCalendar', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2026, 6, 24, 10, 0, 0))
    mockUseAuth = jest.fn(() => ({ user: { uid: 'user-1' } }))
    mockCleanup.mockClear()
    mockSubscribeToCalendarActivities.mockReset()
    onCalendarData = null
    onCalendarError = null
    mockSubscribeToCalendarActivities.mockImplementation(
      (_uid: string, _start: Date, _end: Date, onData: (activities: Activity[]) => void, onError: (error: Error) => void) => {
        onCalendarData = onData
        onCalendarError = onError
        return mockCleanup
      },
    )
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('starts on the current month', async () => {
    const { result } = await renderHook(() => useCalendar())
    expect(result.current.monthLabel).toBe('julho de 2026')
    expect(mockSubscribeToCalendarActivities).toHaveBeenCalledWith(
      'user-1',
      new Date(2026, 6, 1),
      new Date(2026, 7, 1),
      expect.any(Function),
      expect.any(Function),
    )
  })

  it('goes to previous and next month', async () => {
    const { result } = await renderHook(() => useCalendar())
    await act(async () => result.current.goToPreviousMonth())
    await waitFor(() => expect(result.current.monthLabel).toBe('junho de 2026'))
    await act(async () => result.current.goToNextMonth())
    await waitFor(() => expect(result.current.monthLabel).toBe('julho de 2026'))
  })

  it('changes year when moving across January', async () => {
    jest.setSystemTime(new Date(2026, 0, 15, 10, 0, 0))
    const { result } = await renderHook(() => useCalendar())
    await waitFor(() => expect(result.current).not.toBeNull())
    await act(async () => result.current.goToPreviousMonth())
    await waitFor(() => expect(result.current.monthLabel).toBe('dezembro de 2025'))
  })

  it('returns to today', async () => {
    const { result } = await renderHook(() => useCalendar())
    await waitFor(() => expect(result.current).not.toBeNull())
    await act(async () => result.current.goToNextMonth())
    await act(async () => result.current.goToToday())
    await waitFor(() => expect(result.current.monthLabel).toBe('julho de 2026'))
    expect(result.current.selectedDateLabel).toContain('24 de julho de 2026')
  })

  it('selects a date', async () => {
    const { result } = await renderHook(() => useCalendar())
    await waitFor(() => expect(result.current).not.toBeNull())
    await act(async () => result.current.selectDate(new Date(2026, 6, 10)))
    await waitFor(() => expect(result.current.selectedDateLabel).toContain('10 de julho de 2026'))
  })

  it('marks today and outside month days', async () => {
    const { result } = await renderHook(() => useCalendar())
    await waitFor(() => expect(result.current).not.toBeNull())
    expect(result.current.days).toHaveLength(42)
    expect(result.current.days.some((day) => day.isToday && day.dayNumber === 24)).toBe(true)
    expect(result.current.days.some((day) => !day.isCurrentMonth)).toBe(true)
  })

  it('returns empty selected day when no activities are delivered', async () => {
    const { result } = await renderHook(() => useCalendar())
    await waitFor(() => expect(onCalendarData).toEqual(expect.any(Function)))
    await act(async () => onCalendarData!([]))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.selectedActivities).toEqual([])
  })

  it('keeps activities with and without time for the selected day', async () => {
    const { result } = await renderHook(() => useCalendar())
    await waitFor(() => expect(onCalendarData).toEqual(expect.any(Function)))
    await act(async () => onCalendarData!([
      makeActivity('with-time', { hasTime: true, scheduledAt: new Date(2026, 6, 24, 8, 30) }),
      makeActivity('without-time', { hasTime: false, scheduledAt: new Date(2026, 6, 24, 0, 0) }),
    ]))
    await waitFor(() => expect(result.current.selectedActivities.map((activity) => activity.id)).toEqual(['with-time', 'without-time']))
  })

  it('sorts timed activities first, untimed after, and completed last', () => {
    const sorted = sortAgendaActivities([
      makeActivity('done', { status: 'completed', scheduledAt: new Date(2026, 6, 24, 7, 0), hasTime: true }),
      makeActivity('no-time', { scheduledAt: new Date(2026, 6, 24, 0, 0), hasTime: false }),
      makeActivity('late', { scheduledAt: new Date(2026, 6, 24, 11, 0), hasTime: true }),
      makeActivity('early', { scheduledAt: new Date(2026, 6, 24, 8, 0), hasTime: true }),
    ])
    expect(sorted.map((activity) => activity.id)).toEqual(['early', 'late', 'no-time', 'done'])
  })

  it('uses local date parts for day keys', () => {
    const date = new Date(2026, 6, 24, 23, 30)
    expect(toLocalDayKey(date)).toBe('2026-6-24')
  })

  it('sets error state', async () => {
    const { result } = await renderHook(() => useCalendar())
    await waitFor(() => expect(onCalendarError).toEqual(expect.any(Function)))
    await act(async () => onCalendarError!(new Error('Falha de rede')))
    await waitFor(() => expect(result.current.error).toBe('Falha de rede'))
    expect(result.current.isLoading).toBe(false)
  })

  it('cleans up listeners', async () => {
    const { unmount } = await renderHook(() => useCalendar())
    await waitFor(() => expect(mockSubscribeToCalendarActivities).toHaveBeenCalled())
    await act(async () => unmount())
    await waitFor(() => expect(mockCleanup).toHaveBeenCalledTimes(1))
  })
})
