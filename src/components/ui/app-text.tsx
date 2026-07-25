import { useMemo } from 'react'
import { Text, type TextProps } from 'react-native'
import { colors } from '@/shared/theme/colors'
import { fontWeight } from '@/shared/theme/typography'

type AppTextVariant = 'display' | 'heading' | 'title' | 'subtitle' | 'body' | 'bodyLarge' | 'caption' | 'error' | 'link'

interface AppTextProps extends TextProps {
  variant?: AppTextVariant
  color?: string
}

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  const baseColor = colors.text

  const variantStyle = useMemo(() => {
    const variants: Record<AppTextVariant, TextProps['style']> = {
      display: { fontSize: 34, lineHeight: 41, fontWeight: fontWeight.bold },
      heading: { fontSize: 28, lineHeight: 37, fontWeight: fontWeight.bold },
      title: { fontSize: 24, lineHeight: 32, fontWeight: fontWeight.semibold },
      subtitle: { fontSize: 20, lineHeight: 27, fontWeight: fontWeight.medium },
      bodyLarge: { fontSize: 18, lineHeight: 25, fontWeight: fontWeight.regular },
      body: { fontSize: 16, lineHeight: 22, fontWeight: fontWeight.regular },
      caption: { fontSize: 13, lineHeight: 18, fontWeight: fontWeight.regular, color: colors.textMuted },
      error: { fontSize: 13, lineHeight: 18, fontWeight: fontWeight.medium, color: colors.danger },
      link: { fontSize: 16, lineHeight: 22, fontWeight: fontWeight.medium, color: colors.primary },
    }
    return variants[variant]
  }, [variant])

  return (
    <Text
      style={[
        { color: baseColor },
        variantStyle,
        color ? { color } : undefined,
        style,
      ]}
      allowFontScaling
      {...rest}
    />
  )
}
