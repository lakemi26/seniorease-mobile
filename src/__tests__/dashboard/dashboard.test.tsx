let mockUseAuth: jest.Mock
let mockUseTheme: jest.Mock
let mockUseDashboard: jest.Mock
let mockRouter: { push: jest.Mock; back: jest.Mock }

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock('@/contexts/theme-context', () => ({
  useTheme: () => mockUseTheme(),
  ThemeProvider: ({ children }: any) => children,
}))

jest.mock('@/hooks/use-dashboard', () => ({
  useDashboard: () => mockUseDashboard(),
}))

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  Link: ({ children }: any) => children,
  Redirect: (_props: any) => null,
  Stack: Object.assign(
    ({ children }: any) => children,
    { Screen: ({ children }: any) => children ?? null },
  ),
  Tabs: Object.assign(
    ({ children }: any) => children,
    { Screen: ({ children }: any) => children ?? null },
  ),
}))

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color }: any) => null,
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}))

import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'
import { View } from 'react-native'
import { Greeting } from '@/components/dashboard/greeting'
import { NextActivityCard } from '@/components/dashboard/next-activity-card'
import { TodayActivities } from '@/components/dashboard/today-activities'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { WeeklySummaryCard } from '@/components/dashboard/weekly-summary'
import { Reminders } from '@/components/dashboard/reminders'
import { RecentCompleted } from '@/components/dashboard/recent-completed'
import { HelpCard } from '@/components/dashboard/help-card'
import { DashboardError } from '@/components/dashboard/dashboard-error'
import DashboardScreen from '@/app/(private)/(tabs)/dashboard'

const mockColors = {
  primary: '#2F7F7A',
  primaryDark: '#215F5B',
  primarySoft: '#D9ECE9',
  primaryVerySoft: '#EDF6F4',
  background: '#F7F4EE',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEDE7',
  text: '#202927',
  textMuted: '#65716E',
  border: '#CDD7D3',
  success: '#3C7A57',
  successLight: '#E0F0E5',
  warning: '#A86F1B',
  warningLight: '#F5EDE0',
  danger: '#B85252',
  dangerLight: '#F5E0E0',
  info: '#4E7188',
  accentGold: '#B98A3D',
  accentGoldSoft: '#F3E9D3',
  overlay: 'rgba(32, 41, 39, 0.5)',
  focus: '#176FC1',
  disabled: '#9CA3AF',
  disabledBackground: '#E5E7EB',
}

const mockSpacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 40 }

const mockTheme = {
  colors: mockColors,
  spacing: mockSpacing,
  fontSize: { caption: 14, label: 15, body: 17, bodyLarge: 19, subtitle: 21, title: 27, display: 32 },
  lineHeight: { caption: 18, label: 20, body: 24, bodyLarge: 26, subtitle: 28, title: 34, display: 40 },
  radius: { sm: 6, md: 10, lg: 14, xl: 20, full: 9999 },
  shadows: { sm: {}, md: {}, lg: {} },
  fontSizePreference: 'normal' as const,
  contrast: 'default' as const,
  spacingPreference: 'normal' as const,
  interfaceMode: 'complete' as const,
  reduceMotion: false,
  enhancedFeedback: true,
  confirmCriticalActions: true,
  remindersEnabled: true,
  fontSizeMultiplier: 1,
}

