import { Pressable, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { touchSize } from '@/shared/theme/spacing'

type IconName = keyof typeof Ionicons.glyphMap

interface IconButtonProps {
  icon: IconName
  label?: string
  onPress: () => void
  size?: number
  color?: string
  accessibilityLabel?: string
  accessibilityHint?: string
  badge?: number
}

export function IconButton({
  icon,
  label,
  onPress,
  size = 24,
  color,
  accessibilityLabel,
  accessibilityHint,
  badge,
}: IconButtonProps) {
  const { colors } = useTheme()

  const iconColor = color ?? colors.text

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label ?? icon}
      accessibilityHint={accessibilityHint}
      style={styles.container}
      hitSlop={8}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={size} color={iconColor} />
        {badge != null && badge > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
            <ThemeText
              variant="caption"
              style={[styles.badgeText, { color: colors.surface }]}
              allowFontScaling={false}
            >
              {badge > 9 ? '9+' : badge}
            </ThemeText>
          </View>
        )}
      </View>
      {label && (
        <ThemeText variant="caption" style={styles.label} allowFontScaling>
          {label}
        </ThemeText>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: touchSize.min,
    minHeight: touchSize.min,
  },
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  label: {
    marginTop: 2,
  },
})
