import { createAuthUseCases } from '@/modules/authentication/application/use-cases'
import { createFirebaseAuthRepository } from '@/modules/authentication/infrastructure/firebase-auth.repository'

let authUseCases: ReturnType<typeof createAuthUseCases> | null = null

export function getAuthUseCases(): ReturnType<typeof createAuthUseCases> {
  if (!authUseCases) {
    authUseCases = createAuthUseCases(createFirebaseAuthRepository())
  }
  return authUseCases
}
