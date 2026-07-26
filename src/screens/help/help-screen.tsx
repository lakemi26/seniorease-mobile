import { useCallback, useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { categories, faqItems, quickLinks, searchArticles, normalizeText, getArticlesByCategory, getBasicModeCategories, getArticleBySlug, type HelpArticle } from '@/modules/help/data/help-content'
import { ThemeText } from '@/components/theme/theme-text'
import { HelpHeader } from './help-header'
import { HelpSearchInput } from './help-search-input'
import { QuickHelpCard } from './quick-help-card'
import { HelpCategorySection } from './help-category-section'
import { HelpAccordionItem } from './help-accordion-item'
import { HelpStepList } from './help-step-list'
import { HelpRelatedAction } from './help-related-action'
import { HelpEmptyState } from './help-empty-state'
import { HelpFooterCard } from './help-footer-card'

export function HelpScreen() {
  const { spacing, colors, interfaceMode } = useTheme()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedQuery = normalizeText(searchQuery)

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return { articles: [] as HelpArticle[], faq: [] as typeof faqItems }
    return {
      articles: searchArticles(normalizedQuery),
      faq: faqItems.filter((faq) => {
        const q = normalizeText(faq.question)
        const a = normalizeText(faq.answer)
        return q.includes(normalizedQuery) || a.includes(normalizedQuery)
      }),
    }
  }, [normalizedQuery])

  const visibleCategories = useMemo(() => {
    if (interfaceMode === 'basic') {
      return getBasicModeCategories()
    }
    return [...categories].sort((a, b) => a.priority - b.priority)
  }, [interfaceMode])

  const visibleQuickLinks = useMemo(() => {
    if (interfaceMode === 'basic') {
      return quickLinks.slice(0, 3)
    }
    return quickLinks
  }, [interfaceMode])

  const visibleFaq = useMemo(() => {
    if (interfaceMode === 'basic') return []
    return faqItems
  }, [interfaceMode])

  const handleArticlePress = useCallback((article: HelpArticle) => {
    if (article.relatedRoute) {
      router.push(article.relatedRoute as any)
    }
  }, [router])

  const handleRelatedRoute = useCallback((route: string) => {
    router.push(route as any)
  }, [router])

  const handleQuickLinkPress = useCallback((slug: string) => {
    const article = getArticleBySlug(slug)
    if (article?.relatedRoute) {
      router.push(article.relatedRoute as any)
    }
  }, [router])

  const hasNoResults = !!(normalizedQuery && searchResults.articles.length === 0 && searchResults.faq.length === 0)

  return (
    <ThemeView style={{ flex: 1 }}>
    <ScrollView
      contentContainerStyle={{
        padding: spacing.lg,
        paddingBottom: spacing.xxxl + 80,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <HelpHeader
        title="Ajuda"
        subtitle="Orientações e dicas para usar o SeniorEase."
      />

      <HelpSearchInput value={searchQuery} onChange={setSearchQuery} />

      <View style={{ height: spacing.lg }} />

      {normalizedQuery && hasNoResults ? (
        <HelpEmptyState query={searchQuery} />
      ) : null}

      {normalizedQuery && !hasNoResults ? (
        <View style={{ gap: spacing.lg }}>
          {searchResults.articles.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              <ThemeText variant="subtitle">Artigos</ThemeText>
              {searchResults.articles.map((article) => (
                <View key={article.id} style={{ paddingVertical: spacing.xs }}>
                  <HelpAccordionItem title={article.title}>
                    <ThemeText variant="body" style={{ color: colors.textMuted }}>
                      {article.summary}
                    </ThemeText>
                    {article.steps && article.steps.length > 0 ? (
                      <HelpStepList steps={article.steps} />
                    ) : null}
                    {article.relatedRoute && article.relatedRouteLabel ? (
                      <HelpRelatedAction
                        label={article.relatedRouteLabel}
                        onPress={() => handleRelatedRoute(article.relatedRoute!)}
                      />
                    ) : null}
                  </HelpAccordionItem>
                </View>
              ))}
            </View>
          ) : null}
          {searchResults.faq.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              <ThemeText variant="subtitle">Perguntas frequentes</ThemeText>
              {searchResults.faq.map((faq, i) => (
                <HelpAccordionItem key={i} title={faq.question}>
                  <ThemeText variant="body" style={{ color: colors.textMuted }}>
                    {faq.answer}
                  </ThemeText>
                </HelpAccordionItem>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {!normalizedQuery ? (
        <View style={{ gap: spacing.xl }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {visibleQuickLinks.map((link, i) => (
              <QuickHelpCard
                key={i}
                item={link}
                onPress={() => handleQuickLinkPress(link.articleSlug)}
              />
            ))}
          </View>

          {visibleCategories.map((category) => (
            <HelpCategorySection
              key={category.id}
              category={category}
              articles={getArticlesByCategory(category.id)}
              onArticlePress={handleArticlePress}
              onRelatedRoute={handleRelatedRoute}
            />
          ))}

          {visibleFaq.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              <ThemeText variant="subtitle">Perguntas frequentes</ThemeText>
              <View
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: 'hidden',
                }}
              >
                {visibleFaq.map((faq, i) => (
                  <HelpAccordionItem key={i} title={faq.question}>
                    <ThemeText variant="body" style={{ color: colors.textMuted }}>
                      {faq.answer}
                    </ThemeText>
                  </HelpAccordionItem>
                ))}
              </View>
            </View>
          ) : null}

          <HelpFooterCard />
        </View>
      ) : null}
    </ScrollView>
    </ThemeView>
  )
}
