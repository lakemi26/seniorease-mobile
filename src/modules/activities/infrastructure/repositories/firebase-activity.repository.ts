import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  runTransaction,
  writeBatch,
  Timestamp,
  serverTimestamp,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { getFirebaseFirestore } from '@/infrastructure/firebase/firebase.firestore'
import type { IActivityRepository, ActivityFilters, Unsubscribe, ActivityHistoryFilters } from '../../domain/repositories'
import type { Activity, CreateActivityInput, WeeklySummary } from '../../domain/entities'
import { isActivityScheduledBefore } from '../../domain/activity-date'
import { mapActivityDocument, mapActivityDocuments, toFirestoreCreateDocument, toFirestoreUpdateDocument } from '../mappers/activity.mapper'
import type { ActivityDocument, StepDocument } from '../mappers/types'

export function createFirebaseActivityRepository(): IActivityRepository {
  function getDb() {
    return getFirebaseFirestore()
  }

  async function create(input: CreateActivityInput): Promise<Activity> {
    const db = getDb()
    const ref = collection(db, 'activities')
    const docData = toFirestoreCreateDocument(input)
    const docRef = await addDoc(ref, docData)
    const snapshot = await getDocs(
      query(collection(db, 'activities'), where('__name__', '==', docRef.id), limit(1))
    )
    const raw = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ActivityDocument
    return mapActivityDocument(raw)
  }

  async function getById(id: string): Promise<Activity> {
    const db = getDb()
    const docRef = doc(db, 'activities', id)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) {
      throw new Error('Atividade não encontrada.')
    }

    const raw = { id: snapshot.id, ...snapshot.data() } as ActivityDocument
    return mapActivityDocument(raw)
  }

  async function update(id: string, input: Partial<CreateActivityInput>): Promise<Activity> {
    const db = getDb()
    const docRef = doc(db, 'activities', id)
    const updateData = toFirestoreUpdateDocument(input) as unknown as Record<string, unknown>
    await updateDoc(docRef, updateData)

    const snapshot = await getDoc(docRef)
    const raw = { id: snapshot.id, ...snapshot.data() } as ActivityDocument
    return mapActivityDocument(raw)
  }

  async function deleteActivity(id: string): Promise<void> {
    const db = getDb()
    const docRef = doc(db, 'activities', id)
    await deleteDoc(docRef)
  }

  function subscribeByUser(
    uid: string,
    filters: ActivityFilters,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const db = getDb()
    const ref = collection(db, 'activities')
    const constraints = [where('userId', '==', uid), orderBy('scheduledAt', 'asc'), limit(200)]
    const q = query(ref, ...constraints)

    return onSnapshot(
      q,
      (snapshot) => {
        const allDocs = snapshot.docs.map((d) => {
          const data = { id: d.id, ...d.data() } as ActivityDocument
          return data
        })
        const activities = mapActivityDocuments(allDocs)

        const filtered = activities.filter((a) => {
          if (filters.status && filters.status !== 'all' && a.status !== filters.status) return false
          if (filters.category && filters.category !== 'all' && a.category !== filters.category) return false
          if (filters.period) {
            const now = new Date()
            const startOfDay = new Date(now)
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date(now)
            endOfDay.setHours(23, 59, 59, 999)
            if (filters.period === 'today' && (a.scheduledAt < startOfDay || a.scheduledAt > endOfDay)) return false
            if (filters.period === 'upcoming' && isActivityScheduledBefore(a, now)) return false
            if (filters.period === 'completed' && a.status !== 'completed') return false
          }
          if (filters.search) {
            const q = filters.search.toLowerCase()
            if (!a.title.toLowerCase().includes(q)) return false
          }
          return true
        })

        onData(filtered)
      },
      (error) => {
        onError?.(error)
      }
    )
  }

  function subscribeToNextActivity(
    uid: string,
    onData: (activity: Activity | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const db = getDb()
    const ref = collection(db, 'activities')
    const q = query(
      ref,
      where('userId', '==', uid),
      where('status', '==', 'pending'),
      orderBy('scheduledAt', 'asc'),
      limit(1)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onData(null)
          return
        }
        const doc = snapshot.docs[0]
        const data = { id: doc.id, ...doc.data() } as ActivityDocument
        onData(mapActivityDocument(data))
      },
      (error) => {
        onError?.(error)
      }
    )
  }

  function subscribeToTodayActivities(
    uid: string,
    startOfDay: Date,
    endOfDay: Date,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const db = getDb()
    const ref = collection(db, 'activities')
    const q = query(
      ref,
      where('userId', '==', uid),
      where('scheduledAt', '>=', Timestamp.fromDate(startOfDay)),
      where('scheduledAt', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('scheduledAt', 'asc'),
      limit(50)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => {
          const data = { id: d.id, ...d.data() } as ActivityDocument
          return data
        })
        const filtered = docs.filter((d) => d.status !== 'cancelled')
        onData(mapActivityDocuments(filtered))
      },
      (error) => {
        onError?.(error)
      }
    )
  }

  function subscribeToInProgressActivities(
    uid: string,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const db = getDb()
    const ref = collection(db, 'activities')
    const q = query(
      ref,
      where('userId', '==', uid),
      where('status', '==', 'inProgress'),
      limit(3)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => {
          const data = { id: d.id, ...d.data() } as ActivityDocument
          return data
        })
        onData(mapActivityDocuments(docs))
      },
      (error) => {
        onError?.(error)
      }
    )
  }

  function subscribeToRecentCompletedActivities(
    uid: string,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const db = getDb()
    const ref = collection(db, 'activities')
    const q = query(
      ref,
      where('userId', '==', uid),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc'),
      limit(5)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => {
          const data = { id: d.id, ...d.data() } as ActivityDocument
          return data
        })
        onData(mapActivityDocuments(docs))
      },
      (error) => {
        onError?.(error)
      }
    )
  }

  async function getWeeklySummary(uid: string): Promise<WeeklySummary> {
    const db = getDb()
    const ref = collection(db, 'activities')

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const q = query(
      ref,
      where('userId', '==', uid),
      where('updatedAt', '>=', Timestamp.fromDate(startOfWeek)),
      where('updatedAt', '<=', Timestamp.fromDate(endOfWeek))
    )

    const snapshot = await getDocs(q)
    const total = snapshot.size
    let completed = 0
    let pending = 0
    let inProgress = 0

    snapshot.forEach((d) => {
      const data = d.data() as ActivityDocument
      if (data.status === 'completed') completed++
      else if (data.status === 'pending') pending++
      else if (data.status === 'inProgress') inProgress++
    })

    return { total, completed, pending, inProgress }
  }

  async function startActivity(activityId: string, userId: string): Promise<Activity> {
    const db = getDb()
    const docRef = doc(db, 'activities', activityId)

    const result = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(docRef)
      if (!snapshot.exists()) {
        throw new Error('Atividade não encontrada.')
      }

      const data = snapshot.data() as ActivityDocument
      if (data.userId !== userId) {
        throw new Error('Acesso negado.')
      }
      if (data.status === 'cancelled') {
        throw new Error('Esta atividade foi cancelada.')
      }
      if (data.status === 'completed') {
        throw new Error('Esta atividade já foi concluída.')
      }

      if (data.status === 'inProgress') {
        const raw = { id: snapshot.id, ...snapshot.data() } as ActivityDocument
        return mapActivityDocument(raw)
      }

      transaction.update(docRef, {
        status: 'inProgress',
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const mapped = { id: snapshot.id, ...snapshot.data() } as ActivityDocument
      return mapActivityDocument({
        ...mapped,
        status: 'inProgress' as const,
        startedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    })

    return result
  }

  async function completeStep(activityId: string, stepId: string, userId: string): Promise<Activity> {
    const db = getDb()
    const docRef = doc(db, 'activities', activityId)

    const result = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(docRef)
      if (!snapshot.exists()) {
        throw new Error('Atividade não encontrada.')
      }

      const data = snapshot.data() as ActivityDocument
      if (data.userId !== userId) {
        throw new Error('Acesso negado.')
      }
      if (data.status !== 'inProgress') {
        throw new Error('Atividade não está em andamento.')
      }

      const stepIndex = data.steps.findIndex((s) => s.id === stepId)
      if (stepIndex === -1) {
        throw new Error('Etapa não encontrada.')
      }
      if (data.steps[stepIndex].completed) {
        throw new Error('Etapa já concluída.')
      }

      const updatedSteps = data.steps.map((s) =>
        s.id === stepId
          ? { ...s, completed: true, completedAt: Timestamp.now() }
          : s
      ) as StepDocument[]

      transaction.update(docRef, {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
      })

      const raw = { id: snapshot.id, ...snapshot.data(), steps: updatedSteps, updatedAt: Timestamp.now() } as ActivityDocument
      return mapActivityDocument(raw)
    })

    return result
  }

  async function reopenStep(activityId: string, stepId: string, userId: string): Promise<Activity> {
    const db = getDb()
    const docRef = doc(db, 'activities', activityId)

    const result = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(docRef)
      if (!snapshot.exists()) {
        throw new Error('Atividade não encontrada.')
      }

      const data = snapshot.data() as ActivityDocument
      if (data.userId !== userId) {
        throw new Error('Acesso negado.')
      }
      if (data.status !== 'inProgress') {
        throw new Error('Atividade não está em andamento.')
      }

      const stepIndex = data.steps.findIndex((s) => s.id === stepId)
      if (stepIndex === -1) {
        throw new Error('Etapa não encontrada.')
      }
      if (!data.steps[stepIndex].completed) {
        throw new Error('Etapa não está concluída.')
      }

      const updatedSteps = data.steps.map((s) =>
        s.id === stepId
          ? { ...s, completed: false, completedAt: null }
          : s
      ) as StepDocument[]

      transaction.update(docRef, {
        steps: updatedSteps,
        updatedAt: serverTimestamp(),
      })

      const raw = { id: snapshot.id, ...snapshot.data(), steps: updatedSteps, updatedAt: Timestamp.now() } as ActivityDocument
      return mapActivityDocument(raw)
    })

    return result
  }

  async function completeActivity(activityId: string, userId: string): Promise<Activity> {
    const db = getDb()
    const docRef = doc(db, 'activities', activityId)

    const result = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(docRef)
      if (!snapshot.exists()) {
        throw new Error('Atividade não encontrada.')
      }

      const data = snapshot.data() as ActivityDocument
      if (data.userId !== userId) {
        throw new Error('Acesso negado.')
      }
      if (data.status !== 'inProgress') {
        throw new Error('Atividade não está em andamento.')
      }

      transaction.update(docRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const snap = { id: snapshot.id, ...snapshot.data(), status: 'completed' as const, completedAt: Timestamp.now(), updatedAt: Timestamp.now() } as ActivityDocument
      return mapActivityDocument(snap)
    })

    return result
  }

  function subscribeToDueReminders(
    userId: string,
    referenceDate: Date,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const db = getDb()
    const ref = collection(db, 'activities')

    const q = query(
      ref,
      where('userId', '==', userId),
      where('reminder.enabled', '==', true),
      where('reminder.remindAt', '<=', Timestamp.fromDate(referenceDate)),
      orderBy('reminder.remindAt', 'asc'),
      limit(20)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => {
          const data = { id: d.id, ...d.data() } as ActivityDocument
          return data
        })

        const mapped = mapActivityDocuments(docs)

        const valid = mapped.filter((a) => {
          if (a.status === 'completed' || a.status === 'cancelled') return false
          if (a.reminder.dismissedAt) return false
          return true
        })

        onData(valid)
      },
      (error) => {
        onError?.(error)
      }
    )
  }

  async function dismissReminder(activityId: string, userId: string): Promise<Activity> {
    const db = getDb()
    const docRef = doc(db, 'activities', activityId)

    const result = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(docRef)
      if (!snapshot.exists()) {
        throw new Error('Atividade não encontrada.')
      }

      const data = snapshot.data() as ActivityDocument
      if (data.userId !== userId) {
        throw new Error('Acesso negado.')
      }

      transaction.update(docRef, {
        'reminder.dismissedAt': serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const updatedReminder = {
        ...data.reminder,
        dismissedAt: Timestamp.now(),
      }

      const raw = { id: snapshot.id, ...snapshot.data(), reminder: updatedReminder, updatedAt: Timestamp.now() } as ActivityDocument
      return mapActivityDocument(raw)
    })

    return result
  }

  function subscribeToActiveReminders(
    userId: string,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const db = getDb()
    const ref = collection(db, 'activities')

    const q = query(
      ref,
      where('userId', '==', userId),
      where('reminder.enabled', '==', true),
      where('status', 'in', ['pending', 'inProgress']),
      orderBy('reminder.remindAt', 'asc'),
      limit(50)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const source = snapshot.metadata.fromCache ? 'cache' : 'server'
        if (snapshot.docChanges().length > 0) {
          console.info(`[Firestore] subscribeToActiveReminders | source=${source} | changes=${snapshot.docChanges().length}`)
        }

        const docs = snapshot.docs.map((d) => {
          const data = { id: d.id, ...d.data() } as ActivityDocument
          return data
        })

        const mapped = mapActivityDocuments(docs)

        const valid = mapped.filter((a) => {
          if (a.reminder.dismissedAt) return false
          if (a.status === 'completed' || a.status === 'cancelled') return false
          return true
        })

        onData(valid)
      },
      (error) => {
        onError?.(error)
      }
    )
  }

  async function markReminderAsRead(activityId: string, userId: string): Promise<void> {
    const db = getDb()
    const docRef = doc(db, 'activities', activityId)

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(docRef)
      if (!snapshot.exists()) {
        throw new Error('Atividade não encontrada.')
      }

      const data = snapshot.data() as ActivityDocument
      if (data.userId !== userId) {
        throw new Error('Acesso negado.')
      }

      if (data.reminder.readAt) return

      transaction.update(docRef, {
        'reminder.readAt': serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })
  }

  async function markAllRemindersAsRead(activityIds: string[], userId: string): Promise<void> {
    const db = getDb()
    const batchSize = 10

    for (let i = 0; i < activityIds.length; i += batchSize) {
      const batch = writeBatch(db)
      const slice = activityIds.slice(i, i + batchSize)

      for (const id of slice) {
        const docRef = doc(db, 'activities', id)
        batch.update(docRef, {
          'reminder.readAt': serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }

      await batch.commit()
    }
  }

  function subscribeToCompletedActivities(
    userId: string,
    filters: ActivityHistoryFilters,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const db = getDb()
    const ref = collection(db, 'activities')

    const constraints = [
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc'),
      limit(20),
    ] as const

    const q = query(ref, ...constraints)

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => {
          const data = { id: d.id, ...d.data() } as ActivityDocument
          return data
        })

        let activities = mapActivityDocuments(docs)

        if (filters.category && filters.category !== 'all') {
          activities = activities.filter((a) => a.category === filters.category)
        }

        if (filters.search) {
          const qs = filters.search.toLowerCase()
          activities = activities.filter((a) => a.title.toLowerCase().includes(qs))
        }

        if (filters.period === 'week') {
          const now = new Date()
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay())
          startOfWeek.setHours(0, 0, 0, 0)
          activities = activities.filter((a) => a.completedAt && a.completedAt >= startOfWeek)
        } else if (filters.period === 'month') {
          const now = new Date()
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          activities = activities.filter((a) => a.completedAt && a.completedAt >= startOfMonth)
        } else if (filters.period === 'custom' && filters.startDate && filters.endDate) {
          activities = activities.filter(
            (a) => a.completedAt && a.completedAt >= filters.startDate! && a.completedAt <= filters.endDate!
          )
        }

        onData(activities)
      },
      (error) => {
        onError?.(error)
      }
    )
  }

  function subscribeToActivitiesByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    onData: (activities: Activity[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const db = getDb()
    const ref = collection(db, 'activities')
    const q = query(
      ref,
      where('userId', '==', userId),
      where('scheduledAt', '>=', Timestamp.fromDate(startDate)),
      where('scheduledAt', '<', Timestamp.fromDate(endDate)),
      orderBy('scheduledAt', 'asc'),
      limit(200)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => {
          const data = { id: d.id, ...d.data() } as ActivityDocument
          return data
        })
        const filtered = docs.filter((d) => d.status !== 'cancelled')
        onData(mapActivityDocuments(filtered))
      },
      (error) => {
        onError?.(error)
      }
    )
  }

  async function fetchCompletedActivitiesPage(
    userId: string,
    filters: ActivityHistoryFilters,
    cursor: unknown | null,
    pageSize: number
  ): Promise<{ data: Activity[]; nextCursor: unknown | null }> {
    const db = getDb()
    const ref = collection(db, 'activities')

    const constraints: Parameters<typeof query>[1][] = [
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc'),
    ]

    if (cursor) {
      constraints.push(startAfter(cursor as DocumentSnapshot))
    }

    constraints.push(limit(pageSize))

    const q = query(ref, ...constraints)
    const snapshot = await getDocs(q)

    const docs = snapshot.docs.map((d) => {
      const data = { id: d.id, ...d.data() } as ActivityDocument
      return data
    })

    let activities = mapActivityDocuments(docs)

    if (filters.category && filters.category !== 'all') {
      activities = activities.filter((a) => a.category === filters.category)
    }

    if (filters.search) {
      const qs = filters.search.toLowerCase()
      activities = activities.filter((a) => a.title.toLowerCase().includes(qs))
    }

    if (filters.period === 'week') {
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      activities = activities.filter((a) => a.completedAt && a.completedAt >= startOfWeek)
    } else if (filters.period === 'month') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      activities = activities.filter((a) => a.completedAt && a.completedAt >= startOfMonth)
    } else if (filters.period === 'custom' && filters.startDate && filters.endDate) {
      activities = activities.filter(
        (a) => a.completedAt && a.completedAt >= filters.startDate! && a.completedAt <= filters.endDate!
      )
    }

    const nextCursor = snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null
    return { data: activities, nextCursor }
  }

  async function fetchCalendarActivitiesPage(
    userId: string,
    startDate: Date,
    endDate: Date,
    cursor: unknown | null,
    pageSize: number
  ): Promise<{ data: Activity[]; nextCursor: unknown | null }> {
    const db = getDb()
    const ref = collection(db, 'activities')

    const constraints: Parameters<typeof query>[1][] = [
      where('userId', '==', userId),
      where('scheduledAt', '>=', Timestamp.fromDate(startDate)),
      where('scheduledAt', '<', Timestamp.fromDate(endDate)),
      orderBy('scheduledAt', 'asc'),
    ]

    if (cursor) {
      constraints.push(startAfter(cursor as DocumentSnapshot))
    }

    constraints.push(limit(pageSize))

    const q = query(ref, ...constraints)
    const snapshot = await getDocs(q)

    const docs = snapshot.docs.map((d) => {
      const data = { id: d.id, ...d.data() } as ActivityDocument
      return data
    })
    const filtered = docs.filter((d) => d.status !== 'cancelled')
    const activities = mapActivityDocuments(filtered)

    const nextCursor = snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null
    return { data: activities, nextCursor }
  }

  async function reopenActivity(activityId: string, userId: string): Promise<Activity> {
    const db = getDb()
    const docRef = doc(db, 'activities', activityId)

    const result = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(docRef)
      if (!snapshot.exists()) {
        throw new Error('Atividade não encontrada.')
      }

      const data = snapshot.data() as ActivityDocument
      if (data.userId !== userId) {
        throw new Error('Acesso negado.')
      }
      if (data.status !== 'completed') {
        throw new Error('Atividade não está concluída.')
      }

      transaction.update(docRef, {
        status: 'inProgress',
        completedAt: null,
        updatedAt: serverTimestamp(),
      })

      const snap = { id: snapshot.id, ...snapshot.data(), status: 'inProgress' as const, completedAt: null, updatedAt: Timestamp.now() } as ActivityDocument
      return mapActivityDocument(snap)
    })

    return result
  }

  return {
    create,
    getById,
    update,
    delete: deleteActivity,
    startActivity,
    completeStep,
    reopenStep,
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
    subscribeToCompletedActivities,
    subscribeToActivitiesByPeriod,
    fetchCompletedActivitiesPage,
    fetchCalendarActivitiesPage,
    getWeeklySummary,
  }
}
