import { Pressable, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { radius } from '@/shared/theme/radius'

interface CheckboxFieldProps {
  checked: boolean
  onValueChange: (value: boolean) => void
  label: string
  error?: string
}

export function CheckboxField({ checked, onValueChange, label, error }: CheckboxFieldProps) {
  const { colors, spacing } = useTheme()

  return (
    <View style={{ gap: spacing.xs }}>
      <Pressable
        onPress={() => onValueChange(!checked)}
        style={styles.row}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
      >
        <View
          style={[
            styles.box,
            {
              borderColor: error ? colors.danger : checked ? colors.primary : colors.border,
              backgroundColor: checked ? colors.primary : 'transparent',
              borderRadius: radius.sm,
            },
          ]}
        >
          {checked ? (
            <ThemeText variant="caption" style={styles.check}>✓</ThemeText>
          ) : null}
        </View>
        <ThemeText variant="body" style={styles.label}>
          {label}
        </ThemeText>
      </Pressable>
      {error ? (
        <ThemeText variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </ThemeText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 16,
  },
  label: {
    flex: 1,
    marginLeft: 10,
  },
  error: {
    marginLeft: 32,
  },
})
