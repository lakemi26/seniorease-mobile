import { type ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { Ionicons } from '@expo/vector-icons'

interface ProfileActionRowProps {
  label: string
  description?: string
  value?: string
  icon?: string
  onPress?: () => void
  disabled?: boolean
  accessibilityHint?: string
  children?: ReactNode
}

export function ProfileActionRow({
  label,
  description,
  value,
  icon,
  onPress,
  disabled,
  accessibilityHint,
  children,
}: ProfileActionRowProps) {
  const { colors, spacing } = useTheme()

  const content = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          gap: spacing.sm,
          minHeight: 48,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {icon ? (
        <View style={{ width: 24, alignItems: 'center' }}>
          <Ionicons name={icon as any} size={20} color={disabled ? colors.disabled : colors.textMuted} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <ThemeText variant="body" style={{ color: disabled ? colors.disabled : colors.text }}>
          {label}
        </ThemeText>
        {description ? (
          <ThemeText variant="caption" color={disabled ? colors.disabled : colors.textMuted}>
            {description}
          </ThemeText>
        ) : null}
      </View>
      {value ? (
        <ThemeText variant="body" color={colors.textMuted}>
          {value}
        </ThemeText>
      ) : null}
      {children}
      {onPress ? (
        <Ionicons name="chevron-forward" size={18} color={disabled ? colors.disabled : colors.textMuted} />
      ) : null}
    </View>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [
          { backgroundColor: pressed ? colors.surfaceMuted : 'transparent' },
        ]}
      >
        {content}
      </Pressable>
    )
  }

  return content
}