function createActivity(overrides: any = {}) {
  const now = new Date()
  return {
    id: 'act-1',
    userId: 'user-1',
    title: 'Consulta médica',
    description: null,
    category: 'health' as const,
    scheduledAt: now,
    hasTime: true,
    status: 'pending' as const,
    priority: 'high' as const,
    steps: [
      { id: 's1', title: 'Step 1', order: 1, completed: false, completedAt: null },
      { id: 's2', title: 'Step 2', order: 2, completed: true, completedAt: new Date() },
    ],
    reminder: { enabled: true, remindAt: now, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

beforeEach(() => {
  mockUseAuth = jest.fn()
  mockUseTheme = jest.fn()
  mockUseDashboard = jest.fn()
  mockRouter = { push: jest.fn(), back: jest.fn() }
})

describe('Greeting', () => {
  it('renders greeting with user first name', async () => {
    mockUseAuth.mockReturnValue({ profile: { name: 'Larissa Silva' }, user: { uid: 'u1' } })
    mockUseTheme.mockReturnValue(mockTheme)
    const { getByText } = await render(<Greeting />)
    expect(getByText(/Larissa/)).toBeTruthy()
  })

  it('does not show email as name when name is empty', async () => {
    mockUseAuth.mockReturnValue({ profile: { name: '' }, user: { email: 'user@test.com' } })
    mockUseTheme.mockReturnValue(mockTheme)
    const { queryByText } = await render(<Greeting />)
    expect(queryByText(/user@test\.com/)).toBeNull()
  })

  it('renders without name fallback', async () => {
    mockUseAuth.mockReturnValue({ profile: null, user: { uid: 'u1' } })
    mockUseTheme.mockReturnValue(mockTheme)
    const { getByText } = await render(<Greeting />)
    expect(getByText(/Bom dia|Boa tarde|Boa noite/)).toBeTruthy()
  })
})

describe('NextActivityCard', () => {
  it('renders activity title and category when activity is provided', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const activity = createActivity()
    const { getByText } = await render(<NextActivityCard activity={activity} />)
    expect(getByText('Consulta médica')).toBeTruthy()
    expect(getByText('Saúde')).toBeTruthy()
  })

  it('renders empty state when activity is null', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const { getByText } = await render(<NextActivityCard activity={null} />)
    expect(getByText('Você não possui atividades próximas.')).toBeTruthy()
    expect(getByText('Adicionar atividade')).toBeTruthy()
  })

  it('shows "Continuar" when activity is in progress', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const activity = createActivity({ status: 'inProgress' })
    const { getByText } = await render(<NextActivityCard activity={activity} />)
    expect(getByText('Continuar')).toBeTruthy()
  })
})

describe('TodayActivities', () => {
  it('renders nothing when list is empty', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const { queryByText } = await render(<TodayActivities activities={[]} maxItems={3} />)
    expect(queryByText('Atividades de hoje')).toBeNull()
  })

  it('renders up to maxItems', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const activities = [
      createActivity({ id: '1', title: 'A1' }),
      createActivity({ id: '2', title: 'A2' }),
      createActivity({ id: '3', title: 'A3' }),
      createActivity({ id: '4', title: 'A4' }),
    ]
    const { getByText, queryByText } = await render(<TodayActivities activities={activities} maxItems={3} />)
    expect(getByText('A1')).toBeTruthy()
    expect(queryByText('A4')).toBeNull()
    expect(getByText('Ver todas')).toBeTruthy()
  })
})

describe('QuickActions', () => {
  it('renders 5 actions in complete mode', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const { getByText } = await render(<QuickActions isComplete />)
    expect(getByText('Nova atividade')).toBeTruthy()
    expect(getByText('Minhas atividades')).toBeTruthy()
    expect(getByText('Calendário')).toBeTruthy()
    expect(getByText('Histórico')).toBeTruthy()
    expect(getByText('Ajustar experiência')).toBeTruthy()
  })

  it('renders 3 actions in basic mode', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const { getByText, queryByText } = await render(<QuickActions isComplete={false} />)
    expect(getByText('Nova atividade')).toBeTruthy()
    expect(getByText('Minhas atividades')).toBeTruthy()
    expect(getByText('Ajustar experiência')).toBeTruthy()
    expect(queryByText('Calendário')).toBeNull()
    expect(queryByText('Histórico')).toBeNull()
  })
})

describe('WeeklySummaryCard', () => {
  it('renders counts from summary', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const summary = { total: 10, completed: 5, pending: 3, inProgress: 2 }
    const { getByText } = await render(<WeeklySummaryCard summary={summary} />)
    expect(getByText('5')).toBeTruthy()
    expect(getByText('3')).toBeTruthy()
    expect(getByText('2')).toBeTruthy()
  })
})

describe('Reminders', () => {
  it('renders empty state when no reminders', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const { getByText } = await render(<Reminders reminders={[]} maxItems={3} />)
    expect(getByText('Nenhum lembrete agora.')).toBeTruthy()
  })

  it('renders up to maxItems', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const reminders = [
      createActivity({ id: '1', title: 'R1' }),
      createActivity({ id: '2', title: 'R2' }),
      createActivity({ id: '3', title: 'R3' }),
    ]
    const { getByText, queryByText } = await render(<Reminders reminders={reminders} maxItems={2} />)
    expect(getByText('R1')).toBeTruthy()
    expect(queryByText('R3')).toBeNull()
  })
})

