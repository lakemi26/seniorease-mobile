import { Stack } from 'expo-router'
import { useTheme } from '@/contexts/theme-context'

export default function AtividadesStackLayout() {
  const { colors } = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  )
}
