import { Pressable, TextInput, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { radius } from '@/shared/theme/radius'
import { touchSize } from '@/shared/theme/spacing'

interface HelpSearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function HelpSearchInput({ value, onChange }: HelpSearchInputProps) {
  const { colors, spacing } = useTheme()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          paddingHorizontal: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <Ionicons name="search-outline" size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Buscar orientação…"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Buscar orientação"
        accessibilityHint="Digite para buscar artigos e perguntas frequentes"
        style={[
          styles.input,
          {
            color: colors.text,
            flex: 1,
          },
        ]}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={8}
          style={{ minHeight: touchSize.min, justifyContent: 'center' }}
        >
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: touchSize.min,
  },
  input: {
    fontSize: 16,
    height: '100%',
    paddingVertical: 0,
  },
})
