import type { Activity, ActivityCategory, CreateActivityInput, WeeklySummary, ActivityHistoryFilters } from './entities'

export type Unsubscribe = () => void

export interface ActivityFilters {
  status?: Activity['status'] | 'all'
  category?: Activity['category'] | 'all'
  period?: 'all' | 'today' | 'upcoming' | 'completed'
  search?: string
}

export { type ActivityHistoryFilters }

export interface IActivityRepository {
  create(input: CreateActivityInput): Promise<Activity>

  getById(id: string): Promise<Activity>
  update(id: string, input: Partial<CreateActivityInput>): Promise<Activity>
  delete(id: string): Promise<void>

  startActivity(activityId: string, userId: string): Promise<Activity>
  completeStep(activityId: string, stepId: string, userId: string): Promise<Activity>
  reopenStep(activityId: string, stepId: string, userId: string): Promise<Activity>
  completeActivity(activityId: string, userId: string): Promise<Activity>
  reopenActivity(activityId: string, userId: string): Promise<Activity>

  subscribeByUser(
    uid: string,
    filters: ActivityFilters,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe

  subscribeToNextActivity(uid: string, onData: (activity: Activity | null) => void, onError?: (error: Error) => void): Unsubscribe

  subscribeToTodayActivities(uid: string, startOfDay: Date, endOfDay: Date, onData: (activities: Activity[]) => void, onError?: (error: Error) => void): Unsubscribe

  subscribeToInProgressActivities(uid: string, onData: (activities: Activity[]) => void, onError?: (error: Error) => void): Unsubscribe

  subscribeToRecentCompletedActivities(uid: string, onData: (activities: Activity[]) => void, onError?: (error: Error) => void): Unsubscribe

  subscribeToDueReminders(
    userId: string,
    referenceDate: Date,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe

  subscribeToActiveReminders(
    userId: string,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe

  dismissReminder(activityId: string, userId: string): Promise<Activity>

  markReminderAsRead(activityId: string, userId: string): Promise<void>

  markAllRemindersAsRead(activityIds: string[], userId: string): Promise<void>

  subscribeToCompletedActivities(
    userId: string,
    filters: ActivityHistoryFilters,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe

  subscribeToActivitiesByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe

  getWeeklySummary(uid: string): Promise<WeeklySummary>

  fetchCompletedActivitiesPage(
    userId: string,
    filters: ActivityHistoryFilters,
    cursor: unknown | null,
    pageSize: number
  ): Promise<{ data: Activity[]; nextCursor: unknown | null }>

  fetchCalendarActivitiesPage(
    userId: string,
    startDate: Date,
    endDate: Date,
    cursor: unknown | null,
    pageSize: number
  ): Promise<{ data: Activity[]; nextCursor: unknown | null }>
}
