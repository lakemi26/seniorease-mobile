import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { HelpAccordionItem } from './help-accordion-item'
import { HelpStepList } from './help-step-list'
import { HelpRelatedAction } from './help-related-action'
import type { HelpCategory, HelpArticle } from '@/modules/help/data/help-content'

const CATEGORY_ICON_MAP: Record<string, string> = {
  Compass: 'compass-outline',
  User: 'person-outline',
  ListTodo: 'list-outline',
  Calendar: 'calendar-outline',
  SlidersHorizontal: 'options-outline',
  Shield: 'shield-outline',
}

interface HelpCategorySectionProps {
  category: HelpCategory
  articles: HelpArticle[]
  onArticlePress: (article: HelpArticle) => void
  onRelatedRoute: (route: string) => void
}

export function HelpCategorySection({ category, articles, onArticlePress, onRelatedRoute }: HelpCategorySectionProps) {
  const { colors, spacing } = useTheme()
  const iconName = CATEGORY_ICON_MAP[category.icon] ?? 'help-circle-outline'

  if (articles.length === 0) return null

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Ionicons name={iconName as any} size={20} color={colors.primary} />
        <ThemeText variant="subtitle">{category.title}</ThemeText>
      </View>
      <ThemeText variant="caption" style={{ color: colors.textMuted, marginBottom: spacing.xs }}>
        {category.description}
      </ThemeText>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}
      >
        {articles.map((article) => (
          <HelpAccordionItem key={article.id} title={article.title}>
            <ThemeText variant="body" style={{ color: colors.textMuted }}>
              {article.summary}
            </ThemeText>
            {article.steps && article.steps.length > 0 ? (
              <HelpStepList steps={article.steps} />
            ) : null}
            {article.content && article.content.length > 0 ? (
              <View style={{ gap: spacing.xs }}>
                {article.content.map((line, i) => (
                  <ThemeText key={i} variant="body" style={{ color: colors.textMuted }}>
                    {line}
                  </ThemeText>
                ))}
              </View>
            ) : null}
            {article.relatedRoute && article.relatedRouteLabel ? (
              <HelpRelatedAction
                label={article.relatedRouteLabel}
                onPress={() => onRelatedRoute(article.relatedRoute!)}
              />
            ) : null}
          </HelpAccordionItem>
        ))}
      </View>
    </View>
  )
}
