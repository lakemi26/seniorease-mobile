import { View, Switch, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'

interface SettingSwitchRowProps {
  label: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
  accessibilityHint?: string
}

export function SettingSwitchRow({ label, description, value, onValueChange, accessibilityHint }: SettingSwitchRowProps) {
  const { colors, spacing, contrast } = useTheme()

  return (
    <View
      style={[styles.container, { minHeight: 48, gap: spacing.xs, paddingVertical: spacing.sm }]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={`${label}. ${description}`}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.row}>
        <View style={[styles.textContainer, { gap: spacing.xs }]}>
          <ThemeText variant="body">{label}</ThemeText>
          <ThemeText variant="caption">{description}</ThemeText>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: contrast === 'dark' ? colors.primaryDark : colors.primarySoft }}
          thumbColor={value ? (contrast === 'dark' ? colors.text : colors.primary) : colors.textMuted}
          ios_backgroundColor={colors.border}
        />
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
})
