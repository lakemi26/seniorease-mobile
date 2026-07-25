import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { PreferencesProvider } from '@/contexts/preferences-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { LoadingScreen } from '@/components/ui/loading-screen'

SplashScreen.preventAutoHideAsync()

function RootNavigator() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen message="Carregando..." />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(private)" />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PreferencesProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </PreferencesProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
