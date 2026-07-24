export type ActivityStatus = 'pending' | 'inProgress' | 'completed' | 'cancelled'

export type ActivityPriority = 'low' | 'medium' | 'high'

export type ActivityCategory = 'health' | 'studies' | 'work' | 'appointments' | 'documents' | 'home' | 'shopping' | 'personal' | 'other'

export interface ActivityStep {
  id: string
  title: string
  order: number
  completed: boolean
  completedAt: Date | null
}

export interface ActivityReminder {
  enabled: boolean
  remindAt: Date | null
  readAt: Date | null
  dismissedAt: Date | null
}

export interface Activity {
  id: string
  userId: string
  title: string
  description: string | null
  category: ActivityCategory
  scheduledAt: Date
  hasTime: boolean
  status: ActivityStatus
  priority: ActivityPriority
  steps: ActivityStep[]
  reminder: ActivityReminder
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateActivityInput {
  userId: string
  title: string
  description: string | null
  category: ActivityCategory
  scheduledAt: Date
  hasTime: boolean
  priority: ActivityPriority
  steps: Array<{
    id: string
    title: string
    order: number
  }>
  reminder: ActivityReminder
}

export interface WeeklySummary {
  total: number
  completed: number
  pending: number
  inProgress: number
}

export interface ActivityHistoryFilters {
  period: 'all' | 'week' | 'month' | 'custom'
  category: ActivityCategory | 'all'
  search?: string
  startDate?: Date
  endDate?: Date
}

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  health: 'Saúde',
  studies: 'Estudos',
  work: 'Trabalho',
  appointments: 'Compromissos',
  documents: 'Documentos',
  home: 'Casa',
  shopping: 'Compras',
  personal: 'Tarefas pessoais',
  other: 'Outros',
}
