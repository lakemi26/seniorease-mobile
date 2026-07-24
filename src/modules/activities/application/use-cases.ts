import type { IActivityRepository, ActivityFilters, Unsubscribe, ActivityHistoryFilters } from '../domain/repositories'
import type { Activity, CreateActivityInput, WeeklySummary } from '../domain/entities'

export class ActivityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ActivityError'
  }
}

export class PastDateError extends ActivityError {
  constructor() {
    super('A data escolhida já passou.')
    this.name = 'PastDateError'
  }
}

export class ReminderAfterActivityError extends ActivityError {
  constructor() {
    super('O lembrete não pode acontecer depois da atividade.')
    this.name = 'ReminderAfterActivityError'
  }
}

export class EmptyStepError extends ActivityError {
  constructor() {
    super('Cada etapa deve possuir um título.')
    this.name = 'EmptyStepError'
  }
}

export class TooManyStepsError extends ActivityError {
  constructor() {
    super('A atividade pode ter no máximo 20 etapas.')
    this.name = 'TooManyStepsError'
  }
}

export class ActivityNotFoundError extends ActivityError {
  constructor() {
    super('Atividade não encontrada.')
    this.name = 'ActivityNotFoundError'
  }
}

export class ActivityNotPendingError extends ActivityError {
  constructor() {
    super('Esta atividade não está pendente.')
    this.name = 'ActivityNotPendingError'
  }
}

export class ActivityNotInProgressError extends ActivityError {
  constructor() {
    super('Esta atividade não está em andamento.')
    this.name = 'ActivityNotInProgressError'
  }
}

export class ActivityNotCompletedError extends ActivityError {
  constructor() {
    super('Esta atividade não está concluída.')
    this.name = 'ActivityNotCompletedError'
  }
}

export class ActivityCancelledError extends ActivityError {
  constructor() {
    super('Esta atividade foi cancelada.')
    this.name = 'ActivityCancelledError'
  }
}

export class StepNotFoundError extends ActivityError {
  constructor() {
    super('Etapa não encontrada.')
    this.name = 'StepNotFoundError'
  }
}

export class StepAlreadyCompletedError extends ActivityError {
  constructor() {
    super('Esta etapa já foi concluída.')
    this.name = 'StepAlreadyCompletedError'
  }
}

export class StepNotCompletedError extends ActivityError {
  constructor() {
    super('Esta etapa não está concluída.')
    this.name = 'StepNotCompletedError'
  }
}

export class PendingStepsError extends ActivityError {
  constructor() {
    super('Existem etapas pendentes para concluir.')
    this.name = 'PendingStepsError'
  }
}

