import { render, fireEvent, waitFor } from '@testing-library/react-native'

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

function openModal(getByLabelText: any) {
  fireEvent.press(getByLabelText('Filtro atual: Todas. Toque para alterar'))
}

describe('ActivityFilters', () => {
  it('shows current filter label on the trigger', async () => {
    const { getByText } = await render(
      <ActivityFilters period="all" onPeriodChange={jest.fn()} isComplete={false} />,
    )
    expect(getByText('Todas')).toBeTruthy()
  })

  it('shows basic filter options when modal is opened', async () => {
    const { getByLabelText, findByText } = await render(
      <ActivityFilters period="all" onPeriodChange={jest.fn()} isComplete={false} />,
    )
    openModal(getByLabelText)
    expect(await findByText('Atrasadas')).toBeTruthy()
    expect(await findByText('Em andamento')).toBeTruthy()
  })

  it('shows complete filter options when isComplete is true', async () => {
    const { getByLabelText, findByText } = await render(
      <ActivityFilters period="all" onPeriodChange={jest.fn()} isComplete={true} />,
    )
    openModal(getByLabelText)
    expect(await findByText('Próximas')).toBeTruthy()
    expect(await findByText('Concluídas')).toBeTruthy()
    expect(await findByText('Atrasadas')).toBeTruthy()
  })

  it('calls onPeriodChange when an option is pressed', async () => {
    const onPeriodChange = jest.fn()
    const { getByLabelText, findByText } = await render(
      <ActivityFilters period="all" onPeriodChange={onPeriodChange} isComplete={true} />,
    )
    openModal(getByLabelText)
    fireEvent.press(await findByText('Em andamento'))
    expect(onPeriodChange).toHaveBeenCalledWith('inProgress')
  })

  it('shows checkmark on the selected option', async () => {
    const { getByLabelText, findByText } = await render(
      <ActivityFilters period="today" onPeriodChange={jest.fn()} isComplete={true} />,
    )
    fireEvent.press(getByLabelText('Filtro atual: Hoje. Toque para alterar'))
    expect(await findByText('Hoje')).toBeTruthy()
  })
})
