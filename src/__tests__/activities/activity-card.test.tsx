import { render, fireEvent } from '@testing-library/react-native'
import type { Activity } from '@/modules/activities/domain/entities'

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
      interfaceMode: 'complete',
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

import { ActivityCard } from '@/screens/activities/components/activity-card'

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'act-1',
    userId: 'user-1',
    title: 'Consulta médica',
    description: null,
    category: 'health',
    scheduledAt: new Date('2025-12-01T10:00:00'),
    hasTime: true,
    priority: 'high',
    status: 'pending',
    steps: [],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('ActivityCard', () => {
  it('renders activity title', async () => {
    const activity = makeActivity()
    const { getByText } = await render(<ActivityCard activity={activity} onPress={jest.fn()} />)
    expect(getByText('Consulta médica')).toBeTruthy()
  })

  it('renders category label', async () => {
    const activity = makeActivity()
    const { getByText } = await render(<ActivityCard activity={activity} onPress={jest.fn()} />)
    expect(getByText('Saúde')).toBeTruthy()
  })

  it('renders priority label', async () => {
    const activity = makeActivity()
    const { getByText } = await render(<ActivityCard activity={activity} onPress={jest.fn()} />)
    expect(getByText('Alta')).toBeTruthy()
  })

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn()
    const activity = makeActivity()
    const { getByText } = await render(<ActivityCard activity={activity} onPress={onPress} />)
    fireEvent.press(getByText('Consulta médica'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders date for activity with time', async () => {
    const activity = makeActivity({ hasTime: true })
    const { getByLabelText } = await render(<ActivityCard activity={activity} onPress={jest.fn()} />)
    expect(getByLabelText(/01\/12\/2025/)).toBeTruthy()
  })
})
