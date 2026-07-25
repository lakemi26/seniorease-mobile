import type { PropsWithChildren } from 'react'
import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { radius } from '@/shared/theme/radius'

export function AuthCard({ children }: PropsWithChildren) {
  const { colors, spacing } = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.xxl,
        },
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
})
