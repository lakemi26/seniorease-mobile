import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { View } from 'react-native'

export default function NovaTabRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/atividades/nova')
  }, [router])

  return <View />
}
