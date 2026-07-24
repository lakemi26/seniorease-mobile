import type { Timestamp } from 'firebase/firestore'
import type { ActivityStatus, ActivityPriority, ActivityCategory } from '../../domain/entities'

export interface StepDocument {
  id: string
  title: string
  order: number
  completed: boolean
  completedAt: Timestamp | null
}

export interface ReminderDocument {
  enabled: boolean
  remindAt: Timestamp | null
  readAt: Timestamp | null
  dismissedAt: Timestamp | null
}

export interface ActivityDocument {
  id: string
  userId: string
  title: string
  description: string | null
  category: ActivityCategory
  scheduledAt: Timestamp
  hasTime: boolean
  status: ActivityStatus
  priority: ActivityPriority
  steps: StepDocument[]
  reminder: ReminderDocument
  startedAt: Timestamp | null
  completedAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CreateActivityDocument {
  userId: string
  title: string
  description: string | null
  category: ActivityCategory
  scheduledAt: Timestamp
  hasTime: boolean
  status: ActivityStatus
  priority: ActivityPriority
  steps: Array<{
    id: string
    title: string
    order: number
    completed: false
    completedAt: null
  }>
  reminder: { enabled: boolean; remindAt: Timestamp | null; readAt: null; dismissedAt: null }
  startedAt: null
  completedAt: null
  createdAt: unknown
  updatedAt: unknown
}

export interface StepUpdateDocument {
  id: string
  title: string
  order: number
  completed: boolean
  completedAt: Timestamp | null
}

export interface UpdateActivityDocument {
  title?: string
  description?: string | null
  category?: ActivityCategory
  scheduledAt?: Timestamp
  hasTime?: boolean
  status?: ActivityStatus
  priority?: ActivityPriority
  steps?: Array<{
    id: string
    title: string
    order: number
    completed: boolean
    completedAt: Timestamp | null
  }>
  reminder?: { enabled: boolean; remindAt: Timestamp | null; readAt?: Timestamp | null; dismissedAt?: Timestamp | null }
  startedAt?: Timestamp | null
  completedAt?: Timestamp | null
  updatedAt: unknown
}
