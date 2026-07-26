import { useRef, useState } from 'react'
import { Animated, Pressable, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { touchSize } from '@/shared/theme/spacing'

interface HelpAccordionItemProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

export function HelpAccordionItem({ title, children, defaultExpanded = false }: HelpAccordionItemProps) {
  const { colors, spacing, reduceMotion } = useTheme()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const animHeight = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current

  function toggle() {
    const toValue = expanded ? 0 : 1
    if (reduceMotion) {
      animHeight.setValue(toValue)
    } else {
      Animated.timing(animHeight, {
        toValue,
        duration: 250,
        useNativeDriver: false,
      }).start()
    }
    setExpanded(!expanded)
  }

  const maxHeight = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2000],
  })

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded }}
        accessibilityHint={expanded ? 'Recolher' : 'Expandir para ler o conteúdo'}
        style={({ pressed }) => [
          styles.header,
          {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            minHeight: touchSize.min,
            backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
          },
        ]}
      >
        <ThemeText variant="body" style={{ flex: 1 }}>
          {title}
        </ThemeText>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
      <Animated.View
        style={[
          styles.body,
          {
            maxHeight,
            overflow: 'hidden',
          },
        ]}
      >
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm }}>
          {children}
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  body: {},
})
