import { useCallback } from 'react'
import { View, FlatList, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import { Screen } from '@/components/ui/screen'
import { AppButton } from '@/components/ui/app-button'
import { useActivitiesList } from '@/screens/activities/hook/use-activities-list'
import { ActivityCard } from '@/screens/activities/components/activity-card'
import { ActivityFilters } from '@/screens/activities/components/activity-filters'
import { ActivitySearch } from '@/screens/activities/components/activity-search'
import { ActivityEmptyState } from '@/screens/activities/components/activity-empty-state'
import { ActivityListSkeleton } from '@/screens/activities/components/activity-list-skeleton'

export default function ActivitiesListScreen() {
  const router = useRouter()
  const { colors, spacing, interfaceMode } = useTheme()
  const isComplete = interfaceMode === 'complete'

  const {
    filteredGroups,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    search,
    period,
    setSearch,
    setPeriod,
    loadMore,
    refresh,
    clearFilters,
  } = useActivitiesList()

  const allFiltered = filteredGroups.flatMap((g) => g.data)
  const isEmpty = !isLoading && !error && allFiltered.length === 0 && !hasMore
  const hasFilters = period !== 'all' || search.trim().length > 0

  const handleCardPress = useCallback(
    (id: string) => {
      router.push(`/atividades/${id}` as any)
    },
    [router],
  )

  const handleCreatePress = useCallback(() => {
    router.push('/atividades/nova')
  }, [router])

  if (error) {
    return (
      <Screen padded={false}>
        <ThemeView style={[styles.centered, { padding: spacing.xl, gap: spacing.lg }]}>
          <ThemeText variant="title">Erro ao carregar atividades</ThemeText>
          <ThemeText variant="body" style={{ color: colors.textMuted }}>{error}</ThemeText>
          <AppButton title="Tentar novamente" onPress={refresh} variant="primary" />
        </ThemeView>
      </Screen>
    )
  }

  return (
    <Screen scroll={false} padded={false}>
      <ThemeView style={{ flex: 1 }}>
        <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md }]}>
          <ThemeText variant="display">Atividades</ThemeText>

          <ActivitySearch value={search} onChange={setSearch} />

          <ActivityFilters
            period={period}
            onPeriodChange={setPeriod}
            isComplete={isComplete}
          />
        </View>

        {isLoading ? (
          <ActivityListSkeleton />
        ) : isEmpty ? (
          <ActivityEmptyState
            hasFilters={hasFilters}
            onCreatePress={handleCreatePress}
            onClearFilters={hasFilters ? clearFilters : undefined}
          />
        ) : (
          <FlatList
            data={allFiltered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl }}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ActivityCard
                activity={item}
                onPress={() => handleCardPress(item.id)}
                compact={!isComplete}
              />
            )}
            ListFooterComponent={
              hasMore ? (
                <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
                  <AppButton
                    title={isLoadingMore ? 'Carregando...' : 'Carregar mais atividades'}
                    onPress={loadMore}
                    variant="outline"
                    loading={isLoadingMore}
                  />
                </View>
              ) : null
            }
          />
        )}
      </ThemeView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {},
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
