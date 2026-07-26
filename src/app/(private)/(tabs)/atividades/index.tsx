import { useCallback } from 'react'
import { View, FlatList, Pressable, StyleSheet } from 'react-native'
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
  const { spacing, interfaceMode } = useTheme()
  const isComplete = interfaceMode === 'complete'

  const {
    filteredGroups,
    visibleCount,
    hasMore,
    isLoading,
    error,
    search,
    period,
    setSearch,
    setPeriod,
    loadMore,
    clearFilters,
  } = useActivitiesList()

  const allFiltered = filteredGroups.flatMap((g) => g.data)
  const visibleActivities = allFiltered.slice(0, visibleCount)
  const isEmpty = !isLoading && !error && allFiltered.length === 0
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
      <Screen>
        <ThemeView style={[styles.centered, { padding: spacing.xl, gap: spacing.lg }]}>
          <ThemeText variant="title">Erro ao carregar atividades</ThemeText>
          <ThemeText variant="body" color="muted">{error}</ThemeText>
          <AppButton title="Tentar novamente" onPress={() => {}} variant="primary" />
        </ThemeView>
      </Screen>
    )
  }

  return (
    <Screen>
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
            data={visibleActivities}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl }}
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
                    title="Carregar mais atividades"
                    onPress={loadMore}
                    variant="outline"
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
