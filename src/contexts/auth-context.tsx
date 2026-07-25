import { createContext, useContext, useEffect, useState, useCallback, useRef, type PropsWithChildren } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getFirebaseAuth } from '@/infrastructure/firebase/firebase.auth'
import { createFirebaseAuthRepository } from '@/modules/authentication/infrastructure/firebase-auth.repository'
import { createAuthUseCases } from '@/modules/authentication/application/use-cases'
import type { UserProfile } from '@/modules/authentication/domain/entities'
import { translateAuthError, translateRecoveryError, translateRegistrationError } from '@/infrastructure/firebase/firebase.errors'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  authError: string | null
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  clearError: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const repository = createFirebaseAuthRepository()
const authUseCases = createAuthUseCases(repository)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const clearError = useCallback(() => setAuthError(null), [])

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const userProfile = await authUseCases.getUserProfile(firebaseUser.uid)
          setProfile(userProfile)
        } catch {
          setProfile(null)
        }
      } else {
        setProfile(null)
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
          unsubscribeRef.current = null
        }
      }

      setIsLoading(false)
    })

    return () => {
      unsub()
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  useEffect(() => {
    if (!user) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      return
    }

    unsubscribeRef.current = authUseCases.subscribeToUserProfile(
      user.uid,
      (updatedProfile) => setProfile(updatedProfile),
      () => {},
    )

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [user])

  const signIn = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    setAuthError(null)
    try {
      await authUseCases.signInUser(email, password, rememberMe ?? false)
    } catch (error) {
      const message = translateAuthError(error)
      setAuthError(message)
      throw new Error(message)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setAuthError(null)
    try {
      await authUseCases.signUpUser(email, password, name)
    } catch (error) {
      const message = translateRegistrationError(error)
      setAuthError(message)
      throw new Error(message)
    }
  }, [])

  const signOut = useCallback(async () => {
    setAuthError(null)
    try {
      await authUseCases.signOutUser()
      setProfile(null)
    } catch (error) {
      const message = translateAuthError(error)
      setAuthError(message)
      throw new Error(message)
    }
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    setAuthError(null)
    try {
      await authUseCases.sendPasswordReset(email)
    } catch (error) {
      const message = translateRecoveryError(error)
      setAuthError(message)
      throw new Error(message)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    try {
      const userProfile = await authUseCases.getUserProfile(user.uid)
      setProfile(userProfile)
    } catch {
      // silent
    }
  }, [user])

  return (
      <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        authError,
        signIn,
        signUp,
        signOut,
        sendPasswordReset,
        clearError,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
