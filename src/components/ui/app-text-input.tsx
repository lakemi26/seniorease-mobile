import { useId, useMemo, useState } from 'react'
import { TextInput, StyleSheet, type TextInputProps, View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { radius } from '@/shared/theme/radius'
import { ThemeText } from '@/components/theme/theme-text'

interface AppTextInputProps extends TextInputProps {
  label: string
  error?: string
  required?: boolean
}

export function AppTextInput({ label, error, required, placeholder, style, ...rest }: AppTextInputProps) {
  const id = useId()
  const inputId = `input-${id}`
  const errorId = `error-${id}`
  const { colors, spacing } = useTheme()
  const [focused, setFocused] = useState(false)

  const styles = useMemo(() => StyleSheet.create({
    wrapper: {
      gap: spacing.xs,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: spacing.xs,
    },
    input: {
      height: 52,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: spacing.lg,
      fontSize: 16,
      lineHeight: 22,
    },
  }), [spacing])

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <ThemeText variant="label" nativeID={`label-${inputId}`}>
          {label}
        </ThemeText>
        {required ? (
          <ThemeText variant="label" color={colors.danger} accessibilityLabel="obrigatório">
            {' *'}
          </ThemeText>
        ) : null}
      </View>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
            color: colors.text,
            backgroundColor: colors.surface,
          },
          style,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={required ? `${label}, obrigatório` : label}
        accessibilityLabelledBy={`label-${inputId}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {error ? (
        <ThemeText
          variant="caption"
          color={colors.danger}
          style={{ marginLeft: spacing.xs }}
          nativeID={errorId}
          accessibilityRole="alert"
        >
          {error}
        </ThemeText>
      ) : null}
    </View>
  )
}
