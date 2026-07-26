import { render, fireEvent } from '@testing-library/react-native'

jest.mock('@/contexts/theme-context', () => {
  const colors = jest.requireActual('@/shared/theme/colors')
  const spacing = jest.requireActual('@/shared/theme/spacing')
  const r = jest.requireActual('@/shared/theme/radius')
  const typography = jest.requireActual('@/shared/theme/typography')
  return {
    useTheme: () => ({
      colors: colors.lightColors,
      spacing: spacing.spacingNormal,
      radius: r.radius,
      fontSize: typography.fontSizeBase,
      lineHeight: typography.lineHeightBase,
      fontSizePreference: 'normal',
      contrast: 'default',
      spacingPreference: 'normal',
      reduceMotion: false,
      enhancedFeedback: true,
      confirmCriticalActions: true,
      remindersEnabled: true,
    }),
    ThemeProvider: ({ children }: any) => children,
    buildTheme: jest.fn(),
  }
})

import { ActivityFilters } from '@/screens/activities/components/activity-filters'

describe('ActivityFilters', () => {
  it('renders basic filter options when isComplete is false', async () => {
    const { getByText, queryByText } = await render(
      <ActivityFilters period="all" onPeriodChange={jest.fn()} isComplete={false} />,
    )
    expect(getByText('Todas')).toBeTruthy()
    expect(getByText('Hoje')).toBeTruthy()
    expect(getByText('Em andamento')).toBeTruthy()
    expect(queryByText('A fazer')).toBeNull()
  })

  it('renders complete filter options when isComplete is true', async () => {
    const { getByText } = await render(
      <ActivityFilters period="all" onPeriodChange={jest.fn()} isComplete={true} />,
    )
    expect(getByText('Todas')).toBeTruthy()
    expect(getByText('Hoje')).toBeTruthy()
    expect(getByText('Próximas')).toBeTruthy()
    expect(getByText('Em andamento')).toBeTruthy()
    expect(getByText('Concluídas')).toBeTruthy()
  })

  it('calls onPeriodChange when an option is pressed', async () => {
    const onPeriodChange = jest.fn()
    const { getByText } = await render(
      <ActivityFilters period="all" onPeriodChange={onPeriodChange} isComplete={true} />,
    )
    fireEvent.press(getByText('Hoje'))
    expect(onPeriodChange).toHaveBeenCalledWith('today')
  })

  it('highlights the selected period option', async () => {
    const { getByText } = await render(
      <ActivityFilters period="today" onPeriodChange={jest.fn()} isComplete={false} />,
    )
    expect(getByText('Hoje')).toBeTruthy()
  })
})
