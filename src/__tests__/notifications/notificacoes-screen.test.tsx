import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import type { Activity } from '@/modules/activities/domain/entities'
import type { ActivityNotification } from '@/modules/notifications/domain/entities'
import { createMockTheme, mockDarkColors, mockHighContrastColors } from '../helpers/mock-theme'

let mockUseTheme: jest.Mock
let mockUseNotifications: jest.Mock
let mockRouter: { push: jest.Mock; back: jest.Mock }
const mockMarkAsRead = jest.fn()
const mockMarkAllAsRead = jest.fn()
const mockDismissNotification = jest.fn()
const mockRefresh = jest.fn()
const mockClearNotice = jest.fn()

jest.mock('@/contexts/theme-context', () => ({
  useTheme: () => mockUseTheme(),
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

import NotificacoesScreen from '@/app/(private)/notificacoes'

const now = new Date('2026-07-27T12:00:00')

function makeActivity(id: string, overrides: Partial<Activity> = {}): Activity {
  return {
    id,
    userId: 'user-1',
    title: `Atividade ${id}`,
    description: null,
    category: 'health',
    scheduledAt: now,
    hasTime: true,
    status: 'pending',
    priority: 'medium',
    steps: [],
    reminder: { enabled: false, remindAt: null, readAt: null, dismissedAt: null },
    startedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function makeNotification(overrides: Partial<ActivityNotification> = {}): ActivityNotification {
  const activity = makeActivity(overrides.activityId ?? 'act-1', { title: overrides.title ?? 'Consulta médica' })
  return {
    id: `today-${activity.id}`,
    activityId: activity.id,
    activity,
    type: 'today',
    title: activity.title,
    description: 'Você tem Consulta médica hoje às 12:00.',
    typeLabel: 'Hoje',
    relevantAt: now,
    scheduledAt: now,
    readAt: null,
    dismissedAt: null,
    isRead: false,
    isToday: true,
    sortRank: 3,
    ...overrides,
  }
}

function mockNotifications(overrides = {}) {
  mockUseNotifications.mockReturnValue({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
    dismissNotification: mockDismissNotification,
    refresh: mockRefresh,
    notice: null,
    clearNotice: mockClearNotice,
    ...overrides,
  })
}

describe('NotificacoesScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now)
    mockUseTheme = jest.fn(() => createMockTheme())
    mockUseNotifications = jest.fn()
    mockRouter = { push: jest.fn(), back: jest.fn() }
    mockMarkAsRead.mockReset().mockResolvedValue(undefined)
    mockMarkAllAsRead.mockReset().mockResolvedValue(undefined)
    mockDismissNotification.mockReset().mockResolvedValue(undefined)
    mockRefresh.mockReset()
    mockClearNotice.mockReset()
    mockNotifications()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows empty state when there are no notifications', async () => {
    const { getByText } = await render(<NotificacoesScreen />)
    expect(getByText('Tudo em dia por aqui')).toBeTruthy()
    expect(getByText('Seus lembretes e avisos de atividades aparecerão nesta página.')).toBeTruthy()
  })

  it('shows loading state', async () => {
    mockNotifications({ isLoading: true })
    const { getByText } = await render(<NotificacoesScreen />)
    expect(getByText('Carregando notificações...')).toBeTruthy()
  })

  it('shows error state and retries', async () => {
    mockNotifications({ error: 'Falha de rede' })
    const { getByText } = await render(<NotificacoesScreen />)
    fireEvent.press(getByText('Tentar novamente'))
    expect(getByText('Não foi possível carregar notificações.')).toBeTruthy()
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('renders unread notifications and marks all as read', async () => {
    mockNotifications({ notifications: [makeNotification()], unreadCount: 1 })
    const { getByText } = await render(<NotificacoesScreen />)

    expect(getByText('Consulta médica')).toBeTruthy()
    fireEvent.press(getByText('Marcar todas como lidas'))
    expect(mockMarkAllAsRead).toHaveBeenCalled()
  })

  it('filters unread notifications', async () => {
    mockNotifications({
      notifications: [
        makeNotification({ title: 'Aviso sem leitura', activityId: 'unread' }),
        makeNotification({ title: 'Aviso lido', activityId: 'read', isRead: true, readAt: now }),
      ],
      unreadCount: 1,
    })
    const { getByText, queryByText } = await render(<NotificacoesScreen />)

    await act(async () => {
      fireEvent.press(getByText('Não lidas'))
    })

    expect(getByText('Aviso sem leitura')).toBeTruthy()
    await waitFor(() => expect(queryByText('Aviso lido')).toBeNull())
  })

  it('marks as read and navigates to the activity when opening', async () => {
    mockNotifications({ notifications: [makeNotification()], unreadCount: 1 })
    const { getByText } = await render(<NotificacoesScreen />)

    fireEvent.press(getByText('Abrir'))

    await waitFor(() => expect(mockMarkAsRead).toHaveBeenCalled())
    expect(mockRouter.push).toHaveBeenCalledWith('/atividades/act-1')
  })

  it('dismisses a notification', async () => {
    mockNotifications({ notifications: [makeNotification()] })
    const { getByText } = await render(<NotificacoesScreen />)

    fireEvent.press(getByText('Dispensar'))

    expect(mockDismissNotification).toHaveBeenCalled()
  })

  it('renders previous section for old notifications', async () => {
    mockNotifications({
      notifications: [makeNotification({ relevantAt: new Date('2026-07-26T10:00:00'), isToday: false })],
    })
    const { getByText } = await render(<NotificacoesScreen />)
    expect(getByText('Anteriores')).toBeTruthy()
  })

  it('shows unavailable activity notice and clears it', async () => {
    mockNotifications({ notice: 'Esta atividade não está mais disponível.' })
    const { getByText } = await render(<NotificacoesScreen />)

    expect(getByText('Esta atividade não está mais disponível.')).toBeTruthy()
    fireEvent.press(getByText('Entendi'))
    expect(mockClearNotice).toHaveBeenCalled()
  })

  it('renders in basic and complete modes', async () => {
    mockUseTheme.mockReturnValueOnce(createMockTheme({ interfaceMode: 'basic' }))
    const basic = await render(<NotificacoesScreen />)
    expect(basic.getByText('Notificações')).toBeTruthy()
    await act(async () => basic.unmount())

    mockUseTheme.mockReturnValue(createMockTheme({ interfaceMode: 'complete' }))
    const complete = await render(<NotificacoesScreen />)
    expect(complete.getByText('Notificações')).toBeTruthy()
  })

  it('renders with default, high contrast and dark themes', async () => {
    mockUseTheme.mockReturnValue(createMockTheme())
    const normal = await render(<NotificacoesScreen />)
    expect(normal.getByText('Notificações')).toBeTruthy()
    await act(async () => normal.unmount())

    mockUseTheme.mockReturnValue(createMockTheme({ contrast: 'high', colors: mockHighContrastColors }))
    const high = await render(<NotificacoesScreen />)
    expect(high.getByText('Notificações')).toBeTruthy()
    await act(async () => high.unmount())

    mockUseTheme.mockReturnValue(createMockTheme({ contrast: 'dark', colors: mockDarkColors }))
    const dark = await render(<NotificacoesScreen />)
    expect(dark.getByText('Notificações')).toBeTruthy()
  })
})
