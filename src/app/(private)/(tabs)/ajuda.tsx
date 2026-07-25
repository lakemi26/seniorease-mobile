import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'

export default function AjudaScreen() {
  const { colors, spacing } = useTheme()

  return (
    <ThemeView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
      <ThemeText variant="title" style={{ color: colors.text, marginBottom: spacing.sm }}>
        Ajuda
      </ThemeText>
      <ThemeText variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>
        Em breve você encontrará orientações e dicas para usar o SeniorEase.
      </ThemeText>
    </ThemeView>
  )
}
