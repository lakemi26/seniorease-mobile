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

describe('AppButton variants', () => {
  it('renders with primary variant by default', async () => {
    const { getByText } = await render(<AppButton title="Entrar" onPress={jest.fn()} />)
    expect(getByText('Entrar')).toBeTruthy()
  })

  it('renders with outline variant', async () => {
    const { getByText } = await render(<AppButton title="Cancelar" onPress={jest.fn()} variant="outline" />)
    expect(getByText('Cancelar')).toBeTruthy()
  })

  it('renders with danger variant', async () => {
    const { getByText } = await render(<AppButton title="Excluir" onPress={jest.fn()} variant="danger" />)
    expect(getByText('Excluir')).toBeTruthy()
  })
})
