import { useCallback } from 'react'
import { View, Pressable, TextInput, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/theme-context'
import { ThemeText } from '@/components/theme/theme-text'
import { radius } from '@/shared/theme/radius'
import { touchSize } from '@/shared/theme/spacing'

function generateKey(): string {
  return `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

interface StepItem {
  _key: string
  title: string
}

interface ActivityStepsEditorProps {
  steps: StepItem[]
  onChange: (steps: StepItem[]) => void
  error?: string
}

export function ActivityStepsEditor({ steps, onChange, error }: ActivityStepsEditorProps) {
  const { colors, spacing } = useTheme()

  const addStep = useCallback(() => {
    if (steps.length >= 20) return
    onChange([...steps, { _key: generateKey(), title: '' }])
  }, [steps, onChange])

  const removeStep = useCallback(
    (key: string) => {
      onChange(steps.filter((s) => s._key !== key))
    },
    [steps, onChange],
  )

  const updateTitle = useCallback(
    (key: string, title: string) => {
      onChange(steps.map((s) => (s._key === key ? { ...s, title } : s)))
    },
    [steps, onChange],
  )

  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return
      const next = [...steps]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      onChange(next)
    },
    [steps, onChange],
  )

  const moveDown = useCallback(
    (index: number) => {
      if (index === steps.length - 1) return
      const next = [...steps]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      onChange(next)
    },
    [steps, onChange],
  )

  return (
    <View style={{ gap: spacing.md }}>
      <View style={[styles.header, { gap: spacing.sm }]}>
        <ThemeText variant="label">Etapas</ThemeText>
        {steps.length > 0 && (
          <ThemeText variant="caption" color={colors.textMuted}>
            {steps.length}/20
          </ThemeText>
        )}
      </View>

      {steps.map((step, index) => (
        <View
          key={step._key}
          style={[
            styles.row,
            {
              gap: spacing.sm,
              paddingVertical: spacing.sm,
            },
          ]}
        >
          <View
            style={[
              styles.indexBadge,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: radius.full,
                width: 28,
                height: 28,
              },
            ]}
          >
            <ThemeText variant="caption" color={colors.primary}>
              {index + 1}
            </ThemeText>
          </View>

          <TextInput
            value={step.title}
            onChangeText={(text) => updateTitle(step._key, text)}
            placeholder="Descrição da etapa"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={`Etapa ${index + 1}`}
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: spacing.md,
                minHeight: 40,
              },
            ]}
          />

          <Pressable
            onPress={() => moveUp(index)}
            disabled={index === 0}
            accessibilityRole="button"
            accessibilityLabel={`Mover etapa ${index + 1} para cima`}
            style={[styles.btn, { opacity: index === 0 ? 0.3 : 1 }]}
          >
            <ThemeText variant="caption" color={colors.primary}>▲</ThemeText>
          </Pressable>

          <Pressable
            onPress={() => moveDown(index)}
            disabled={index === steps.length - 1}
            accessibilityRole="button"
            accessibilityLabel={`Mover etapa ${index + 1} para baixo`}
            style={[styles.btn, { opacity: index === steps.length - 1 ? 0.3 : 1 }]}
          >
            <ThemeText variant="caption" color={colors.primary}>▼</ThemeText>
          </Pressable>

          <Pressable
            onPress={() => removeStep(step._key)}
            accessibilityRole="button"
            accessibilityLabel={`Remover etapa ${index + 1}`}
            style={styles.btn}
          >
            <ThemeText variant="caption" color={colors.danger}>✕</ThemeText>
          </Pressable>
        </View>
      ))}

      {steps.length < 20 && (
        <Pressable
          onPress={addStep}
          accessibilityRole="button"
          accessibilityLabel="Adicionar etapa"
          style={[
            styles.addBtn,
            {
              borderColor: colors.primary,
              borderRadius: radius.md,
              paddingVertical: spacing.md,
              minHeight: touchSize.min,
            },
          ]}
        >
          <ThemeText variant="label" color={colors.primary}>
            + Adicionar etapa
          </ThemeText>
        </Pressable>
      )}

      {error && (
        <ThemeText variant="caption" color={colors.danger} accessibilityRole="alert">
          {error}
        </ThemeText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indexBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 0,
    fontSize: 15,
  },
  btn: {
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
