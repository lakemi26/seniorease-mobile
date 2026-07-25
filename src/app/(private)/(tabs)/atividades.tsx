import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'

export default function AtividadesScreen() {
  const { colors, spacing } = useTheme()

  return (
    <ThemeView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
      <ThemeText variant="title" style={{ color: colors.text, marginBottom: spacing.sm }}>
        Atividades
      </ThemeText>
      <ThemeText variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>
        Em breve você poderá ver e gerenciar todas as suas atividades aqui.
      </ThemeText>
    </ThemeView>
  )
}
