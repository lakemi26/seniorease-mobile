import { View, StyleSheet } from 'react-native'
import { colors } from '@/shared/theme/colors'
import { spacing } from '@/shared/theme/spacing'
import { radius } from '@/shared/theme/radius'
import { AppText } from './app-text'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <AppText variant="error" style={styles.text}>
        {message}
      </AppText>
      {onRetry ? (
        <AppText
          variant="link"
          style={styles.retry}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
        >
          Tentar novamente
        </AppText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    textAlign: 'center',
  },
  retry: {
    textAlign: 'center',
  },
})
