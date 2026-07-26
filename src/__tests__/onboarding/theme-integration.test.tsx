import { getColors, darkColors, lightColors, highContrastColors } from '@/shared/theme/colors'
import { render } from '@testing-library/react-native'
import React from 'react'
import { SelectionCard } from '@/components/onboarding/selection-card'
import { StepProgress } from '@/components/onboarding/step-progress'
import { DynamicPreviewCard } from '@/components/onboarding/dynamic-preview-card'

jest.mock('@/contexts/theme-context', () => ({
  useTheme: jest.fn(),
  ThemeProvider: ({ children }: any) => children,
}))

import { useTheme } from '@/contexts/theme-context'
const mockUseTheme = useTheme as jest.Mock

function makeMockTheme(contrast: 'default' | 'high' | 'dark' = 'default') {
  const colors = getColors(contrast)
  return {
    colors,
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
    fontSize: { caption: 14, label: 15, body: 17, bodyLarge: 19, subtitle: 21, title: 27, display: 32 },
    lineHeight: { caption: 18, label: 20, body: 24, bodyLarge: 26, subtitle: 28, title: 34, display: 40 },
    radius: { sm: 6, md: 10, lg: 14, xl: 20, full: 9999 },
    shadows: { sm: {}, md: {}, lg: {} },
    contrast,
    fontSizePreference: 'normal' as const,
    spacingPreference: 'normal' as const,
    interfaceMode: 'complete' as const,
    reduceMotion: false,
    enhancedFeedback: true,
    confirmCriticalActions: true,
    remindersEnabled: true,
    fontSizeMultiplier: 1,
  }
}

describe('darkColors palette', () => {
  it('uses blue-night background', () => {
    expect(darkColors.background).toBe('#0D1117')
  })

  it('uses blue-night surface', () => {
    expect(darkColors.surface).toBe('#161B22')
  })

  it('uses blue primary', () => {
    expect(darkColors.primary).toBe('#58A6FF')
  })

  it('uses dark border', () => {
    expect(darkColors.border).toBe('#30363D')
  })

  it('does not use teal', () => {
    expect(darkColors.background).not.toBe('#101817')
    expect(darkColors.surface).not.toBe('#172220')
    expect(darkColors.primary).not.toBe('#76C3BC')
    expect(darkColors.border).not.toBe('#40514D')
  })
})

describe('getColors()', () => {
  it('default returns lightColors', () => {
    expect(getColors('default')).toBe(lightColors)
  })

  it('dark returns darkColors', () => {
    expect(getColors('dark')).toBe(darkColors)
  })

  it('high returns highContrastColors', () => {
    expect(getColors('high')).toBe(highContrastColors)
  })

  it('high contrast does not select dark palette', () => {
    const colors = getColors('high')
    expect(colors.background).toBe('#FFFFFF')
    expect(colors.background).not.toBe('#0D1117')
  })

  it('default does not select dark palette', () => {
    const colors = getColors('default')
    expect(colors.background).toBe('#F7F4EE')
    expect(colors.primary).not.toBe('#58A6FF')
  })
})

describe('Onboarding component rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('SelectionCard renders with default theme', () => {
    mockUseTheme.mockReturnValue(makeMockTheme('default'))
    const result = render(
      <SelectionCard label="Teste" description="Descrição" selected={false} onPress={() => {}} />,
    )
    expect(result).toBeDefined()
  })

  it('SelectionCard selected renders dark card', () => {
    mockUseTheme.mockReturnValue(makeMockTheme('dark'))
    const result = render(
      <SelectionCard label="Escuro" description="Fundo escuro" selected onPress={() => {}} />,
    )
    expect(result).toBeDefined()
  })

  it('StepProgress renders with dark theme', () => {
    mockUseTheme.mockReturnValue(makeMockTheme('dark'))
    const result = render(<StepProgress current={3} total={6} />)
    expect(result).toBeDefined()
  })

  it('DynamicPreviewCard renders with light theme', () => {
    mockUseTheme.mockReturnValue(makeMockTheme('default'))
    const result = render(<DynamicPreviewCard />)
    expect(result).toBeDefined()
  })

  it('DynamicPreviewCard renders with dark theme', () => {
    mockUseTheme.mockReturnValue(makeMockTheme('dark'))
    const result = render(<DynamicPreviewCard />)
    expect(result).toBeDefined()
  })
})
