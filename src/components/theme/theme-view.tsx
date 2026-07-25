import { View, type ViewProps } from 'react-native'
import { useTheme } from '@/contexts/theme-context'

interface ThemeViewProps extends ViewProps {
  surface?: boolean
  muted?: boolean
}

export function ThemeView({ surface, muted, style, ...rest }: ThemeViewProps) {
  const { colors } = useTheme()

  const bg = surface
    ? colors.surface
    : muted
      ? colors.surfaceMuted
      : colors.background

  return (
    <View
      style={[{ backgroundColor: bg }, style]}
      {...rest}
    />
  )
}
