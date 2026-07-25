import { View, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { ThemeText } from '@/components/theme/theme-text'
import { IconButton } from '@/components/ui/icon-button'
import { Avatar } from '@/components/ui/avatar'

export function DashboardHeader() {
  const { colors, spacing } = useTheme()
  const { profile } = useAuth()
  const router = useRouter()

  const userName = profile?.name?.trim() ?? ''

  const nav = (href: string) => router.push(href as any)

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
          backgroundColor: colors.surface,
          borderBottomWidth: Platform.OS === 'web' ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <ThemeText variant="subtitle" style={[styles.brand, { color: colors.primary }]}>
        SeniorEase
      </ThemeText>

      <View style={styles.actions}>
        <IconButton
          icon="notifications-outline"
          onPress={() => nav('/notificacoes')}
          accessibilityLabel="Notificações"
          accessibilityHint="Abre a página de notificações"
          size={22}
        />
        <IconButton
          icon="settings-outline"
          onPress={() => nav('/configuracoes')}
          accessibilityLabel="Configurações"
          accessibilityHint="Abre a página de configurações"
          size={22}
        />
        <View style={{ marginLeft: spacing.sm }}>
          <Avatar
            name={userName}
            size={36}
            onPress={() => nav('/perfil')}
            accessibilityLabel="Abrir perfil"
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
