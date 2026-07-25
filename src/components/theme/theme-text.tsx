import { Text, type TextProps } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { fontWeight as fw } from '@/shared/theme/typography'

type ThemeTextVariant = 'display' | 'title' | 'subtitle' | 'bodyLarge' | 'body' | 'label' | 'caption' | 'error' | 'link' | 'muted'

interface ThemeTextProps extends TextProps {
  variant?: ThemeTextVariant
  color?: string
}

export function ThemeText({ variant = 'body', color, style, ...rest }: ThemeTextProps) {
  const theme = useTheme()
  const { fontSize, lineHeight, colors } = theme

  const baseColor = color ?? (
    variant === 'error' ? colors.danger :
    variant === 'link' ? colors.primary :
    variant === 'muted' || variant === 'caption' ? colors.textMuted :
    colors.text
  )

  const variantStyle: TextProps['style'] = (() => {
    switch (variant) {
      case 'display':
        return { fontSize: fontSize.display, lineHeight: lineHeight.display, fontWeight: fw.bold }
      case 'title':
        return { fontSize: fontSize.title, lineHeight: lineHeight.title, fontWeight: fw.bold }
      case 'subtitle':
        return { fontSize: fontSize.subtitle, lineHeight: lineHeight.subtitle, fontWeight: fw.semibold }
      case 'bodyLarge':
        return { fontSize: fontSize.bodyLarge, lineHeight: lineHeight.bodyLarge, fontWeight: fw.regular }
      case 'label':
        return { fontSize: fontSize.label, lineHeight: lineHeight.label, fontWeight: fw.medium }
      case 'caption':
        return { fontSize: fontSize.caption, lineHeight: lineHeight.caption, fontWeight: fw.regular }
      case 'error':
        return { fontSize: fontSize.caption, lineHeight: lineHeight.caption, fontWeight: fw.medium }
      case 'link':
        return { fontSize: fontSize.body, lineHeight: lineHeight.body, fontWeight: fw.medium }
      case 'muted':
        return { fontSize: fontSize.body, lineHeight: lineHeight.body, fontWeight: fw.regular }
      default:
        return { fontSize: fontSize.body, lineHeight: lineHeight.body, fontWeight: fw.regular }
    }
  })()

  return (
    <Text
      style={[{ color: baseColor }, variantStyle, style]}
      allowFontScaling
      {...rest}
    />
  )
}
