import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'

interface HelpHeaderProps {
  title: string
  subtitle: string
}

export function HelpHeader({ title, subtitle }: HelpHeaderProps) {
  const { colors, spacing } = useTheme()

  return (
    <View style={{ gap: spacing.xs, marginBottom: spacing.lg }}>
      <ThemeText variant="display">
        {title}
      </ThemeText>
      <ThemeText variant="body" style={{ color: colors.textMuted }}>
        {subtitle}
      </ThemeText>
    </View>
  )
}
