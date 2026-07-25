import { type PropsWithChildren } from 'react'

export const useAuth = () => ({
  user: { uid: 'test-uid' },
  profile: null,
  isLoading: false,
  authError: null,
  signIn: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  sendPasswordReset: () => Promise.resolve(),
  clearError: () => {},
  refreshProfile: () => Promise.resolve(),
})

export function AuthProvider({ children }: PropsWithChildren) {
  return <>{children}</>
}
