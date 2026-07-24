import type { IAuthRepository } from '../domain/repositories'
import type { UserProfile, UserPreferences } from '../domain/entities'

export function createAuthUseCases(repository: IAuthRepository) {
  function signInUser(email: string, password: string, rememberMe: boolean) {
    return repository.signIn(email, password, rememberMe)
  }

  async function signUpUser(email: string, password: string, name: string) {
    const user = await repository.signUp(email, password)
    await repository.updateFirebaseProfile(user, { displayName: name })
    await repository.createUserProfile(user.uid, { name, email })
    await repository.saveUserPreferences(user.uid, {
      fontSize: 'normal',
      contrast: 'default',
      spacing: 'normal',
      interfaceMode: 'basic',
      enhancedFeedback: true,
      confirmCriticalActions: true,
      reduceMotion: false,
      remindersEnabled: true,
      updatedAt: '',
    })
    return user
  }

  function signOutUser() {
    return repository.signOut()
  }

  function sendPasswordReset(email: string) {
    return repository.sendPasswordReset(email)
  }

  function getAuthenticatedUser() {
    return repository.getCurrentUser()
  }

  async function getUserProfile(uid: string): Promise<UserProfile | null> {
    return repository.getUserProfile(uid)
  }

  function subscribeToUserProfile(
    uid: string,
    onData: (profile: UserProfile | null) => void,
    onError: (error: Error) => void,
  ): () => void {
    return repository.subscribeToUserProfile(uid, onData, onError)
  }

  async function updateUserName(userId: string, name: string): Promise<void> {
    const trimmed = name.trim().replace(/\s+/g, ' ')
    if (trimmed.length < 2) {
      throw new Error('Use pelo menos 2 caracteres.')
    }
    if (trimmed.length > 80) {
      throw new Error('O nome deve ter no máximo 80 caracteres.')
    }
    await repository.updateUserName(userId, trimmed)
  }

  async function createUserProfile(uid: string, data: { name: string; email: string }): Promise<void> {
    return repository.createUserProfile(uid, data)
  }

  async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    return repository.updateUserProfile(uid, data)
  }

  async function getUserPreferences(uid: string): Promise<UserPreferences | null> {
    return repository.getUserPreferences(uid)
  }

  async function saveUserPreferences(uid: string, preferences: UserPreferences): Promise<void> {
    return repository.saveUserPreferences(uid, preferences)
  }

  function subscribeToUserPreferences(
    uid: string,
    onData: (preferences: UserPreferences | null) => void,
    onError: (error: Error) => void,
  ): () => void {
    return repository.subscribeToUserPreferences(uid, onData, onError)
  }

  async function resetUserPreferences(uid: string): Promise<void> {
    return repository.resetUserPreferences(uid)
  }

  async function deleteUserAccount(uid: string): Promise<void> {
    return repository.deleteUserAccount(uid)
  }

  return {
    signInUser,
    signUpUser,
    signOutUser,
    sendPasswordReset,
    getAuthenticatedUser,
    getUserProfile,
    subscribeToUserProfile,
    updateUserName,
    createUserProfile,
    updateUserProfile,
    getUserPreferences,
    saveUserPreferences,
    subscribeToUserPreferences,
    resetUserPreferences,
    deleteUserAccount,
  }
}
