import { render } from '@testing-library/react-native'
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
