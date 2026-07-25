import { Redirect } from 'expo-router'
import { useAuth } from '@/contexts/auth-context'
import { LoadingScreen } from '@/components/ui/loading-screen'

export default function RootIndex() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return <Redirect href={user ? '/dashboard' : '/login'} />
}
