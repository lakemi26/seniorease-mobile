import { renderHook, act, waitFor } from '@testing-library/react-native'
import type { Activity } from '@/modules/activities/domain/entities'

const mockFn = jest.fn()
const mockStartActivity = jest.fn()
const mockCompleteStep = jest.fn()
const mockReopenStep = jest.fn()
const mockCompleteActivity = jest.fn()
const mockReopenActivity = jest.fn()
const mockGetActivity = jest.fn()

jest.mock('@/contexts/auth-context', () => ({
  get useAuth() { return () => mockFn() },
  AuthProvider: ({ children }: any) => children,
}))

jest.mock('@/modules/activities/application/use-cases', () => ({
  createActivityUseCases: () => ({
    get startActivity() { return mockStartActivity },
    get completeActivityStep() { return mockCompleteStep },
    get reopenActivityStep() { return mockReopenStep },
    get completeActivity() { return mockCompleteActivity },
    get reopenActivity() { return mockReopenActivity },
    get getActivity() { return mockGetActivity },
  }),
}))

jest.mock('@/modules/activities/infrastructure/repositories/firebase-activity.repository', () => ({
  createFirebaseActivityRepository: () => ({}),
}))

import { useActivityExecution } from '@/screens/activities/hook/use-activity-execution'

function makeStep(id: string, order: number, completed = false): Activity['steps'][number] {
  return { id, title: `Step ${id}`, order, completed, completedAt: completed ? new Date() : null }
}

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'act-1',
    userId: 'user-1',
    title: 'Test Activity',
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

function mockAuth() {
  mockFn.mockReturnValue({ user: { uid: 'user-1' } })
}

