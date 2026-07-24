import { serverTimestamp, Timestamp } from 'firebase/firestore'
import type { Activity, CreateActivityInput } from '../../domain/entities'
import type { ActivityDocument, CreateActivityDocument, UpdateActivityDocument, StepDocument } from './types'

function hasClockTime(value: Timestamp): boolean {
  const date = value.toDate()
  return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0 || date.getMilliseconds() !== 0
}

function normalizeHasTime(doc: ActivityDocument): boolean {
  if (doc.hasTime === false && hasClockTime(doc.scheduledAt)) {
    return true
  }
  return doc.hasTime
}

export function mapActivityDocument(doc: ActivityDocument): Activity {
  return {
    id: doc.id,
    userId: doc.userId,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    scheduledAt: doc.scheduledAt.toDate(),
    hasTime: normalizeHasTime(doc),
    status: doc.status,
    priority: doc.priority,
    steps: doc.steps.map((s: StepDocument) => ({
      id: s.id,
      title: s.title,
      order: s.order,
      completed: s.completed,
      completedAt: s.completedAt instanceof Timestamp ? s.completedAt.toDate() : null,
    })),
    reminder: {
      enabled: doc.reminder.enabled,
      remindAt: doc.reminder.remindAt instanceof Timestamp ? doc.reminder.remindAt.toDate() : null,
      readAt: doc.reminder.readAt instanceof Timestamp ? doc.reminder.readAt.toDate() : null,
      dismissedAt: doc.reminder.dismissedAt instanceof Timestamp ? doc.reminder.dismissedAt.toDate() : null,
    },
    startedAt: doc.startedAt instanceof Timestamp ? doc.startedAt.toDate() : null,
    completedAt: doc.completedAt instanceof Timestamp ? doc.completedAt.toDate() : null,
    createdAt: doc.createdAt instanceof Timestamp ? doc.createdAt.toDate() : new Date(),
    updatedAt: doc.updatedAt instanceof Timestamp ? doc.updatedAt.toDate() : new Date(),
  }
}

export function mapActivityDocuments(docs: ActivityDocument[]): Activity[] {
  return docs.map(mapActivityDocument)
}

export function toFirestoreCreateDocument(input: CreateActivityInput): CreateActivityDocument {
  return {
    userId: input.userId,
    title: input.title,
    description: input.description ?? null,
    category: input.category,
    scheduledAt: Timestamp.fromDate(input.scheduledAt),
    hasTime: input.hasTime,
    status: 'pending',
    priority: input.priority,
    steps: input.steps.map((s) => ({
      id: s.id,
      title: s.title,
      order: s.order,
      completed: false as const,
      completedAt: null,
    })),
    reminder: {
      enabled: input.reminder.enabled,
      remindAt: input.reminder.remindAt
        ? Timestamp.fromDate(input.reminder.remindAt)
        : null,
      readAt: null,
      dismissedAt: null,
    },
    startedAt: null,
    completedAt: null,
    createdAt: serverTimestamp() as unknown,
    updatedAt: serverTimestamp() as unknown,
  }
}

export function toFirestoreUpdateDocument(input: Partial<CreateActivityInput>): UpdateActivityDocument {
  return {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: input.description ?? null }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.scheduledAt !== undefined && { scheduledAt: Timestamp.fromDate(input.scheduledAt) }),
    ...(input.hasTime !== undefined && { hasTime: input.hasTime }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.steps !== undefined && {
      steps: input.steps.map((s, i) => ({
        id: s.id,
        title: s.title,
        order: i + 1,
        completed: false,
        completedAt: null,
      })),
    }),
    ...(input.reminder !== undefined && {
      reminder: {
        enabled: input.reminder.enabled,
        remindAt: input.reminder.remindAt
          ? Timestamp.fromDate(input.reminder.remindAt)
          : null,
        readAt: null,
        dismissedAt: null,
      },
    }),
    updatedAt: serverTimestamp() as unknown,
  }
}
