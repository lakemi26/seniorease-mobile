import { useMemo } from 'react'
import { ScrollView, Pressable, StyleSheet } from 'react-native'
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
  { value: 'inProgress', label: 'Em andamento' },
]

const COMPLETE_FILTERS: FilterOption[] = [
  { value: 'all', label: 'Todas' },
  { value: 'today', label: 'Hoje' },
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
  const options = isComplete ? COMPLETE_FILTERS : BASIC_FILTERS

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { gap: spacing.sm }]}
      accessibilityRole="tablist"
      accessibilityLabel="Filtros de atividades"
    >
      {options.map((opt) => {
        const selected = period === opt.value
        return (
          <Pressable
            key={opt.value}
            onPress={() => onPeriodChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`${opt.label}${selected ? ', selecionado' : ''}`}
            style={[
              styles.chip,
              {
                paddingHorizontal: spacing.lg,
                borderRadius: radius.full,
                minHeight: touchSize.min,
              },
              selected
                ? {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  }
                : {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
            ]}
          >
            <ThemeText
              variant="label"
              color={selected ? colors.surface : colors.text}
            >
              {opt.label}
            </ThemeText>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  chip: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
})
