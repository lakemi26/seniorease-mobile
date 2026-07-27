import { useState, useEffect, useCallback } from 'react'
import { getActivityUseCases } from '@/infrastructure/composition/activity-service'
import { localNotificationService } from '@/infrastructure/notifications/local-notification-service'
import type { Activity } from '@/modules/activities/domain/entities'

const useCases = getActivityUseCases()

export function useActivityDetails(id: string | undefined) {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!id) {
      setError('Atividade não encontrada.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await useCases.getActivity(id)
      setActivity(data)
    } catch (err: any) {
      if (err?.message?.includes('não encontrada')) {
        setError('Atividade não encontrada.')
      } else {
        setError(err?.message || 'Erro ao carregar atividade.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetch()
  }, [fetch])

  const remove = useCallback(async (): Promise<boolean> => {
    if (!id) return false
    try {
      await useCases.deleteActivity(id)
      await localNotificationService.cancelActivityReminder(id).catch(() => {})
      return true
    } catch {
      return false
    }
  }, [id])

  return { activity, isLoading, error, refetch: fetch, remove }
}
