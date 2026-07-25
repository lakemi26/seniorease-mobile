import { render } from '@testing-library/react-native'
import { AppText } from '@/components/ui/app-text'

describe('AppText', () => {
  it('renders children text', async () => {
    const { getByText } = await render(<AppText>Hello World</AppText>)
    expect(getByText('Hello World')).toBeTruthy()
  })

  it('renders with body variant by default', async () => {
    const { getByText } = await render(<AppText>Body Text</AppText>)
    expect(getByText('Body Text')).toBeTruthy()
  })

  it('renders with display variant', async () => {
    const { getByText } = await render(<AppText variant="display">Display</AppText>)
    expect(getByText('Display')).toBeTruthy()
  })

  it('renders with heading variant', async () => {
    const { getByText } = await render(<AppText variant="heading">Heading</AppText>)
    expect(getByText('Heading')).toBeTruthy()
  })
})
