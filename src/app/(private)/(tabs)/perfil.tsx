import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { useAuth } from '@/contexts/auth-context'
import { Avatar } from '@/components/ui/avatar'

export default function PerfilScreen() {
  const { colors, spacing } = useTheme()
  const { profile, signOut } = useAuth()

  const userName = profile?.name?.trim() ?? 'Usuário'
  const userEmail = profile?.email ?? ''

  return (
    <ThemeView style={{ flex: 1, padding: spacing.xl }}>
      <View style={{ alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl }}>
        <Avatar name={userName} size={80} />
        <View style={{ alignItems: 'center', gap: 4 }}>
          <ThemeText variant="title" style={{ color: colors.text }}>
            {userName}
          </ThemeText>
          {userEmail && (
            <ThemeText variant="body" style={{ color: colors.textMuted }}>
              {userEmail}
            </ThemeText>
          )}
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <AppButton
        title="Sair"
        onPress={() => signOut()}
        variant="danger"
        fullWidth
        accessibilityLabel="Sair da conta"
      />
    </ThemeView>
  )
}
