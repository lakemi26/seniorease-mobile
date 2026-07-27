import { Stack } from 'expo-router'
import { NotificationsProvider } from '@/contexts/notifications-context'

export default function PrivateLayout() {
  return (
    <NotificationsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </NotificationsProvider>
  )
}
