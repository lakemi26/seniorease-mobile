import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Platform } from 'react-native'
import { getActivityUseCases } from '@/infrastructure/composition/activity-service'
import { useAuth } from '@/contexts/auth-context'
import type { Activity } from '@/modules/activities/domain/entities'

const useCases = getActivityUseCases()

export type ExecutionMode = 'loading' | 'error' | 'introduction' | 'step' | 'completion' | 'no-steps'

export interface ExecutionState {
  mode: ExecutionMode
  activity: Activity | null
  currentStep: { id: string; title: string; order: number; completed: boolean; completedAt: Date | null } | null
  sortedSteps: Activity['steps']
  completedCount: number
  totalSteps: number
  progressPercent: number
  isProcessing: boolean
  error: string | null
  feedbackMessage: string | null
}

export function useActivityExecution(id: string | undefined) {
  const { user } = useAuth()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const prevIdRef = useRef<string | undefined>(undefined)
  const isMountedRef = useRef(true)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      clearFeedbackTimer()
    }
  }, [clearFeedbackTimer])

  useEffect(() => {
    if (id !== prevIdRef.current) {
      prevIdRef.current = id
      clearFeedbackTimer()
      setFeedbackMessage(null)
      setError(null)
      setIsProcessing(false)
      loadActivity()
    }
  }, [clearFeedbackTimer, id])

  async function loadActivity() {
    if (!id) {
      setError('Atividade não encontrada.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await useCases.getActivity(id)
      if (isMountedRef.current) {
        setActivity(data)
        setIsLoading(false)
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        if (err?.message?.includes('não encontrada')) {
          setError('Atividade não encontrada.')
        } else {
          setError(err?.message || 'Não foi possível carregar a atividade.')
        }
        setIsLoading(false)
      }
    }
  }

  const userId = user?.uid

  const sortedSteps = useMemo(() => {
    if (!activity) return []
    return [...activity.steps].sort((a, b) => a.order - b.order)
  }, [activity?.steps])

  const currentStep = useMemo(() => {
    return sortedSteps.find(s => !s.completed) ?? null
  }, [sortedSteps])

  const completedCount = useMemo(() => {
    return sortedSteps.filter(s => s.completed).length
  }, [sortedSteps])

  const totalSteps = sortedSteps.length
  const hasSteps = totalSteps > 0
  const progressPercent = hasSteps ? Math.round((completedCount / totalSteps) * 100) : 0
  const allStepsComplete = hasSteps && currentStep === null

  const mode: ExecutionMode = (() => {
    if (isLoading) return 'loading'
    if (error) return 'error'
    if (!activity) return 'error'
    if (activity.status === 'completed') return 'completion'
    if (!hasSteps) return 'no-steps'
    if (allStepsComplete) return 'completion'
    if (activity.status === 'pending') return 'introduction'
    return 'step'
  })()

  const clearFeedback = useCallback(() => {
    clearFeedbackTimer()
    setFeedbackMessage(null)
  }, [clearFeedbackTimer])

  const startActivity = useCallback(async (): Promise<boolean> => {
    if (!id || !userId || isProcessing) return false
    setIsProcessing(true)
    setError(null)
    try {
      const updated = await useCases.startActivity(id, userId)
      if (isMountedRef.current) {
        setActivity(updated)
      }
      return true
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err?.message || 'Não foi possível iniciar a atividade. Tente novamente.')
      }
      return false
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false)
      }
    }
  }, [id, userId, isProcessing])

  const completeCurrentStep = useCallback(async (): Promise<boolean> => {
    if (!id || !userId || !currentStep || isProcessing) return false
    setIsProcessing(true)
    setError(null)
    try {
      const updated = await useCases.completeActivityStep(id, currentStep.id, userId)
      if (isMountedRef.current) {
        setActivity(updated)
        const msg = Platform.OS === 'web'
          ? 'Etapa concluída.'
          : 'Etapa concluída.'
        clearFeedbackTimer()
        setFeedbackMessage(msg)
        feedbackTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) setFeedbackMessage(null)
          feedbackTimerRef.current = null
        }, 2000)
      }
      return true
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err?.message || 'Não foi possível concluir a etapa.')
      }
      return false
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false)
      }
    }
  }, [clearFeedbackTimer, id, userId, currentStep, isProcessing])

  const reopenStep = useCallback(async (stepId: string): Promise<boolean> => {
    if (!id || !userId || isProcessing) return false
    setIsProcessing(true)
    setError(null)
    try {
      const updated = await useCases.reopenActivityStep(id, stepId, userId)
      if (isMountedRef.current) {
        setActivity(updated)
      }
      return true
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err?.message || 'Não foi possível reabrir a etapa.')
      }
      return false
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false)
      }
    }
  }, [id, userId, isProcessing])

  const completeActivity = useCallback(async (): Promise<boolean> => {
    if (!id || !userId || isProcessing) return false
    setIsProcessing(true)
    setError(null)
    try {
      const updated = await useCases.completeActivity(id, userId)
      if (isMountedRef.current) {
        setActivity(updated)
      }
      return true
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err?.message || 'Não foi possível concluir a atividade.')
      }
      return false
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false)
      }
    }
  }, [id, userId, isProcessing])

  const reopenActivity = useCallback(async (): Promise<boolean> => {
    if (!id || !userId || isProcessing) return false
    setIsProcessing(true)
    setError(null)
    try {
      const updated = await useCases.reopenActivity(id, userId)
      if (isMountedRef.current) {
        setActivity(updated)
      }
      return true
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err?.message || 'Não foi possível reabrir a atividade.')
      }
      return false
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false)
      }
    }
  }, [id, userId, isProcessing])

  const state: ExecutionState = {
    mode,
    activity,
    currentStep,
    sortedSteps,
    completedCount,
    totalSteps,
    progressPercent,
    isProcessing,
    error,
    feedbackMessage,
  }

  return {
    state,
    startActivity,
    completeCurrentStep,
    reopenStep,
    completeActivity,
    reopenActivity,
    refetch: loadActivity,
    clearFeedback,
  }
}
