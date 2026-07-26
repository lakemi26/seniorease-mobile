import { render, fireEvent } from '@testing-library/react-native'

jest.mock('@/contexts/theme-context', () => {
  const colors = jest.requireActual('@/shared/theme/colors')
  const spacing = jest.requireActual('@/shared/theme/spacing')
  const r = jest.requireActual('@/shared/theme/radius')
  const typography = jest.requireActual('@/shared/theme/typography')
  const shadows = jest.requireActual('@/shared/theme/shadows')
  return {
    useTheme: () => ({
      colors: colors.lightColors,
      spacing: spacing.spacingNormal,
      fontSize: typography.fontSizeBase,
      lineHeight: typography.lineHeightBase,
      fontSizeMultiplier: 1,
      radius: r.radius,
      shadows: shadows.createShadows(2),
      fontSizePreference: 'normal' as const,
      contrast: 'default' as const,
      spacingPreference: 'normal' as const,
      interfaceMode: 'complete' as const,
      reduceMotion: false,
      enhancedFeedback: true,
      confirmCriticalActions: true,
      remindersEnabled: true,
    }),
    ThemeProvider: ({ children }: any) => children,
    buildTheme: jest.fn(),
  }
})

import { HelpHeader } from '@/screens/help/help-header'
import { HelpSearchInput } from '@/screens/help/help-search-input'
import { HelpEmptyState } from '@/screens/help/help-empty-state'
import { HelpFooterCard } from '@/screens/help/help-footer-card'
import { HelpAccordionItem } from '@/screens/help/help-accordion-item'
import { HelpRelatedAction } from '@/screens/help/help-related-action'
import { HelpStepList } from '@/screens/help/help-step-list'

describe('HelpHeader', () => {
  it('renders title and subtitle', async () => {
    const { getByText } = await render(
      <HelpHeader title="Ajuda" subtitle="Orientações e dicas." />,
    )
    expect(getByText('Ajuda')).toBeTruthy()
    expect(getByText('Orientações e dicas.')).toBeTruthy()
  })
})

describe('HelpSearchInput', () => {
  it('renders with placeholder', async () => {
    const { getByPlaceholderText } = await render(
      <HelpSearchInput value="" onChange={jest.fn()} />,
    )
    expect(getByPlaceholderText('Buscar orientação…')).toBeTruthy()
  })

  it('shows clear button when value is not empty', async () => {
    const { getByLabelText } = await render(
      <HelpSearchInput value="atividade" onChange={jest.fn()} />,
    )
    expect(getByLabelText('Limpar busca')).toBeTruthy()
  })

  it('calls onChange when text is entered', async () => {
    const onChange = jest.fn()
    const { getByPlaceholderText } = await render(
      <HelpSearchInput value="" onChange={onChange} />,
    )
    fireEvent.changeText(getByPlaceholderText('Buscar orientação…'), 'senha')
    expect(onChange).toHaveBeenCalledWith('senha')
  })

  it('calls onChange with empty when clear is pressed', async () => {
    const onChange = jest.fn()
    const { getByLabelText } = await render(
      <HelpSearchInput value="teste" onChange={onChange} />,
    )
    fireEvent.press(getByLabelText('Limpar busca'))
    expect(onChange).toHaveBeenCalledWith('')
  })
})

describe('HelpEmptyState', () => {
  it('shows the query in the message', async () => {
    const { getByText } = await render(<HelpEmptyState query="xyz123" />)
    expect(getByText(/xyz123/)).toBeTruthy()
    expect(getByText('Nenhum resultado encontrado')).toBeTruthy()
  })
})

describe('HelpFooterCard', () => {
  it('renders support message', async () => {
    const { getByText } = await render(<HelpFooterCard />)
    expect(getByText('Não encontrou o que precisava?')).toBeTruthy()
  })
})

describe('HelpAccordionItem', () => {
  it('renders title and responds to press', async () => {
    const { getByText } = await render(
      <HelpAccordionItem title="Como criar uma atividade?">
        <HelpFooterCard />
      </HelpAccordionItem>,
    )
    expect(getByText('Como criar uma atividade?')).toBeTruthy()
    fireEvent.press(getByText('Como criar uma atividade?'))
    expect(getByText('Não encontrou o que precisava?')).toBeTruthy()
  })
})

describe('HelpRelatedAction', () => {
  it('renders label and calls onPress', async () => {
    const onPress = jest.fn()
    const { getByText } = await render(
      <HelpRelatedAction label="Abrir dashboard" onPress={onPress} />,
    )
    expect(getByText('Abrir dashboard')).toBeTruthy()
    fireEvent.press(getByText('Abrir dashboard'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

describe('HelpStepList', () => {
  const steps = [
    { id: '1', title: 'Primeiro passo', description: 'Descrição do primeiro passo' },
    { id: '2', title: 'Segundo passo', description: 'Descrição do segundo passo' },
  ]

  it('renders all steps with numbers', async () => {
    const { getByText } = await render(<HelpStepList steps={steps} />)
    expect(getByText('Primeiro passo')).toBeTruthy()
    expect(getByText('Descrição do primeiro passo')).toBeTruthy()
    expect(getByText('Segundo passo')).toBeTruthy()
    expect(getByText('Descrição do segundo passo')).toBeTruthy()
  })
})
