import { createOnboardingUseCases } from '@/modules/onboarding/application/use-cases'
import { createFirebaseOnboardingRepository } from '@/modules/onboarding/infrastructure/firebase-onboarding.repository'

let onboardingUseCases: ReturnType<typeof createOnboardingUseCases> | null = null

export function getOnboardingUseCases(): ReturnType<typeof createOnboardingUseCases> {
  if (!onboardingUseCases) {
    onboardingUseCases = createOnboardingUseCases(createFirebaseOnboardingRepository())
  }
  return onboardingUseCases
}
