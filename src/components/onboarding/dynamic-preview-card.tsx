import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { radius } from '@/shared/theme/radius'

export function DynamicPreviewCard() {
  const { colors, spacing } = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          padding: spacing.md,
          borderRadius: radius.md,
          gap: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
      accessibilityLabel="Prévia visual com as configurações atuais"
      accessibilityElementsHidden
    >
      <View style={[styles.bar, { backgroundColor: colors.primarySoft, borderRadius: radius.sm, padding: spacing.sm }]}>
        <ThemeText variant="subtitle" color={colors.primaryDark}>
          Título de exemplo
        </ThemeText>
      </View>
      <ThemeText variant="body">
        Este é um texto de exemplo mostrando como os conteúdos aparecerão com as
        configurações que você está escolhendo agora.
      </ThemeText>
      <View style={[styles.buttonMock, { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg }]}>
        <ThemeText variant="body" style={{ color: '#FFFFFF' }}>
          Botão de exemplo
        </ThemeText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {},
  bar: {},
  buttonMock: {
    alignSelf: 'flex-start',
  },
})
