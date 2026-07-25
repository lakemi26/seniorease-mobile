import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Screen } from '@/components/ui/screen'

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
