import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Screen } from '@/components/ui/screen'

jest.mock('@/contexts/theme-context', () => ({
  useTheme: () => ({
    colors: {
      background: '#F7F4EE',
      surface: '#FAF8F5',
      surfaceMuted: '#F0EDE8',
      text: '#1A1A2E',
      textMuted: '#6B7280',
      primary: '#6C63FF',
      primaryDark: '#5A52D5',
      border: '#E5E7EB',
      error: '#EF4444',
    },
    contrast: 'default',
    spacing: 4,
    interfaceMode: 'simplified',
  }),
}))

describe('Screen', () => {
  it('renders children', async () => {
    const { getByText } = await render(
      <Screen>
        <Text>Content</Text>
      </Screen>,
    )
    expect(getByText('Content')).toBeTruthy()
  })

  it('renders with scroll enabled by default', async () => {
    const { getByText } = await render(
      <Screen>
        <Text>Scrolled</Text>
      </Screen>,
    )
    expect(getByText('Scrolled')).toBeTruthy()
  })

  it('renders without scroll when scroll=false', async () => {
    const { getByText } = await render(
      <Screen scroll={false}>
        <Text>Static</Text>
      </Screen>,
    )
    expect(getByText('Static')).toBeTruthy()
  })

  it('renders with padding by default', async () => {
    const { getByText } = await render(
      <Screen>
        <Text>Padded</Text>
      </Screen>,
    )
    expect(getByText('Padded')).toBeTruthy()
  })
})
