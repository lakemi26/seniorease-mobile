import type { PropsWithChildren } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/contexts/theme-context'

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean
  padded?: boolean
}

export function Screen({ children, scroll = true, padded = true }: ScreenProps) {
  const { colors } = useTheme()

  const content = (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {padded ? <View style={styles.padded}>{children}</View> : children}
    </SafeAreaView>
  )

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
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
  scrollContent: {
    flexGrow: 1,
  },
  safe: {
    flex: 1,
  },
  padded: {
    flex: 1,
  },
})
