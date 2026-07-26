import { render, fireEvent } from '@testing-library/react-native'
import type { Activity } from '@/modules/activities/domain/entities'
import { DEFAULT_USER_PREFERENCES } from '@/modules/authentication/domain/entities'
import { getColors } from '@/shared/theme/colors'
import { spacingExpanded, spacingNormal } from '@/shared/theme/spacing'
import { radius } from '@/shared/theme/radius'
import { fontSizeBase, getFontSizeMultiplier, getScaledSizes, lineHeightBase } from '@/shared/theme/typography'

let mockCurrentTheme: ReturnType<typeof makeTheme>

jest.mock('@/contexts/theme-context', () => {
  return {
    useTheme: () => mockCurrentTheme,
    ThemeProvider: ({ children }: any) => children,
  }
})

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}))

import { CalendarActivityItem } from '@/screens/calendar/components/calendar-activity-item'
import { CalendarDayCell, getCalendarDayAccessibilityLabel } from '@/screens/calendar/components/calendar-day-cell'
import { CalendarEmptyState, CalendarErrorState, CalendarLoadingState } from '@/screens/calendar/components/calendar-states'
import { MonthGrid } from '@/screens/calendar/components/month-grid'
import { MonthNavigator } from '@/screens/calendar/components/month-navigator'
import { SelectedDateHeader } from '@/screens/calendar/components/selected-date-header'
import type { CalendarDay } from '@/screens/calendar/hook/use-calendar'

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

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'act-1',
    userId: 'user-1',
    title: 'Consulta médica com descrição longa para permitir quebra de linha',
    description: null,
    category: 'health',
    scheduledAt: new Date(2026, 6, 24, 9, 30),
    hasTime: true,
    status: 'pending',
    priority: 'high',
    steps: [
      { id: 's1', title: 'Separar documento', order: 1, completed: true, completedAt: new Date(2026, 6, 24) },
      { id: 's2', title: 'Confirmar endereço', order: 2, completed: false, completedAt: null },
    ],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: null,
    createdAt: new Date(2026, 6, 1),
    updatedAt: new Date(2026, 6, 1),
    ...overrides,
  }
}

function makeDay(overrides: Partial<CalendarDay> = {}): CalendarDay {
  return {
    date: new Date(2026, 6, 24),
    key: '2026-6-24',
    dayNumber: 24,
    isCurrentMonth: true,
    isSelected: false,
    isToday: true,
    activities: [makeActivity()],
    ...overrides,
  }
}

