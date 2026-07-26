import { TextInput, View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { radius } from '@/shared/theme/radius'

interface ActivitySearchProps {
  value: string
  onChange: (value: string) => void
}

export function ActivitySearch({ value, onChange }: ActivitySearchProps) {
  const { colors } = useTheme()

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12 }]}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Buscar atividades…"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Buscar atividades"
        accessibilityHint="Digite para buscar por título, descrição ou categoria"
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1.5,
    height: 44,
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 16,
    fontSize: 16,
    height: '100%',
  },
})
