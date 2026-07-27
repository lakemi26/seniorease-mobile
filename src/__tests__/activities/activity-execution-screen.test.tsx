import { render, fireEvent, waitFor } from '@testing-library/react-native'
import type { Activity } from '@/modules/activities/domain/entities'
import { createMockTheme } from '../helpers/mock-theme'

let mockUseTheme: jest.Mock
let mockUsePreferences: jest.Mock
let mockUseActivityExecution: jest.Mock
let mockRouter: { replace: jest.Mock }
const mockCompleteActivity = jest.fn()

jest.mock('@/contexts/theme-context', () => ({
  useTheme: () => mockUseTheme(),
}))

jest.mock('@/contexts/preferences-context', () => ({
  usePreferences: () => mockUsePreferences(),
}))

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'act-1' }),
  useRouter: () => mockRouter,
}))

jest.mock('@/screens/activities/hook/use-activity-execution', () => ({
  useActivityExecution: () => mockUseActivityExecution(),
}))

import ActivityExecutionScreen from '@/app/(private)/(tabs)/atividades/[id]/executar'

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  const now = new Date('2026-07-27T12:00:00')
  return {
    id: 'act-1',
    userId: 'user-1',
    title: 'Atividade com passos',
    description: null,
    category: 'health',
    scheduledAt: now,
    hasTime: true,
    status: 'inProgress',
    priority: 'medium',
    steps: [
      { id: 's1', title: 'Passo 1', order: 1, completed: true, completedAt: now },
      { id: 's2', title: 'Passo 2', order: 2, completed: true, completedAt: now },
    ],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: now,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function mockExecution(activity: Activity, mode = 'readyToComplete') {
  mockUseActivityExecution.mockReturnValue({
    state: {
      mode,
      activity,
      currentStep: null,
      sortedSteps: activity.steps,
      completedCount: activity.steps.length,
      totalSteps: activity.steps.length,
      progressPercent: 100,
      isProcessing: false,
      error: null,
      feedbackMessage: null,
    },
    startActivity: jest.fn(),
    completeCurrentStep: jest.fn(),
    reopenStep: jest.fn(),
    completeActivity: mockCompleteActivity,
    reopenActivity: jest.fn(),
    refetch: jest.fn(),
    clearFeedback: jest.fn(),
  })
}

describe('ActivityExecutionScreen', () => {
  beforeEach(() => {
    mockUseTheme = jest.fn(() => createMockTheme())
    mockUsePreferences = jest.fn(() => ({ preferences: { confirmCriticalActions: true } }))
    mockUseActivityExecution = jest.fn()
    mockRouter = { replace: jest.fn() }
    mockCompleteActivity.mockReset().mockResolvedValue(true)
  })

  it('shows finish button when all steps are complete but activity is not completed', async () => {
    mockExecution(makeActivity())
    const { getByText, queryByText } = await render(<ActivityExecutionScreen />)

    expect(getByText('Todas as etapas foram concluídas.')).toBeTruthy()
    expect(getByText('Concluir atividade')).toBeTruthy()
    expect(queryByText('Atividade concluída com sucesso.')).toBeNull()
  })

  it('concludes the activity from the all-steps-complete state', async () => {
    mockExecution(makeActivity())
    const { getByText } = await render(<ActivityExecutionScreen />)

    fireEvent.press(getByText('Concluir atividade'))

    await waitFor(() => expect(mockCompleteActivity).toHaveBeenCalled())
    expect(mockRouter.replace).toHaveBeenCalledWith('/atividades/act-1')
  })
})
