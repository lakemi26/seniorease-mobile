import { useState } from 'react'
import { Modal, Pressable, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { radius } from '@/shared/theme/radius'
import { touchSize } from '@/shared/theme/spacing'
import type { PeriodFilter } from '../hook/use-activities-list'

interface FilterOption {
  value: PeriodFilter
  label: string
}

const BASIC_FILTERS: FilterOption[] = [
  { value: 'all', label: 'Todas' },
  { value: 'today', label: 'Hoje' },
  { value: 'overdue', label: 'Atrasadas' },
  { value: 'inProgress', label: 'Em andamento' },
]

const COMPLETE_FILTERS: FilterOption[] = [
  { value: 'all', label: 'Todas' },
  { value: 'today', label: 'Hoje' },
  { value: 'overdue', label: 'Atrasadas' },
  { value: 'upcoming', label: 'Próximas' },
  { value: 'inProgress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluídas' },
]

interface ActivityFiltersProps {
  period: PeriodFilter
  onPeriodChange: (period: PeriodFilter) => void
  isComplete?: boolean
}

export function ActivityFilters({ period, onPeriodChange, isComplete = false }: ActivityFiltersProps) {
  const { colors, spacing } = useTheme()
  const [open, setOpen] = useState(false)

  const options = isComplete ? COMPLETE_FILTERS : BASIC_FILTERS
  const currentLabel = options.find((o) => o.value === period)?.label ?? 'Todas'

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Filtro atual: ${currentLabel}. Toque para alterar`}
        accessibilityHint="Abre lista de filtros disponíveis"
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.lg,
            minHeight: touchSize.min,
            gap: spacing.sm,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="funnel-outline" size={18} color={colors.textMuted} />
        <ThemeText variant="label" style={{ flex: 1 }}>
          {currentLabel}
        </ThemeText>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          onPress={() => setOpen(false)}
          accessibilityLabel="Fechar filtro"
        >
          <Pressable
            onPress={() => {}}
            style={[
              styles.menu,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                borderColor: colors.border,
                marginHorizontal: spacing.xl,
              },
            ]}
          >
            {options.map((opt, i) => {
              const selected = period === opt.value
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onPeriodChange(opt.value)
                    setOpen(false)
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${opt.label}${selected ? ', selecionado' : ''}`}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md,
                      minHeight: touchSize.min,
                      backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
                      borderBottomWidth: i < options.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <ThemeText
                    variant="body"
                    style={{ fontWeight: selected ? '700' : '400' }}
                  >
                    {opt.label}
                  </ThemeText>
                  {selected ? (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  ) : null}
                </Pressable>
              )
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