describe('RecentCompleted', () => {
  it('renders nothing when list is empty', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const { queryByText } = await render(<RecentCompleted activities={[]} maxItems={5} />)
    expect(queryByText('Concluídas recentemente')).toBeNull()
  })

  it('renders items with status badge', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const activities = [
      createActivity({ id: '1', title: 'C1', status: 'completed' }),
      createActivity({ id: '2', title: 'C2', status: 'completed' }),
    ]
    const { getAllByText } = await render(<RecentCompleted activities={activities} maxItems={3} />)
    expect(getAllByText('C1').length).toBe(1)
    expect(getAllByText('Concluída').length).toBe(2)
  })
})

describe('HelpCard', () => {
  it('renders help text and button', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    mockRouter = { push: jest.fn(), back: jest.fn() }
    const { getByText } = await render(<HelpCard />)
    expect(getByText('Precisa de ajuda?')).toBeTruthy()
    expect(getByText('Abrir ajuda')).toBeTruthy()
  })
})

describe('DashboardError', () => {
  it('renders error message and retry button', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const onRetry = jest.fn()
    const { getByText } = await render(<DashboardError message="Erro de conexão" onRetry={onRetry} />)
    expect(getByText('Não foi possível carregar o início.')).toBeTruthy()
    expect(getByText('Erro de conexão')).toBeTruthy()
    expect(getByText('Tentar novamente')).toBeTruthy()
  })

  it('calls onRetry when button pressed', async () => {
    mockUseTheme.mockReturnValue(mockTheme)
    const onRetry = jest.fn()
    const { getByText } = await render(<DashboardError message="Erro" onRetry={onRetry} />)
    await fireEvent.press(getByText('Tentar novamente'))
    expect(onRetry).toHaveBeenCalled()
  })
})

describe('DashboardScreen loading state', () => {
  it('shows skeleton while loading', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'Larissa Silva', email: 'larissa@test.com' },
    })
    mockUseTheme.mockReturnValue(mockTheme)
    mockUseDashboard.mockReturnValue({
      nextActivity: null,
      todayActivitiesSorted: [],
      recentCompleted: [],
      weeklySummary: null,
      reminders: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    })
    await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(mockUseDashboard).toHaveBeenCalled()
  })
})

describe('DashboardScreen error state', () => {
  it('shows error message and retry button', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'Larissa Silva' },
    })
    mockUseTheme.mockReturnValue(mockTheme)
    mockUseDashboard.mockReturnValue({
      nextActivity: null,
      todayActivitiesSorted: [],
      recentCompleted: [],
      weeklySummary: null,
      reminders: [],
      isLoading: false,
      error: 'Erro de conexão',
      refetch: jest.fn(),
    })
    const { getByText } = await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(getByText('Não foi possível carregar o início.')).toBeTruthy()
  })
})

describe('DashboardScreen complete mode', () => {
  it('renders all sections in complete mode', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'Larissa Silva' },
    })
    mockUseTheme.mockReturnValue(mockTheme)
    mockUseDashboard.mockReturnValue({
      nextActivity: createActivity(),
      todayActivitiesSorted: [createActivity({ id: '2', title: 'Hoje' })],
      recentCompleted: [createActivity({ id: '3', title: 'Feita', status: 'completed' })],
      weeklySummary: { total: 10, completed: 4, pending: 4, inProgress: 2 },
      reminders: [createActivity({ id: '4', title: 'Lembrete' })],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    const { getByText } = await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(getByText(/Larissa/)).toBeTruthy()
    expect(getByText('Consulta médica')).toBeTruthy()
    expect(getByText('Hoje')).toBeTruthy()
    expect(getByText('Nova atividade')).toBeTruthy()
    expect(getByText('Precisa de ajuda?')).toBeTruthy()
  })

  it('shows weekly summary in complete mode', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'Larissa Silva' },
    })
    mockUseTheme.mockReturnValue(mockTheme)
    mockUseDashboard.mockReturnValue({
      nextActivity: createActivity(),
      todayActivitiesSorted: [],
      recentCompleted: [],
      weeklySummary: { total: 10, completed: 4, pending: 4, inProgress: 2 },
      reminders: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    const { getByText, getAllByText } = await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(getByText('Resumo da semana')).toBeTruthy()
    expect(getAllByText('4').length).toBe(2)
  })

  it('shows reminders section', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'Larissa Silva' },
    })
    mockUseTheme.mockReturnValue(mockTheme)
    mockUseDashboard.mockReturnValue({
      nextActivity: null,
      todayActivitiesSorted: [],
      recentCompleted: [],
      weeklySummary: null,
      reminders: [createActivity({ id: '4', title: 'Lembrete' })],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    const { getByText } = await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(getByText('Lembrete')).toBeTruthy()
  })

  it('shows recently completed section', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'Larissa Silva' },
    })
    mockUseTheme.mockReturnValue(mockTheme)
    mockUseDashboard.mockReturnValue({
      nextActivity: null,
      todayActivitiesSorted: [],
      recentCompleted: [createActivity({ id: '3', title: 'Feita', status: 'completed' })],
      weeklySummary: null,
      reminders: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    const { getByText } = await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(getByText('Feita')).toBeTruthy()
  })
})

