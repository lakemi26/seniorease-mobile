import { render } from '@testing-library/react-native'
import { createMockTheme } from '../helpers/mock-theme'

let mockUseTheme: jest.Mock
let mockUseAuth: jest.Mock
let mockUseNotifications: jest.Mock
let mockRouter: { push: jest.Mock }

jest.mock('@/contexts/theme-context', () => ({
  useTheme: () => mockUseTheme(),
}))

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock('@/contexts/notifications-context', () => ({
  useNotifications: () => mockUseNotifications(),
}))

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}))

jest.mock('@expo/vector-icons', () => ({
  Ionicons: (_props: any) => null,
}))

import { DashboardHeader } from '@/components/dashboard/header'

describe('DashboardHeader notification badge', () => {
  beforeEach(() => {
    mockUseTheme = jest.fn(() => createMockTheme())
    mockUseAuth = jest.fn(() => ({ profile: { name: 'Larissa' } }))
    mockUseNotifications = jest.fn(() => ({ unreadCount: 0 }))
    mockRouter = { push: jest.fn() }
  })

  it('does not announce a badge when unread count is zero', async () => {
    const { getByLabelText, queryByText } = await render(<DashboardHeader />)

    expect(getByLabelText('Notificações. Nenhuma notificação não lida')).toBeTruthy()
    expect(queryByText('9+')).toBeNull()
  })

  it('shows 9+ and announces quantity when unread count exceeds nine', async () => {
    mockUseNotifications.mockReturnValue({ unreadCount: 12 })
    const { getByText, getByLabelText } = await render(<DashboardHeader />)

    expect(getByText('9+')).toBeTruthy()
    expect(getByLabelText('Notificações. 12 notificações não lidas')).toBeTruthy()
  })
})
