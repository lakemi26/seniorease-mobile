import type { IOnboardingRepository } from '../domain/repositories'
import type { OnboardingPreferences } from '../domain/entities'

export function createOnboardingUseCases(repository: IOnboardingRepository) {
  async function saveOnboardingProgress(uid: string, step: number, preferences: OnboardingPreferences) {
    return repository.saveProgress(uid, step, preferences)
  }

  async function completeFirstAccess(uid: string, preferences: OnboardingPreferences, userData?: { name: string; email: string }) {
    return repository.completeOnboarding(uid, preferences, userData)
  }

  return {
    saveOnboardingProgress,
    completeFirstAccess,
  }
}
