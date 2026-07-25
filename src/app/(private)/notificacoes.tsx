import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { useRouter } from 'expo-router'

export default function NotificacoesScreen() {
  const { colors, spacing } = useTheme()
  const router = useRouter()

  return (
    <ThemeView style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md }}>
        <AppButton title="Voltar" onPress={() => router.back()} variant="ghost" />
        <ThemeText variant="title" style={{ color: colors.text }}>Notificações</ThemeText>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <ThemeText variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>
          Em breve você verá suas notificações aqui.
        </ThemeText>
      </View>
    </ThemeView>
  )
}
