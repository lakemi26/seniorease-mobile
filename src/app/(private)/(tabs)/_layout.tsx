import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Platform } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabsLayout() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const tabBarHeight = Platform.OS === 'ios' ? 50 : 56

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
          height: tabBarHeight + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          minHeight: Platform.select({ web: 48, default: 48 }),
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Início - Página inicial',
        }}
      />
      <Tabs.Screen
        name="atividades"
        options={{
          title: 'Atividades',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Atividades - Lista de atividades',
        }}
      />
      <Tabs.Screen
        name="nova"
        options={{
          title: 'Nova',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size + 4} color={color} />,
          tabBarAccessibilityLabel: 'Nova atividade',
        }}
      />
      <Tabs.Screen
        name="ajuda"
        options={{
          title: 'Ajuda',
          tabBarIcon: ({ color, size }) => <Ionicons name="help-circle-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Ajuda - Central de ajuda',
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Perfil - Meus dados',
        }}
      />
    </Tabs>
  )
}
