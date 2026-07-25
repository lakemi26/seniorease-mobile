import { useMemo } from 'react'
import { Pressable, ActivityIndicator, StyleSheet, type ViewStyle, type TextStyle } from 'react-native'
import { colors } from '@/shared/theme/colors'
import { spacing, touchSize } from '@/shared/theme/spacing'
import { radius } from '@/shared/theme/radius'
import { fontSizeBase as fontSize, fontWeight } from '@/shared/theme/typography'
import { AppText } from './app-text'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

interface AppButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  accessibilityLabel,
  accessibilityHint,
}: AppButtonProps) {
  const isDisabled = disabled || loading

  const styles = useMemo(() => StyleSheet.create({
    base: {
      height: 52,
      borderRadius: radius.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      minHeight: touchSize.min,
    },
    fullWidth: {
      width: '100%',
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.85,
    },
    text: {
      textAlign: 'center',
      fontSize: fontSize.bodyLarge,
      fontWeight: fontWeight.semibold,
    },
    disabledText: {
      color: colors.disabled,
    },
  }), [])

  const btnVariants: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = useMemo(() => ({
    primary: {
      container: { backgroundColor: colors.primary },
      text: { color: '#FFFFFF' } as TextStyle,
    },
    secondary: {
      container: { backgroundColor: colors.surface },
      text: { color: colors.text } as TextStyle,
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
      },
      text: { color: colors.primary } as TextStyle,
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: colors.primary } as TextStyle,
    },
    danger: {
      container: { backgroundColor: colors.danger },
      text: { color: '#FFFFFF' } as TextStyle,
    },
  }), [])

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        btnVariants[variant].container,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        fullWidth && styles.fullWidth,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <AppText
          variant="body"
          style={[
            styles.text,
            btnVariants[variant].text,
            isDisabled && styles.disabledText,
          ]}
        >
          {title}
        </AppText>
      )}
    </Pressable>
  )
}
