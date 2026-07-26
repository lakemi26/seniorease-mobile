import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar, Platform } from 'react-native'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { PreferencesProvider, usePreferences } from '@/contexts/preferences-context'
import { ThemeProvider, useTheme } from '@/contexts/theme-context'
import { LoadingScreen } from '@/components/ui/loading-screen'

SplashScreen.preventAutoHideAsync()

function RootNavigator() {
  const { user, isLoading: authLoading } = useAuth()
  const { isLoading: prefsLoading } = usePreferences()
  const { colors, contrast } = useTheme()

  if (authLoading || prefsLoading) {
    return (
      <>
        {Platform.OS !== 'web' && (
          <StatusBar
            barStyle={contrast === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={colors.background}
          />
        )}
        <LoadingScreen message="Carregando..." />
      </>
    )
  }

  return (
    <>
      {Platform.OS !== 'web' && (
        <StatusBar
          barStyle={contrast === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
      )}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(private)" />
      </Stack.Protected>
    </Stack>
    </>
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
