import { useState } from 'react'
import { Pressable, View, StyleSheet, TextInput } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'

interface PasswordInputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  onBlur?: () => void
  error?: string
  required?: boolean
  placeholder?: string
}

export function PasswordInput({ label, value, onChangeText, onBlur, error, required, placeholder }: PasswordInputProps) {
  const { colors, spacing } = useTheme()
  const [visible, setVisible] = useState(false)
  const [focused, setFocused] = useState(false)

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={styles.labelRow}>
        <ThemeText variant="label">{label}</ThemeText>
        {required ? (
          <ThemeText variant="label" color={colors.danger} accessibilityLabel="obrigatório">
            {' *'}
          </ThemeText>
        ) : null}
      </View>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
            borderWidth: focused ? 2 : 1.5,
            borderRadius: 12,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={() => { setFocused(false); onBlur?.() }}
          onFocus={() => setFocused(true)}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={required ? `${label}, obrigatório` : label}
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: 17,
              minHeight: 48,
              flex: 1,
            },
          ]}
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          style={styles.toggle}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          accessibilityState={{ selected: visible }}
          hitSlop={4}
        >
          <ThemeText variant="body" style={styles.eyeIcon}>
            {visible ? '🙈' : '👁'}
          </ThemeText>
        </Pressable>
      </View>
      {error ? (
        <ThemeText variant="caption" color={colors.danger}>{error}</ThemeText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    paddingVertical: 0,
  },
  toggle: {
    minHeight: 48,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
})
