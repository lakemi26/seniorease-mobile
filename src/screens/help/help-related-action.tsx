import { Pressable, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { touchSize } from '@/shared/theme/spacing'

interface HelpRelatedActionProps {
  label: string
  onPress: () => void
}

export function HelpRelatedAction({ label, onPress }: HelpRelatedActionProps) {
  const { colors, spacing } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Navegar para esta tela"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primaryVerySoft,
          borderRadius: 10,
          padding: spacing.md,
          gap: spacing.sm,
          minHeight: touchSize.min,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <ThemeText variant="body" style={{ color: colors.primary, flex: 1 }}>
        {label}
      </ThemeText>
      <Ionicons name="arrow-forward" size={18} color={colors.primary} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
