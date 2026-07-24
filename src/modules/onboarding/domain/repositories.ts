import type { OnboardingPreferences } from './entities'

export interface IOnboardingRepository {
  saveProgress(uid: string, step: number, preferences: OnboardingPreferences): Promise<void>
  completeOnboarding(uid: string, preferences: OnboardingPreferences, userData?: { name: string; email: string }): Promise<void>
}