describe('DashboardScreen basic mode', () => {
  it('renders greeting in basic mode', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'João' },
    })
    mockUseTheme.mockReturnValue({ ...mockTheme, interfaceMode: 'basic' })
    mockUseDashboard.mockReturnValue({
      nextActivity: createActivity(),
      todayActivitiesSorted: [createActivity({ id: '2', title: 'Hoje' })],
      recentCompleted: [createActivity({ id: '3', title: 'Feita', status: 'completed' })],
      weeklySummary: null,
      reminders: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    const { getByText } = await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(getByText(/João/)).toBeTruthy()
  })

  it('does not show weekly summary in basic mode', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'João' },
    })
    mockUseTheme.mockReturnValue({ ...mockTheme, interfaceMode: 'basic' })
    mockUseDashboard.mockReturnValue({
      nextActivity: null,
      todayActivitiesSorted: [],
      recentCompleted: [],
      weeklySummary: null,
      reminders: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    const { queryByText } = await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(queryByText('Resumo da semana')).toBeNull()
  })

  it('shows 3 quick actions in basic mode', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'João' },
    })
    mockUseTheme.mockReturnValue({ ...mockTheme, interfaceMode: 'basic' })
    mockUseDashboard.mockReturnValue({
      nextActivity: null,
      todayActivitiesSorted: [],
      recentCompleted: [],
      weeklySummary: null,
      reminders: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    const { getByText, queryByText } = await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(getByText('Nova atividade')).toBeTruthy()
    expect(queryByText('Calendário')).toBeNull()
  })
})

describe('DashboardScreen - Theme contrast modes', () => {
  it('renders with default theme', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'Maria' },
    })
    mockUseTheme.mockReturnValue(mockTheme)
    mockUseDashboard.mockReturnValue({
      nextActivity: null,
      todayActivitiesSorted: [],
      recentCompleted: [],
      weeklySummary: null,
      reminders: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    const { getByText } = await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(getByText(/Maria/)).toBeTruthy()
  })

  it('renders with high contrast theme', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'Maria' },
    })
    mockUseTheme.mockReturnValue({
      ...mockTheme,
      contrast: 'high',
      colors: {
        ...mockColors,
        background: '#FFFFFF',
        text: '#000000',
        border: '#000000',
        primary: '#006B68',
        surface: '#FFFFFF',
      },
    })
    mockUseDashboard.mockReturnValue({
      nextActivity: null,
      todayActivitiesSorted: [],
      recentCompleted: [],
      weeklySummary: null,
      reminders: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    const { getByText } = await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(getByText(/Maria/)).toBeTruthy()
  })

  it('renders with dark theme', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      profile: { name: 'Maria' },
    })
    mockUseTheme.mockReturnValue({
      ...mockTheme,
      contrast: 'dark',
      colors: {
        ...mockColors,
        background: '#101817',
        surface: '#172220',
        text: '#F4F7F6',
        border: '#40514D',
        primary: '#76C3BC',
      },
    })
    mockUseDashboard.mockReturnValue({
      nextActivity: null,
      todayActivitiesSorted: [],
      recentCompleted: [],
      weeklySummary: null,
      reminders: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    const { getByText } = await render(
      <View>
        <DashboardScreen />
      </View>,
    )
    expect(getByText(/Maria/)).toBeTruthy()
  })
})
