import { View } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'

export function ActivityExecutionSkeleton() {
  const { spacing } = useTheme()
  return (
    <ThemeView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
      <ThemeText variant="body">Carregando…</ThemeText>
    </ThemeView>
  )
}
