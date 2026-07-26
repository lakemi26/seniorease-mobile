import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { radius } from '@/shared/theme/radius'

export function ActivityListSkeleton() {
  const { colors, spacing } = useTheme()

  return (
    <View style={[styles.container, { gap: spacing.md, padding: spacing.lg }]}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
              gap: spacing.sm,
            },
          ]}
        >
          <View
            style={[styles.line, { width: '70%', backgroundColor: colors.surfaceMuted }]}
          />
          <View
            style={[styles.line, { width: '50%', backgroundColor: colors.surfaceMuted }]}
          />
          <View
            style={[styles.line, { width: '30%', backgroundColor: colors.surfaceMuted }]}
          />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
    minHeight: 80,
  },
  line: {
    height: 14,
    borderRadius: 4,
  },
})
