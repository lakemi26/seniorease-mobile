import { useMemo } from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { colors } from '@/shared/theme/colors'
import { spacing } from '@/shared/theme/spacing'
import { AppText } from './app-text'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      gap: spacing.lg,
    },
    text: {
      textAlign: 'center',
    },
  }), [])

  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText variant="body" color={colors.textMuted} style={styles.text}>
        {message}
      </AppText>
    </View>
  )
}
