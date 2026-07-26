import { Pressable, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { radius } from '@/shared/theme/radius'
import { touchSize } from '@/shared/theme/spacing'
import type { HelpQuickLink } from '@/modules/help/data/help-content'

const ICON_MAP: Record<string, string> = {
  PlusCircle: 'add-circle-outline',
  PlayCircle: 'play-circle-outline',
  Type: 'text-outline',
  KeyRound: 'key-outline',
}

interface QuickHelpCardProps {
  item: HelpQuickLink
  onPress: () => void
}

export function QuickHelpCard({ item, onPress }: QuickHelpCardProps) {
  const { colors, spacing } = useTheme()
  const iconName = ICON_MAP[item.icon] ?? 'help-circle-outline'

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityHint={item.description}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          gap: spacing.sm,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primaryVerySoft, borderRadius: radius.md }]}>
        <Ionicons name={iconName as any} size={22} color={colors.primary} />
      </View>
      <ThemeText variant="label" numberOfLines={2}>
        {item.title}
      </ThemeText>
      <ThemeText variant="caption" style={{ color: colors.textMuted }} numberOfLines={2}>
        {item.description}
      </ThemeText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    minHeight: touchSize.min,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
