import { createActivityUseCases } from '@/modules/activities/application/use-cases'
import { createFirebaseActivityRepository } from '@/modules/activities/infrastructure/repositories/firebase-activity.repository'

let activityUseCases: ReturnType<typeof createActivityUseCases> | null = null

export function getActivityUseCases(): ReturnType<typeof createActivityUseCases> {
  if (!activityUseCases) {
    activityUseCases = createActivityUseCases(createFirebaseActivityRepository())
  }
  return activityUseCases
}
