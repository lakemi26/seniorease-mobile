import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'

interface PasswordRequirementsProps {
  password: string
}

interface Rule {
  key: string
  label: string
  validate: (p: string) => boolean
}

const rules: Rule[] = [
  { key: 'length', label: 'Pelo menos 8 caracteres', validate: (p) => p.length >= 8 },
  { key: 'letter', label: 'Pelo menos uma letra', validate: (p) => /[a-zA-Z]/.test(p) },
  { key: 'number', label: 'Pelo menos um número', validate: (p) => /[0-9]/.test(p) },
]

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const { colors, spacing } = useTheme()

  return (
    <View style={[styles.container, { gap: spacing.xs }]} accessibilityRole="list">
      {rules.map((rule) => {
        const met = password.length > 0 && rule.validate(password)
        return (
          <View
            key={rule.key}
            style={styles.row}
            accessibilityLabel={`${met ? '✓' : '○'} ${rule.label}`}
          >
            <ThemeText
              variant="caption"
              color={met ? colors.success : colors.textMuted}
              style={styles.icon}
            >
              {met ? '✓' : '○'}
            </ThemeText>
            <ThemeText
              variant="caption"
              color={met ? colors.text : colors.textMuted}
            >
              {rule.label}
            </ThemeText>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 18,
    fontWeight: '700',
  },
})
