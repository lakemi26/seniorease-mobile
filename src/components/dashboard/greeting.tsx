import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { useAuth } from '@/contexts/auth-context'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getFirstName(name: string): string {
  return name?.trim()?.split(' ')[0] ?? ''
}

export function Greeting() {
  const { colors, spacing } = useTheme()
  const { profile } = useAuth()

  const name = profile?.name?.trim() ?? ''
  const firstName = getFirstName(name)
  const greeting = getGreeting()
  const displayName = firstName || ''

  return (
    <View style={{ gap: spacing.xs }}>
      <ThemeText
        variant="title"
        style={{ color: colors.text }}
      >
        {displayName ? `${greeting}, ${displayName}.` : `${greeting}.`}
      </ThemeText>
      <ThemeText variant="body" style={{ color: colors.textMuted }}>
        Veja suas próximas atividades e continue de onde parou.
      </ThemeText>
    </View>
  )
}