describe('useActivityExecution', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth()
    mockGetActivity.mockResolvedValue(makeActivity())
    mockStartActivity.mockImplementation((_id: string, _uid: string) =>
      Promise.resolve(makeActivity({ status: 'inProgress', startedAt: new Date() }))
    )
    mockCompleteStep.mockImplementation((_id: string, _stepId: string, _uid: string) =>
      Promise.resolve(makeActivity({ status: 'inProgress' }))
    )
    mockReopenStep.mockImplementation((_id: string, _stepId: string, _uid: string) =>
      Promise.resolve(makeActivity({ status: 'inProgress' }))
    )
    mockCompleteActivity.mockImplementation((_id: string, _uid: string) =>
      Promise.resolve(makeActivity({ status: 'completed', completedAt: new Date() }))
    )
    mockReopenActivity.mockImplementation((_id: string, _uid: string) =>
      Promise.resolve(makeActivity({ status: 'inProgress', completedAt: null }))
    )
  })

  it('returns loading state initially', async () => {
    mockGetActivity.mockReturnValue(new Promise(() => {}))
    const { result } = await renderHook(() => useActivityExecution('act-1'))
    expect(result.current.state.mode).toBe('loading')
  })

  it('shows introduction when activity is pending', async () => {
    mockGetActivity.mockResolvedValue(makeActivity({ status: 'pending', steps: [makeStep('s1', 1)] }))
    const { result } = await renderHook(() => useActivityExecution('act-1'))
    await waitFor(() => { expect(result.current.state.mode).not.toBe('loading') })
    expect(result.current.state.mode).toBe('introduction')
  })

  it('shows step when activity is inProgress with incomplete steps', async () => {
    mockGetActivity.mockResolvedValue(makeActivity({
      status: 'inProgress',
      startedAt: new Date(),
      steps: [makeStep('s1', 1), makeStep('s2', 2)],
    }))
    const { result } = await renderHook(() => useActivityExecution('act-1'))
    await waitFor(() => { expect(result.current.state.mode).toBe('step') })
    expect(result.current.state.currentStep?.id).toBe('s1')
    expect(result.current.state.completedCount).toBe(0)
    expect(result.current.state.totalSteps).toBe(2)
  })

  it('shows completion when activity is completed', async () => {
    mockGetActivity.mockResolvedValue(makeActivity({
      status: 'completed',
      completedAt: new Date(),
      steps: [makeStep('s1', 1, true)],
    }))
    const { result } = await renderHook(() => useActivityExecution('act-1'))
    await waitFor(() => { expect(result.current.state.mode).toBe('completion') })
  })

  it('shows no-steps mode when activity has no steps', async () => {
    mockGetActivity.mockResolvedValue(makeActivity({ status: 'inProgress', startedAt: new Date(), steps: [] }))
    const { result } = await renderHook(() => useActivityExecution('act-1'))
    await waitFor(() => { expect(result.current.state.mode).toBe('no-steps') })
  })

  it('shows error when activity is not found', async () => {
    mockGetActivity.mockRejectedValue(new Error('Atividade não encontrada.'))
    const { result } = await renderHook(() => useActivityExecution('act-1'))
    await waitFor(() => { expect(result.current.state.mode).toBe('error') })
    expect(result.current.state.error).toBe('Atividade não encontrada.')
  })

  it('starts activity and transitions to step mode', async () => {
    mockGetActivity.mockResolvedValue(makeActivity({ status: 'pending', steps: [makeStep('s1', 1)] }))
    mockStartActivity.mockResolvedValue(makeActivity({
      status: 'inProgress', startedAt: new Date(), steps: [makeStep('s1', 1)],
    }))
    const { result } = await renderHook(() => useActivityExecution('act-1'))
    await waitFor(() => { expect(result.current.state.mode).toBe('introduction') })
    let ok = false
    await act(async () => { ok = await result.current.startActivity() })
    expect(ok).toBe(true)
    expect(result.current.state.mode).toBe('step')
    expect(mockStartActivity).toHaveBeenCalledWith('act-1', 'user-1')
  })

  describe('completeCurrentStep', () => {
    it('completes current step and advances to next', async () => {
      const steps = [makeStep('s1', 1), makeStep('s2', 2)]
      mockGetActivity.mockResolvedValue(makeActivity({ status: 'inProgress', startedAt: new Date(), steps }))
      mockCompleteStep.mockResolvedValue(makeActivity({
        status: 'inProgress', startedAt: new Date(),
        steps: [{ ...steps[0], completed: true, completedAt: new Date() }, steps[1]],
      }))
      const { result } = await renderHook(() => useActivityExecution('act-1'))
      await waitFor(() => { expect(result.current.state.currentStep?.id).toBe('s1') })
      let ok = false
      await act(async () => { ok = await result.current.completeCurrentStep() })
      expect(ok).toBe(true)
      expect(result.current.state.currentStep?.id).toBe('s2')
      expect(result.current.state.completedCount).toBe(1)
      expect(mockCompleteStep).toHaveBeenCalledWith('act-1', 's1', 'user-1')
    })

    it('completes last step and shows completion mode', async () => {
      const steps = [makeStep('s1', 1, true), makeStep('s2', 2)]
      mockGetActivity.mockResolvedValue(makeActivity({ status: 'inProgress', startedAt: new Date(), steps }))
      mockCompleteStep.mockResolvedValue(makeActivity({
        status: 'inProgress', startedAt: new Date(),
        steps: [steps[0], { ...steps[1], completed: true, completedAt: new Date() }],
      }))
      const { result } = await renderHook(() => useActivityExecution('act-1'))
      await waitFor(() => { expect(result.current.state.currentStep?.id).toBe('s2') })
      let ok = false
      await act(async () => { ok = await result.current.completeCurrentStep() })
      expect(ok).toBe(true)
      expect(result.current.state.currentStep).toBeNull()
    })

    it('completes step sequentially for 3 steps (s1→s2→s3)', async () => {
      const s1 = makeStep('s1', 1)
      const s2 = makeStep('s2', 2)
      const s3 = makeStep('s3', 3)
      mockGetActivity.mockResolvedValue(makeActivity({ status: 'inProgress', startedAt: new Date(), steps: [s1, s2, s3] }))
      const { result } = await renderHook(() => useActivityExecution('act-1'))
      await waitFor(() => { expect(result.current.state.currentStep?.id).toBe('s1') })

      mockCompleteStep.mockResolvedValue(makeActivity({
        status: 'inProgress', startedAt: new Date(),
        steps: [{ ...s1, completed: true, completedAt: new Date() }, s2, s3],
      }))
      await act(async () => { await result.current.completeCurrentStep() })
      expect(result.current.state.currentStep?.id).toBe('s2')

      mockCompleteStep.mockResolvedValue(makeActivity({
        status: 'inProgress', startedAt: new Date(),
        steps: [{ ...s1, completed: true, completedAt: new Date() }, { ...s2, completed: true, completedAt: new Date() }, s3],
      }))
      await act(async () => { await result.current.completeCurrentStep() })
      expect(result.current.state.currentStep?.id).toBe('s3')

      mockCompleteStep.mockResolvedValue(makeActivity({
        status: 'inProgress', startedAt: new Date(),
        steps: [{ ...s1, completed: true, completedAt: new Date() }, { ...s2, completed: true, completedAt: new Date() }, { ...s3, completed: true, completedAt: new Date() }],
      }))
      await act(async () => { await result.current.completeCurrentStep() })
      expect(result.current.state.currentStep).toBeNull()
    })

    it('handles steps in wrong order correctly', async () => {
      const s1 = makeStep('s1', 1)
      const s2 = makeStep('s2', 3)
      const s3 = makeStep('s3', 2)
      mockGetActivity.mockResolvedValue(makeActivity({ status: 'inProgress', startedAt: new Date(), steps: [s1, s2, s3] }))
      const { result } = await renderHook(() => useActivityExecution('act-1'))
      await waitFor(() => { expect(result.current.state.currentStep?.id).toBe('s1') })
      expect(result.current.state.sortedSteps.map(s => s.id)).toEqual(['s1', 's3', 's2'])
    })

    it('does not advance when no userId', async () => {
      mockFn.mockReturnValue({ user: null })
      mockGetActivity.mockResolvedValue(makeActivity({ status: 'inProgress', startedAt: new Date(), steps: [makeStep('s1', 1)] }))
      const { result } = await renderHook(() => useActivityExecution('act-1'))
      await waitFor(() => { expect(result.current.state.currentStep).not.toBeNull() })
      let ok = false
      await act(async () => { ok = await result.current.completeCurrentStep() })
      expect(ok).toBe(false)
    })
  })

  describe('reopenStep', () => {
    it('reopens a completed step', async () => {
      const steps = [makeStep('s1', 1, true), makeStep('s2', 2)]
      mockGetActivity.mockResolvedValue(makeActivity({ status: 'inProgress', startedAt: new Date(), steps }))
      mockReopenStep.mockResolvedValue(makeActivity({
        status: 'inProgress', startedAt: new Date(),
        steps: [{ ...steps[0], completed: false, completedAt: null }, steps[1]],
      }))
      const { result } = await renderHook(() => useActivityExecution('act-1'))
      await waitFor(() => { expect(result.current.state.mode).toBe('step') })
      let ok = false
      await act(async () => { ok = await result.current.reopenStep('s1') })
      expect(ok).toBe(true)
      expect(result.current.state.currentStep?.id).toBe('s1')
      expect(mockReopenStep).toHaveBeenCalledWith('act-1', 's1', 'user-1')
    })
  })

  describe('completeActivity', () => {
    it('completes the whole activity', async () => {
      const steps = [makeStep('s1', 1)]
      mockGetActivity.mockResolvedValue(makeActivity({ status: 'inProgress', startedAt: new Date(), steps }))
      mockCompleteActivity.mockResolvedValue(makeActivity({ status: 'completed', completedAt: new Date(), steps: [{ ...steps[0], completed: true, completedAt: new Date() }] }))
      const { result } = await renderHook(() => useActivityExecution('act-1'))
      await waitFor(() => { expect(result.current.state.mode).toBe('step') })
      let ok = false
      await act(async () => { ok = await result.current.completeActivity() })
      expect(ok).toBe(true)
      expect(result.current.state.mode).toBe('completion')
      expect(mockCompleteActivity).toHaveBeenCalledWith('act-1', 'user-1')
    })
  })

  describe('reopenActivity', () => {
    it('reopens a completed activity', async () => {
      const steps = [makeStep('s1', 1)]
      mockGetActivity.mockResolvedValue(makeActivity({ status: 'completed', completedAt: new Date(), steps }))
      mockReopenActivity.mockResolvedValue(makeActivity({ status: 'inProgress', completedAt: null, steps }))
      const { result } = await renderHook(() => useActivityExecution('act-1'))
      await waitFor(() => { expect(result.current.state.mode).toBe('completion') })
      let ok = false
      await act(async () => { ok = await result.current.reopenActivity() })
      expect(ok).toBe(true)
      expect(result.current.state.mode).toBe('step')
      expect(mockReopenActivity).toHaveBeenCalledWith('act-1', 'user-1')
    })
  })

  describe('cleanup', () => {
    it('does not set state after unmount', async () => {
      mockGetActivity.mockResolvedValue(makeActivity({ status: 'inProgress', startedAt: new Date(), steps: [makeStep('s1', 1)] }))
      const { result, unmount } = await renderHook(() => useActivityExecution('act-1'))
      await waitFor(() => { expect(result.current.state.mode).toBe('step') })
      unmount()
      await act(async () => { await result.current.completeCurrentStep() })
    })
  })
})
