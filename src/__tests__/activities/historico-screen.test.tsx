import { render, fireEvent } from '@testing-library/react-native'
import type { Activity } from '@/modules/activities/domain/entities'
import { createMockTheme } from '../helpers/mock-theme'

let mockUseTheme: jest.Mock
let mockUseActivityHistory: jest.Mock
let mockRouter: { back: jest.Mock; push: jest.Mock }
const mockLoadMore = jest.fn()
const mockRefresh = jest.fn()

jest.mock('@/contexts/theme-context', () => ({
  useTheme: () => mockUseTheme(),
}))

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}))

jest.mock('@/screens/activities/hook/use-activity-history', () => ({
  useActivityHistory: () => mockUseActivityHistory(),
}))

import HistoricoScreen from '@/app/(private)/historico'

function makeActivity(id: string): Activity {
  const now = new Date('2026-07-27T12:00:00')
  return {
    id,
    userId: 'user-1',
    title: `Atividade ${id}`,
    description: null,
    category: 'health',
    scheduledAt: now,
    hasTime: true,
    status: 'completed',
    priority: 'medium',
    steps: [{ id: 's1', title: 'Passo', order: 1, completed: true, completedAt: now }],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  }
}

function mockHistory(overrides = {}) {
  mockUseActivityHistory.mockReturnValue({
    activities: [],
    isLoading: false,
    isLoadingMore: false,
    error: null,
    hasMore: false,
    loadMore: mockLoadMore,
    refresh: mockRefresh,
    ...overrides,
  })
}

describe('HistoricoScreen', () => {
  beforeEach(() => {
    mockUseTheme = jest.fn(() => createMockTheme())
    mockUseActivityHistory = jest.fn()
    mockRouter = { back: jest.fn(), push: jest.fn() }
    mockLoadMore.mockReset()
    mockRefresh.mockReset()
    mockHistory()
  })

  it('shows completed activities and opens details', async () => {
    mockHistory({ activities: [makeActivity('a')] })
    const { getByText } = await render(<HistoricoScreen />)

    expect(getByText('Atividade a')).toBeTruthy()
    fireEvent.press(getByText('Atividade a'))
    expect(mockRouter.push).toHaveBeenCalledWith('/atividades/a')
  })

  it('loads more completed activities when there is another page', async () => {
    mockHistory({ activities: [makeActivity('a')], hasMore: true })
    const { getByText } = await render(<HistoricoScreen />)

    fireEvent.press(getByText('Carregar mais'))
    expect(mockLoadMore).toHaveBeenCalled()
  })

  it('shows empty and error states', async () => {
    const empty = await render(<HistoricoScreen />)
    expect(empty.getByText('Nenhuma atividade concluída ainda.')).toBeTruthy()
    empty.unmount()

    mockHistory({ error: 'Falha' })
    const error = await render(<HistoricoScreen />)
    expect(error.getByText('Não foi possível carregar o histórico.')).toBeTruthy()
    fireEvent.press(error.getByText('Tentar novamente'))
    expect(mockRefresh).toHaveBeenCalled()
  })
})
