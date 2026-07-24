import { Timestamp } from 'firebase/firestore'
import type { UserProfile } from '../../domain/entities'

interface UserProfileDocument {
  name?: string
  email?: string
  firstAccessCompleted?: boolean
  onboardingStep?: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export function mapUserProfileDocument(
  id: string,
  data: UserProfileDocument,
): UserProfile {
  return {
    id,
    name: data.name ?? '',
    email: data.email ?? '',
    firstAccessCompleted: data.firstAccessCompleted ?? false,
    onboardingStep: data.onboardingStep ?? 1,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  }
}

export function mapUserProfile(
  id: string,
  data: Record<string, unknown>,
): UserProfile | null {
  if (!data) return null
  return {
    id,
    name: (data.name as string) ?? '',
    email: (data.email as string) ?? '',
    firstAccessCompleted: (data.firstAccessCompleted as boolean) ?? false,
    onboardingStep: (data.onboardingStep as number) ?? 1,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : new Date(),
  }
}
