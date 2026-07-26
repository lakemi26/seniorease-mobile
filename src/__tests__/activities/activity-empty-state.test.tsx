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

import { ActivityEmptyState } from '@/screens/activities/components/activity-empty-state'

describe('ActivityEmptyState', () => {
  it('shows message when no activities and no filters', async () => {
    const { getByText } = await render(<ActivityEmptyState hasFilters={false} />)
    expect(getByText('Você ainda não possui atividades.')).toBeTruthy()
  })

  it('shows message when filters are active', async () => {
    const { getByText } = await render(<ActivityEmptyState hasFilters={true} />)
    expect(getByText('Nenhuma atividade encontrada.')).toBeTruthy()
  })

  it('shows create button when no filters and onCreatePress provided', async () => {
    const { getByText } = await render(
      <ActivityEmptyState hasFilters={false} onCreatePress={jest.fn()} />,
    )
    expect(getByText('Criar atividade')).toBeTruthy()
  })

  it('calls onCreatePress when create button pressed', async () => {
    const onCreatePress = jest.fn()
    const { getByText } = await render(
      <ActivityEmptyState hasFilters={false} onCreatePress={onCreatePress} />,
    )
    fireEvent.press(getByText('Criar atividade'))
    expect(onCreatePress).toHaveBeenCalledTimes(1)
  })

  it('shows clear filters button when filters active and onClearFilters provided', async () => {
    const { getByText } = await render(
      <ActivityEmptyState hasFilters={true} onClearFilters={jest.fn()} />,
    )
    expect(getByText('Limpar filtros')).toBeTruthy()
  })

  it('calls onClearFilters when clear button pressed', async () => {
    const onClearFilters = jest.fn()
    const { getByText } = await render(
      <ActivityEmptyState hasFilters={true} onClearFilters={onClearFilters} />,
    )
    fireEvent.press(getByText('Limpar filtros'))
    expect(onClearFilters).toHaveBeenCalledTimes(1)
  })
})
