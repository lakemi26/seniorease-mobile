import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'

export function BrandMark() {
  const { colors } = useTheme()

  return (
    <View style={styles.container} accessibilityRole="header">
      <ThemeText variant="title" color={colors.primary}>
        SeniorEase
      </ThemeText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
})
