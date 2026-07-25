import { Pressable, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { radius as radiusTokens } from '@/shared/theme/radius'

interface SelectionCardProps {
  label: string
  description: string
  selected: boolean
  onPress: () => void
  accessibilityHint?: string
}

export function SelectionCard({ label, description, selected, onPress, accessibilityHint }: SelectionCardProps) {
  const { colors, spacing } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}. ${description}`}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? colors.primaryVerySoft : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1.5,
          padding: spacing.md,
          gap: spacing.xs,
          borderRadius: radiusTokens.md,
          minHeight: 48,
        },
        pressed && !selected ? { opacity: 0.85 } : undefined,
      ]}
    >
      <View style={[styles.row, { gap: spacing.sm }]}>
        <ThemeText variant="body" color={selected ? colors.primaryDark : undefined} style={styles.label}>
          {label}
        </ThemeText>
        {selected ? (
          <View style={[styles.check, { backgroundColor: colors.primary, borderRadius: 12 }]} accessibilityElementsHidden>
            <ThemeText variant="caption" style={{ color: '#FFFFFF', fontSize: 12, lineHeight: 16 }}>✓</ThemeText>
          </View>
        ) : null}
      </View>
      <ThemeText variant="caption">
        {description}
      </ThemeText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
  },
  check: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
