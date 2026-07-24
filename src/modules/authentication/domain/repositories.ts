import type { User } from 'firebase/auth'
import type { UserProfile, UserPreferences } from './entities'

export interface IAuthRepository {
  signIn(email: string, password: string, rememberMe: boolean): Promise<User>
  signUp(email: string, password: string): Promise<User>
  signOut(): Promise<void>
  sendPasswordReset(email: string): Promise<void>
  updateFirebaseProfile(user: User, data: { displayName?: string }): Promise<void>
  getCurrentUser(): User | null
  onAuthStateChanged(callback: (user: User | null) => void): () => void

  getUserProfile(uid: string): Promise<UserProfile | null>
  subscribeToUserProfile(
    uid: string,
    onData: (profile: UserProfile | null) => void,
    onError: (error: Error) => void,
  ): () => void
  createUserProfile(uid: string, data: { name: string; email: string }): Promise<void>
  updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void>
  updateUserName(uid: string, name: string): Promise<void>

  getUserPreferences(uid: string): Promise<UserPreferences | null>
  saveUserPreferences(uid: string, preferences: UserPreferences): Promise<void>

  subscribeToUserPreferences(
    uid: string,
    onData: (preferences: UserPreferences | null) => void,
    onError: (error: Error) => void,
  ): () => void

  resetUserPreferences(uid: string): Promise<void>
  deleteUserAccount(uid: string): Promise<void>
}
