import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'

export function DashboardSkeleton() {
  const { colors, spacing } = useTheme()

  return (
    <View style={{ gap: spacing.lg, padding: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.surfaceMuted }]} />
        <View style={[styles.skeletonLine, { width: '80%', backgroundColor: colors.surfaceMuted }]} />
      </View>
      <View style={{ gap: spacing.md, padding: spacing.lg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  skeletonLine: {
    height: 20,
    borderRadius: 4,
  },
})
