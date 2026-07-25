import type { PropsWithChildren } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/contexts/theme-context'
import { useWindowDimensions } from 'react-native'

interface AuthScreenLayoutProps extends PropsWithChildren {
  scroll?: boolean
}

export function AuthScreenLayout({ children, scroll = true }: AuthScreenLayoutProps) {
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const isTablet = width >= 768
  const horizontalPadding = 20

  const content = (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={[styles.padded, { paddingHorizontal: horizontalPadding }]}>
        <View style={[styles.content, isTablet && { maxWidth: 440, alignSelf: 'center' }]}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  )

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
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
      ) : content}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safe: {
    flex: 1,
  },
  padded: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 32,
  },
})
