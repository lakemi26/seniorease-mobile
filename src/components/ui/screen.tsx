import type { PropsWithChildren } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { spacing } from '@/shared/theme/spacing'
import { colors } from '@/shared/theme/colors'

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean
  padded?: boolean
}

export function Screen({ children, scroll = true, padded = true }: ScreenProps) {
  const content = (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={padded ? styles.padded : undefined}>{children}</View>
    </SafeAreaView>
  )

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safe: {
    flex: 1,
  },
  padded: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
})