export function createActivityUseCases(repository: IActivityRepository) {
  async function getActivity(id: string): Promise<Activity> {
    return repository.getById(id)
  }

  async function createActivity(input: CreateActivityInput): Promise<Activity> {
    if (!input.userId) {
      throw new ActivityError('Usuário não identificado.')
    }

    if (input.steps.length > 20) {
      throw new TooManyStepsError()
    }

    for (const step of input.steps) {
      if (!step.title.trim()) {
        throw new EmptyStepError()
      }
    }

    if (
      input.reminder.enabled &&
      input.reminder.remindAt &&
      input.scheduledAt &&
      input.reminder.remindAt > input.scheduledAt
    ) {
      throw new ReminderAfterActivityError()
    }

    const normalized: CreateActivityInput = {
      ...input,
      title: input.title.trim(),
      description: input.description?.trim() ?? null,
    }

    return repository.create(normalized)
  }

  function subscribeByUser(
    uid: string,
    filters: ActivityFilters,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    return repository.subscribeByUser(uid, filters, onData, onError)
  }

  function subscribeToNextActivity(
    uid: string,
    onData: (activity: Activity | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    return repository.subscribeToNextActivity(uid, onData, onError)
  }

  function subscribeToTodayActivities(
    uid: string,
    startOfDay: Date,
    endOfDay: Date,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    return repository.subscribeToTodayActivities(uid, startOfDay, endOfDay, onData, onError)
  }

  function subscribeToInProgressActivities(
    uid: string,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    return repository.subscribeToInProgressActivities(uid, onData, onError)
  }

  function subscribeToRecentCompletedActivities(
    uid: string,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    return repository.subscribeToRecentCompletedActivities(uid, onData, onError)
  }

  function getWeeklySummary(uid: string): Promise<WeeklySummary> {
    return repository.getWeeklySummary(uid)
  }

  async function updateActivity(id: string, input: Partial<CreateActivityInput>): Promise<Activity> {
    if (input.steps && input.steps.length > 20) {
      throw new TooManyStepsError()
    }

    if (input.steps) {
      for (const step of input.steps) {
        if (!step.title.trim()) {
          throw new EmptyStepError()
        }
      }
    }

    const normalized: Partial<CreateActivityInput> = {
      ...input,
      title: input.title?.trim(),
      description: input.description?.trim() ?? null,
    }

    return repository.update(id, normalized)
  }

  async function deleteActivity(id: string): Promise<void> {
    return repository.delete(id)
  }

  function subscribeToDueReminders(
    userId: string,
    referenceDate: Date,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    return repository.subscribeToDueReminders(userId, referenceDate, onData, onError)
  }

  async function dismissReminder(activityId: string, userId: string): Promise<Activity> {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    if (!activityId) {
      throw new ActivityError('Atividade não identificada.')
    }
    return repository.dismissReminder(activityId, userId)
  }

  function subscribeToActiveReminders(
    userId: string,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    return repository.subscribeToActiveReminders(userId, onData, onError)
  }

  async function markReminderAsRead(activityId: string, userId: string): Promise<void> {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    if (!activityId) {
      throw new ActivityError('Atividade não identificada.')
    }
    return repository.markReminderAsRead(activityId, userId)
  }

  async function markAllRemindersAsRead(activityIds: string[], userId: string): Promise<void> {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    if (activityIds.length === 0) return
    return repository.markAllRemindersAsRead(activityIds, userId)
  }

  function subscribeToActivityHistory(
    userId: string,
    filters: ActivityHistoryFilters,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    if (filters.period === 'custom') {
      if (!filters.startDate || !filters.endDate) {
        throw new ActivityError('Defina a data inicial e final do período.')
      }
      if (filters.endDate < filters.startDate) {
        throw new ActivityError('A data final deve ser igual ou posterior à data inicial.')
      }
    }
    return repository.subscribeToCompletedActivities(userId, filters, onData, onError)
  }

  function subscribeToCalendarActivities(
    userId: string,
    startDate: Date,
    endDate: Date,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    if (!startDate || !endDate) {
      throw new ActivityError('Período inválido.')
    }
    if (endDate <= startDate) {
      throw new ActivityError('A data final deve ser posterior à data inicial.')
    }
    return repository.subscribeToActivitiesByPeriod(userId, startDate, endDate, onData, onError)
  }

  async function startActivity(id: string, userId: string): Promise<Activity> {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    return repository.startActivity(id, userId)
  }

  async function completeActivityStep(id: string, stepId: string, userId: string): Promise<Activity> {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    if (!stepId) {
      throw new ActivityError('Etapa não identificada.')
    }
    return repository.completeStep(id, stepId, userId)
  }

  async function reopenActivityStep(id: string, stepId: string, userId: string): Promise<Activity> {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    if (!stepId) {
      throw new ActivityError('Etapa não identificada.')
    }
    return repository.reopenStep(id, stepId, userId)
  }

  async function completeActivity(id: string, userId: string): Promise<Activity> {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    return repository.completeActivity(id, userId)
  }

  async function reopenActivity(id: string, userId: string): Promise<Activity> {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    return repository.reopenActivity(id, userId)
  }

  function fetchCompletedActivitiesPage(
    userId: string,
    filters: ActivityHistoryFilters,
    cursor: unknown | null,
    pageSize: number
  ): Promise<{ data: Activity[]; nextCursor: unknown | null }> {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    return repository.fetchCompletedActivitiesPage(userId, filters, cursor, pageSize)
  }

  function fetchCalendarActivitiesPage(
    userId: string,
    startDate: Date,
    endDate: Date,
    cursor: unknown | null,
    pageSize: number
  ): Promise<{ data: Activity[]; nextCursor: unknown | null }> {
    if (!userId) {
      throw new ActivityError('Usuário não identificado.')
    }
    return repository.fetchCalendarActivitiesPage(userId, startDate, endDate, cursor, pageSize)
  }

  return {
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    startActivity,
    completeActivityStep,
    reopenActivityStep,
    completeActivity,
    reopenActivity,
    subscribeByUser,
    subscribeToNextActivity,
    subscribeToTodayActivities,
    subscribeToInProgressActivities,
    subscribeToRecentCompletedActivities,
    subscribeToDueReminders,
    subscribeToActiveReminders,
    dismissReminder,
    markReminderAsRead,
    markAllRemindersAsRead,
    subscribeToActivityHistory,
    subscribeToCalendarActivities,
    fetchCompletedActivitiesPage,
    fetchCalendarActivitiesPage,
    getWeeklySummary,
  }
}
