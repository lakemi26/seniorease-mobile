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

import { DeleteActivityDialog } from '@/screens/activities/components/delete-activity-dialog'

describe('DeleteActivityDialog', () => {
  it('renders when visible', async () => {
    const { getByText } = await render(
      <DeleteActivityDialog visible={true} onConfirm={jest.fn()} onCancel={jest.fn()} />,
    )
    expect(getByText('Excluir atividade?')).toBeTruthy()
    expect(getByText('Esta ação não poderá ser desfeita.')).toBeTruthy()
  })

  it('does not render when not visible', async () => {
    const { queryByText } = await render(
      <DeleteActivityDialog visible={false} onConfirm={jest.fn()} onCancel={jest.fn()} />,
    )
    expect(queryByText('Excluir atividade?')).toBeNull()
  })

  it('calls onConfirm when confirm button pressed', async () => {
    const onConfirm = jest.fn()
    const { getByText } = await render(
      <DeleteActivityDialog visible={true} onConfirm={onConfirm} onCancel={jest.fn()} />,
    )
    fireEvent.press(getByText('Excluir atividade'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button pressed', async () => {
    const onCancel = jest.fn()
    const { getByText } = await render(
      <DeleteActivityDialog visible={true} onConfirm={jest.fn()} onCancel={onCancel} />,
    )
    fireEvent.press(getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows activity indicator while deleting', async () => {
    const { getByText, queryByText } = await render(
      <DeleteActivityDialog visible={true} onConfirm={jest.fn()} onCancel={jest.fn()} isDeleting={true} />,
    )
    expect(getByText('Excluir atividade?')).toBeTruthy()
    expect(queryByText('Cancelar')).toBeTruthy()
  })
})
