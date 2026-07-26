import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { radius } from '@/shared/theme/radius'

export function HelpFooterCard() {
  const { colors, spacing } = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceMuted,
          borderRadius: radius.lg,
          padding: spacing.xl,
          gap: spacing.md,
        },
      ]}
    >
      <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.primary} />
      <View style={{ gap: spacing.xs }}>
        <ThemeText variant="subtitle">
          Não encontrou o que precisava?
        </ThemeText>
        <ThemeText variant="body" style={{ color: colors.textMuted }}>
          Entre em contato conosco pelo e-mail de suporte para receber ajuda personalizada.
        </ThemeText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
})
