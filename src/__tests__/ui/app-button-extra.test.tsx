import { render } from '@testing-library/react-native'

jest.mock('@/contexts/theme-context', () => {
  const { mockTheme } = jest.requireActual('@/__tests__/helpers/mock-theme')

  return {
    useTheme: () => mockTheme,
    ThemeProvider: ({ children }: any) => children,
    buildTheme: jest.fn(() => mockTheme),
  }
})

import { AppButton } from '@/components/ui/app-button'

describe('AppButton extra', () => {
  it('renders with ghost variant', async () => {
    const { getByText } = await render(<AppButton title="Link" onPress={jest.fn()} variant="ghost" />)
    expect(getByText('Link')).toBeTruthy()
  })

  it('sets accessibility label', async () => {
    const { getByLabelText } = await render(
      <AppButton title="Entrar" onPress={jest.fn()} accessibilityLabel="Botão de entrar" />,
    )
    expect(getByLabelText('Botão de entrar')).toBeTruthy()
  })
})
