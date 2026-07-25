import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { AppText } from './app-text'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  const { colors, spacing } = useTheme()

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, gap: spacing.lg },
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText variant="body" color={colors.textMuted} style={styles.text}>
        {message}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
})
