import { render, fireEvent } from '@testing-library/react-native'
import { DateTimeField } from '@/screens/activities/components/date-time-field'

jest.mock('@/contexts/theme-context', () => {
  const { mockTheme } = jest.requireActual('@/__tests__/helpers/mock-theme')

  return {
    useTheme: () => mockTheme,
    ThemeProvider: ({ children }: any) => children,
    buildTheme: jest.fn(() => mockTheme),
  }
})

describe('DateTimeField', () => {
  it('does not fill the current time when focused', async () => {
    const onTimeChange = jest.fn()
    const { getByLabelText } = await render(
      <DateTimeField
        dateValue="2026-07-26"
        hasTime
        timeValue=""
        onDateChange={jest.fn()}
        onHasTimeChange={jest.fn()}
        onTimeChange={onTimeChange}
      />,
    )

    fireEvent(getByLabelText('Horário'), 'focus')

    expect(onTimeChange).not.toHaveBeenCalled()
  })

  it('formats typed time as HH:MM', async () => {
    const onTimeChange = jest.fn()
    const { getByLabelText } = await render(
      <DateTimeField
        dateValue="2026-07-26"
        hasTime
        timeValue=""
        onDateChange={jest.fn()}
        onHasTimeChange={jest.fn()}
        onTimeChange={onTimeChange}
      />,
    )

    fireEvent.changeText(getByLabelText('Horário'), '1430')

    expect(onTimeChange).toHaveBeenCalledWith('14:30')
  })
})
