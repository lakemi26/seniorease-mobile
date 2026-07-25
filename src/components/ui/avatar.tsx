import { Pressable, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { touchSize } from '@/shared/theme/spacing'

interface AvatarProps {
  name: string
  size?: number
  onPress?: () => void
  accessibilityLabel?: string
}

function getInitial(name: string): string {
  return name?.trim()?.charAt(0)?.toUpperCase() ?? '?'
}

export function Avatar({ name, size = 40, onPress, accessibilityLabel }: AvatarProps) {
  const { colors } = useTheme()

  const circleSize = Math.max(size, touchSize.min)

  const content = (
    <View
      style={[
        styles.circle,
        {
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: colors.primarySoft,
        },
      ]}
    >
      <ThemeText
        variant="label"
        style={[styles.initial, { color: colors.primaryDark, fontSize: circleSize * 0.42, lineHeight: circleSize * 0.42 }]}
        allowFontScaling={false}
      >
        {getInitial(name)}
      </ThemeText>
    </View>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `Perfil de ${name}`}
        hitSlop={8}
      >
        {content}
      </Pressable>
    )
  }

  return content
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
