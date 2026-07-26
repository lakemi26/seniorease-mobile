import { type ReactNode } from 'react'
import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'

interface ProfileSectionProps {
  title: string
  description?: string
  children: ReactNode
}

export function ProfileSection({ title, description, children }: ProfileSectionProps) {
  const { colors, spacing } = useTheme()

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <ThemeText variant="subtitle" style={{ color: colors.text }}>
          {title}
        </ThemeText>
        {description ? (
          <ThemeText variant="caption" color={colors.textMuted}>
            {description}
          </ThemeText>
        ) : null}
      </View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  )
}
