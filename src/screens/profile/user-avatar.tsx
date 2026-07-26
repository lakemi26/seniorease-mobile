import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'

interface UserAvatarProps {
  name: string
  size?: number
  accessibilityLabel?: string
}

function getInitials(name: string): string {
  const trimmed = name?.trim() ?? ''
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function UserAvatar({ name, size = 80, accessibilityLabel }: UserAvatarProps) {
  const { colors, contrast } = useTheme()

  const circleSize = Math.max(size, 48)

  return (
    <View
      style={[
        styles.circle,
        {
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: colors.primarySoft,
          borderWidth: contrast === 'high' ? 2 : 0,
          borderColor: colors.primaryDark,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? 'Avatar de ' + name}
    >
      <ThemeText
        variant="title"
        style={[styles.initial, { color: colors.primaryDark, fontSize: circleSize * 0.38, lineHeight: circleSize * 0.42 }]}
        allowFontScaling={false}
      >
        {getInitials(name)}
      </ThemeText>
    </View>
  )
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: '700',
  },
})
