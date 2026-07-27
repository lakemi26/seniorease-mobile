import { renderHook, act, waitFor } from '@testing-library/react-native'

const mockSubscribeToAuthState = jest.fn()
const mockSubscribeToUserProfile = jest.fn()
const mockGetUserProfile = jest.fn()
const mockSignOutUser = jest.fn()
const mockCancelAllActivityReminders = jest.fn()

jest.mock('@/infrastructure/composition/auth-service', () => ({
  getAuthUseCases: () => ({
    get subscribeToAuthState() { return mockSubscribeToAuthState },
    get subscribeToUserProfile() { return mockSubscribeToUserProfile },
    get getUserProfile() { return mockGetUserProfile },
    get signOutUser() { return mockSignOutUser },
  }),
}))

jest.mock('@/infrastructure/composition/activity-service', () => ({
  getActivityUseCases: () => ({}),
}))

jest.mock('@/modules/activities/application/activities-list-cache', () => ({
  preloadActivitiesList: jest.fn(),
}))

jest.mock('@/shared/security/secure-profile-cache', () => ({
  readSecureUserProfile: jest.fn(() => Promise.resolve(null)),
  writeSecureUserProfile: jest.fn(() => Promise.resolve()),
  deleteSecureUserProfile: jest.fn(() => Promise.resolve()),
}))

jest.mock('@/infrastructure/notifications/local-notification-service', () => ({
  __esModule: true,
  localNotificationService: {
    get cancelAllActivityReminders() { return mockCancelAllActivityReminders },
  },
}))

import { AuthProvider, useAuth } from '@/contexts/auth-context'

describe('AuthProvider local notifications cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSubscribeToAuthState.mockImplementation((callback) => {
      void callback({ uid: 'user-1' })
      return jest.fn()
    })
    mockSubscribeToUserProfile.mockReturnValue(jest.fn())
    mockGetUserProfile.mockResolvedValue({ uid: 'user-1', name: 'Senior User', email: 'user@test.com' })
    mockSignOutUser.mockResolvedValue(undefined)
    mockCancelAllActivityReminders.mockResolvedValue(undefined)
  })

  it('cleans local reminder schedules after logout succeeds', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper: AuthProvider })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => { await result.current.signOut() })

    expect(mockSignOutUser).toHaveBeenCalled()
    expect(mockCancelAllActivityReminders).toHaveBeenCalled()
  })
})
