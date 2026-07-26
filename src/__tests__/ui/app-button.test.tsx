import { render, fireEvent } from '@testing-library/react-native'

jest.mock('@/contexts/theme-context', () => {
  const { mockTheme } = jest.requireActual('@/__tests__/helpers/mock-theme')

  return {
    useTheme: () => mockTheme,
    ThemeProvider: ({ children }: any) => children,
    buildTheme: jest.fn(() => mockTheme),
  }
})

import { AppButton } from '@/components/ui/app-button'

describe('AppButton basic', () => {
  it('renders title text', async () => {
    const { getByText } = await render(<AppButton title="Entrar" onPress={jest.fn()} />)
    expect(getByText('Entrar')).toBeTruthy()
  })

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn()
    const { getByText } = await render(<AppButton title="Entrar" onPress={onPress} />)
    fireEvent.press(getByText('Entrar'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn()
    const { getByRole } = await render(<AppButton title="Entrar" onPress={onPress} disabled />)
    fireEvent.press(getByRole('button'))
    expect(onPress).not.toHaveBeenCalled()
  })

  it('does not call onPress when loading', async () => {
    const onPress = jest.fn()
    const { getByRole } = await render(<AppButton title="Entrar" onPress={onPress} loading />)
    fireEvent.press(getByRole('button'))
    expect(onPress).not.toHaveBeenCalled()
  })
})
