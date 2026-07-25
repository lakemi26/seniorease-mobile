import { Redirect } from 'expo-router'
import { useAuth } from '@/contexts/auth-context'
import { LoadingScreen } from '@/components/ui/loading-screen'

export default function PrivateIndex() {
  const { profile, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  const firstAccessCompleted = profile?.firstAccessCompleted ?? false

  return (
    <Redirect
      href={firstAccessCompleted ? '/dashboard' : '/primeiro-acesso'}
    />
  )
}