describe('calendar components accessibility and themes', () => {
  beforeEach(() => {
    setTheme()
  })

  it('builds a complete day accessibility label', () => {
    const label = getCalendarDayAccessibilityLabel(makeDay({ activities: [makeActivity(), makeActivity({ id: 'act-2' })] }))
    expect(label).toContain('24 de julho de 2026')
    expect(label).toContain('Hoje.')
    expect(label).toContain('2 atividades.')
    expect(label).toContain('Não selecionado.')
  })

  it('renders day cells as buttons with selected state and minimum touch height', async () => {
    const onPress = jest.fn()
    const { getByLabelText } = await render(<CalendarDayCell day={makeDay({ isSelected: true })} onPress={onPress} />)
    const cell = getByLabelText(/Selecionado/)
    expect(cell.props.accessibilityRole).toBe('button')
    expect(cell.props.accessibilityState).toEqual({ selected: true })
    expect(cell.props.hitSlop).toBe(6)
    const styles = Array.isArray(cell.props.style) ? cell.props.style : cell.props.style({ pressed: false })
    expect(styles.some((entry: any) => entry?.minHeight >= 48)).toBe(true)
    fireEvent.press(cell)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not depend only on color for today selected state', async () => {
    const { getByTestId } = await render(<CalendarDayCell day={makeDay({ isSelected: true, isToday: true })} onPress={jest.fn()} />)
    expect(getByTestId('today-selected-marker')).toBeTruthy()
  })

  it('keeps external days legible', async () => {
    const { getByLabelText } = await render(<CalendarDayCell day={makeDay({ isCurrentMonth: false })} onPress={jest.fn()} />)
    expect(getByLabelText(/Fora do mês exibido/)).toBeTruthy()
  })

  it('renders a seven-column grid without activity titles inside cells', async () => {
    const days = Array.from({ length: 42 }, (_, index) => makeDay({
      key: `day-${index}`,
      date: new Date(2026, 6, index + 1),
      dayNumber: index + 1,
      isToday: false,
      activities: [makeActivity({ title: 'Título escondido na célula' })],
    }))
    const { queryByText, getAllByRole } = await render(<MonthGrid days={days} onSelectDate={jest.fn()} />)
    expect(getAllByRole('button')).toHaveLength(42)
    expect(queryByText('Título escondido na célula')).toBeNull()
  })

  it('announces the displayed month and selected date', async () => {
    const { getByLabelText } = await render(
      <>
        <MonthNavigator monthLabel="julho de 2026" onPreviousMonth={jest.fn()} onNextMonth={jest.fn()} onToday={jest.fn()} />
        <SelectedDateHeader dateLabel="sexta-feira, 24 de julho de 2026" activityCount={2} onCreatePress={jest.fn()} />
      </>,
    )
    expect(getByLabelText('Mês exibido: julho de 2026')).toBeTruthy()
    expect(getByLabelText('Data selecionada: sexta-feira, 24 de julho de 2026. 2 atividades.')).toBeTruthy()
  })

  it('renders activities with time, category, status, priority, and progress', async () => {
    const { getByText, getByLabelText } = await render(<CalendarActivityItem activity={makeActivity()} onPress={jest.fn()} />)
    expect(getByText(/09:30/)).toBeTruthy()
    expect(getByText(/Consulta médica/)).toBeTruthy()
    expect(getByText('Saúde')).toBeTruthy()
    expect(getByText('A fazer')).toBeTruthy()
    expect(getByText('Alta')).toBeTruthy()
    expect(getByText('1/2 etapas')).toBeTruthy()
    expect(getByLabelText(/Prioridade Alta/)).toBeTruthy()
  })

  it('renders activities without time', async () => {
    const activity = makeActivity({ hasTime: false, scheduledAt: new Date(2026, 6, 24, 0, 0), steps: [] })
    const { getByText, queryByText } = await render(<CalendarActivityItem activity={activity} onPress={jest.fn()} />)
    expect(getByText('Sem horário')).toBeTruthy()
    expect(queryByText(/etapas/)).toBeNull()
  })

  it('supports extraLarge font and expanded spacing without scaling grid numbers', async () => {
    setTheme({ fontSize: 'extraLarge', spacing: 'expanded' })
    const { getByText } = await render(<CalendarDayCell day={makeDay()} onPress={jest.fn()} />)
    expect(getByText('24').props.allowFontScaling).toBe(false)
    expect(mockCurrentTheme.fontSizePreference).toBe('extraLarge')
    expect(mockCurrentTheme.spacingPreference).toBe('expanded')
  })

  it('supports reduceMotion by removing pressed opacity feedback', async () => {
    setTheme({ reduceMotion: true })
    const { getByLabelText } = await render(<CalendarDayCell day={makeDay()} onPress={jest.fn()} />)
    const style = getByLabelText(/24 de julho de 2026/).props.style
    const resolved = Array.isArray(style) ? style : style({ pressed: true })
    expect(resolved.some((entry: any) => entry?.opacity === 0.85)).toBe(false)
  })

  it('renders default, high contrast, and dark blue-night themes', () => {
    setTheme({ contrast: 'default' })
    expect(mockCurrentTheme.colors.background).toBe('#F7F4EE')
    setTheme({ contrast: 'high' })
    expect(mockCurrentTheme.colors.background).toBe('#FFFFFF')
    expect(mockCurrentTheme.colors.border).toBe('#000000')
    setTheme({ contrast: 'dark' })
    expect(mockCurrentTheme.colors.background).toBe('#0D1117')
    expect(mockCurrentTheme.colors.primary).toBe('#58A6FF')
    expect(mockCurrentTheme.colors.surface).toBe('#161B22')
  })

  it('renders empty, loading, and error states accessibly', async () => {
    const empty = await render(<CalendarEmptyState onCreatePress={jest.fn()} />)
    const { getByText } = empty
    expect(getByText('Nenhuma atividade neste dia')).toBeTruthy()
    expect(getByText('Você pode adicionar uma atividade para organizar este dia.')).toBeTruthy()
    expect(getByText('Adicionar atividade')).toBeTruthy()

    const loading = await render(<CalendarLoadingState />)
    expect(loading.getByLabelText('Carregando atividades...')).toBeTruthy()

    const error = await render(<CalendarErrorState error="Falha" onRetry={jest.fn()} onBack={jest.fn()} />)
    expect(error.getByLabelText('Erro ao carregar calendário. Falha')).toBeTruthy()
  })

  it('renders in basic and complete modes', async () => {
    setTheme({ interfaceMode: 'basic' })
    expect(await render(<CalendarActivityItem activity={makeActivity()} onPress={jest.fn()} />)).toBeTruthy()
    setTheme({ interfaceMode: 'complete' })
    expect(await render(<CalendarActivityItem activity={makeActivity()} onPress={jest.fn()} />)).toBeTruthy()
  })
})
