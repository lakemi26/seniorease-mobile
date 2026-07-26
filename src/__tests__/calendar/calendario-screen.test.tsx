import { render, fireEvent } from '@testing-library/react-native'
import type { Activity } from '@/modules/activities/domain/entities'
import { DEFAULT_USER_PREFERENCES } from '@/modules/authentication/domain/entities'
import type { CalendarDay } from '@/screens/calendar/hook/use-calendar'
import { getColors } from '@/shared/theme/colors'
import { spacingExpanded, spacingNormal } from '@/shared/theme/spacing'
import { radius } from '@/shared/theme/radius'
import { fontSizeBase, getFontSizeMultiplier, getScaledSizes, lineHeightBase } from '@/shared/theme/typography'

let mockCurrentTheme: ReturnType<typeof makeTheme>
let mockRouter: { push: jest.Mock; back: jest.Mock }
let mockCalendarState: any

jest.mock('@/contexts/theme-context', () => {
  return {
    useTheme: () => mockCurrentTheme,
    ThemeProvider: ({ children }: any) => children,
  }
})

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}))

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}))

jest.mock('@/screens/calendar/hook/use-calendar', () => ({
  useCalendar: () => mockCalendarState,
}))

import CalendarioScreen from '@/app/(private)/calendario'

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'act-1',
    userId: 'user-1',
    title: 'Consulta médica',
    description: null,
    category: 'health',
    scheduledAt: new Date(2026, 6, 24, 9, 30),
    hasTime: true,
    status: 'pending',
    priority: 'high',
    steps: [],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: null,
    createdAt: new Date(2026, 6, 1),
    updatedAt: new Date(2026, 6, 1),
    ...overrides,
  }
}

function makeDay(index: number, overrides: Partial<CalendarDay> = {}): CalendarDay {
  return {
    date: new Date(2026, 6, index + 1),
    key: `day-${index}`,
    dayNumber: index + 1,
    isCurrentMonth: true,
    isSelected: index === 23,
    isToday: index === 23,
    activities: index === 23 ? [makeActivity()] : [],
    ...overrides,
  }
}

function setTheme(overrides: Partial<typeof DEFAULT_USER_PREFERENCES> = {}) {
  mockCurrentTheme = makeTheme(overrides)
}

function makeTheme(overrides: Partial<typeof DEFAULT_USER_PREFERENCES> = {}) {
  const preferences = { ...DEFAULT_USER_PREFERENCES, ...overrides }
  const scaled = getScaledSizes(getFontSizeMultiplier(preferences.fontSize))

  return {
    colors: getColors(preferences.contrast),
    spacing: preferences.spacing === 'expanded' ? spacingExpanded : spacingNormal,
    fontSize: preferences.fontSize === 'normal' ? fontSizeBase : scaled.fontSize,
    lineHeight: preferences.fontSize === 'normal' ? lineHeightBase : scaled.lineHeight,
    radius,
    shadows: { sm: {}, md: {}, lg: {} },
    fontSizePreference: preferences.fontSize,
    contrast: preferences.contrast,
    spacingPreference: preferences.spacing,
    interfaceMode: preferences.interfaceMode,
    reduceMotion: preferences.reduceMotion,
    enhancedFeedback: preferences.enhancedFeedback,
    confirmCriticalActions: preferences.confirmCriticalActions,
    remindersEnabled: preferences.remindersEnabled,
    fontSizeMultiplier: getFontSizeMultiplier(preferences.fontSize),
  }
}

function setCalendarState(overrides: Partial<typeof mockCalendarState> = {}) {
  mockCalendarState = {
    days: Array.from({ length: 42 }, (_, index) => makeDay(index, index === 0 ? { isCurrentMonth: false } : {})),
    selectedDateLabel: 'sexta-feira, 24 de julho de 2026',
    selectedActivities: [makeActivity()],
    monthLabel: 'julho de 2026',
    isLoading: false,
    error: null,
    goToPreviousMonth: jest.fn(),
    goToNextMonth: jest.fn(),
    goToToday: jest.fn(),
    selectDate: jest.fn(),
    retry: jest.fn(),
    ...overrides,
  }
}

describe('CalendarioScreen', () => {
  beforeEach(() => {
    setTheme()
    mockRouter = { push: jest.fn(), back: jest.fn() }
    setCalendarState()
  })

  it('renders the current month and selected agenda', async () => {
    const screen = await render(<CalendarioScreen />)
    expect(await screen.findByText('Calendário')).toBeTruthy()
    expect(await screen.findByLabelText('Mês exibido: julho de 2026')).toBeTruthy()
    expect(await screen.findByText('Consulta médica')).toBeTruthy()
  })

  it('calls previous, next, today, and date selection handlers', async () => {
    const screen = await render(<CalendarioScreen />)
    fireEvent.press(await screen.findByLabelText('Mês anterior'))
    fireEvent.press(await screen.findByLabelText('Próximo mês'))
    fireEvent.press(await screen.findByText('Hoje'))
    fireEvent.press((await screen.findAllByLabelText(/1 de julho de 2026/))[0])
    expect(mockCalendarState.goToPreviousMonth).toHaveBeenCalledTimes(1)
    expect(mockCalendarState.goToNextMonth).toHaveBeenCalledTimes(1)
    expect(mockCalendarState.goToToday).toHaveBeenCalledTimes(1)
    expect(mockCalendarState.selectDate).toHaveBeenCalledTimes(1)
  })

  it('navigates to activity details', async () => {
    const screen = await render(<CalendarioScreen />)
    fireEvent.press(await screen.findByText('Consulta médica'))
    expect(mockRouter.push).toHaveBeenCalledWith('/atividades/act-1')
  })

  it('navigates to activity creation', async () => {
    const screen = await render(<CalendarioScreen />)
    fireEvent.press((await screen.findAllByText('Adicionar atividade'))[0])
    expect(mockRouter.push).toHaveBeenCalledWith('/atividades/nova')
  })

  it('renders empty day state', async () => {
    setCalendarState({ selectedActivities: [] })
    const screen = await render(<CalendarioScreen />)
    expect(await screen.findByText('Nenhuma atividade neste dia')).toBeTruthy()
  })

  it('renders loading state', async () => {
    setCalendarState({ isLoading: true, selectedActivities: [] })
    const screen = await render(<CalendarioScreen />)
    expect(await screen.findByLabelText('Carregando atividades do mês...')).toBeTruthy()
  })

  it('renders error state and retries', async () => {
    setCalendarState({ error: 'Falha' })
    const screen = await render(<CalendarioScreen />)
    expect(await screen.findByLabelText('Erro ao carregar calendário. Falha')).toBeTruthy()
    fireEvent.press(await screen.findByText('Tentar novamente'))
    expect(mockCalendarState.retry).toHaveBeenCalledTimes(1)
  })

  it('renders in basic and complete modes', async () => {
    setTheme({ interfaceMode: 'basic' })
    expect(await (await render(<CalendarioScreen />)).findByText('Calendário')).toBeTruthy()
    setTheme({ interfaceMode: 'complete' })
    expect(await (await render(<CalendarioScreen />)).findByText('Calendário')).toBeTruthy()
  })
})
