import { useState } from 'react'
import { View, Pressable, Modal, FlatList, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { radius } from '@/shared/theme/radius'
import { touchSize } from '@/shared/theme/spacing'
import { CATEGORY_OPTIONS } from '@/modules/activities/domain/activity-utils'
import type { ActivityCategory } from '@/modules/activities/domain/entities'

interface CategorySelectorProps {
  value: ActivityCategory | undefined
  onChange: (category: ActivityCategory) => void
  error?: string
}

export function CategorySelector({ value, onChange, error }: CategorySelectorProps) {
  const { colors, spacing } = useTheme()
  const [open, setOpen] = useState(false)

  const selectedLabel = value
    ? CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value
    : 'Selecione uma categoria'

  return (
    <View style={{ gap: spacing.xs }}>
      <ThemeText variant="label">
        Categoria <ThemeText variant="caption" color={colors.danger}>*</ThemeText>
      </ThemeText>

      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Categoria: ${selectedLabel}. Toque para alterar.`}
        accessibilityHint="Abre a lista de categorias"
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: 12,
            paddingHorizontal: spacing.lg,
            minHeight: touchSize.min,
          },
        ]}
      >
        <ThemeText
          variant="body"
          color={value ? colors.text : colors.textMuted}
        >
          {selectedLabel}
        </ThemeText>
      </Pressable>

      {error && (
        <ThemeText variant="caption" color={colors.danger} accessibilityRole="alert">
          {error}
        </ThemeText>
      )}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                padding: spacing.xl,
                gap: spacing.md,
              },
            ]}
          >
            <ThemeText variant="subtitle">Selecione uma categoria</ThemeText>

            <FlatList
              data={CATEGORY_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const selected = value === item.value
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value)
                      setOpen(false)
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${item.label}${selected ? ', selecionado' : ''}`}
                    style={[
                      styles.option,
                      {
                        paddingVertical: spacing.md,
                        paddingHorizontal: spacing.lg,
                        borderRadius: radius.md,
                        minHeight: touchSize.min,
                      },
                      selected && { backgroundColor: colors.primarySoft },
                    ]}
                  >
                    <ThemeText
                      variant="body"
                      color={selected ? colors.primary : colors.text}
                    >
                      {item.label}
                    </ThemeText>
                    {selected && (
                      <ThemeText variant="caption" color={colors.primary}>
                        ✓
                      </ThemeText>
                    )}
                  </Pressable>
                )
              }}
            />

            <AppButton
              title="Fechar"
              onPress={() => setOpen(false)}
              variant="ghost"
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  trigger: {
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
