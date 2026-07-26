import { useState, useEffect, useCallback } from 'react'
import { createFirebaseActivityRepository } from '@/modules/activities/infrastructure/repositories/firebase-activity.repository'
import { createActivityUseCases } from '@/modules/activities/application/use-cases'
import type { Activity } from '@/modules/activities/domain/entities'

const repo = createFirebaseActivityRepository()
const useCases = createActivityUseCases(repo)

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
      return true
    } catch {
      return false
    }
  }, [id])

  return { activity, isLoading, error, refetch: fetch, remove }
}
