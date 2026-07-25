import { render } from '@testing-library/react-native'
import { AppText } from '@/components/ui/app-text'

describe('AppText variants', () => {
  it('renders with custom color', async () => {
    const { getByText } = await render(<AppText color="#DC2626">Colored</AppText>)
    expect(getByText('Colored')).toBeTruthy()
  })

  it('renders with link variant', async () => {
    const { getByText } = await render(<AppText variant="link">Link</AppText>)
    expect(getByText('Link')).toBeTruthy()
  })

  it('renders with caption variant', async () => {
    const { getByText } = await render(<AppText variant="caption">Caption</AppText>)
    expect(getByText('Caption')).toBeTruthy()
  })

  it('renders with error variant', async () => {
    const { getByText } = await render(<AppText variant="error">Error</AppText>)
    expect(getByText('Error')).toBeTruthy()
  })
})
