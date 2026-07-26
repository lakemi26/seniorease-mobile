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

import { ActivitySearch } from '@/screens/activities/components/activity-search'

describe('ActivitySearch', () => {
  it('renders search input with placeholder', async () => {
    const { getByPlaceholderText } = await render(
      <ActivitySearch value="" onChange={jest.fn()} />,
    )
    expect(getByPlaceholderText('Buscar atividades…')).toBeTruthy()
  })

  it('displays the current value', async () => {
    const { getByDisplayValue } = await render(
      <ActivitySearch value="consulta" onChange={jest.fn()} />,
    )
    expect(getByDisplayValue('consulta')).toBeTruthy()
  })

  it('calls onChange when text changes', async () => {
    const onChange = jest.fn()
    const { getByPlaceholderText } = await render(
      <ActivitySearch value="" onChange={onChange} />,
    )
    const input = getByPlaceholderText('Buscar atividades…')
    fireEvent.changeText(input, 'médico')
    expect(onChange).toHaveBeenCalledWith('médico')
  })

  it('has correct accessibility label', async () => {
    const { getByLabelText } = await render(
      <ActivitySearch value="" onChange={jest.fn()} />,
    )
    expect(getByLabelText('Buscar atividades')).toBeTruthy()
  })
})
