import { useEffect, useCallback } from 'react'
import { ScrollView, View, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Controller, useWatch } from 'react-hook-form'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { FormField } from '@/components/ui/form-field'
import { useActivityForm } from '@/screens/activities/hook/use-activity-form'
import { useActivityDetails } from '@/screens/activities/hook/use-activity-details'
import { CategorySelector } from '@/screens/activities/components/category-selector'
import { PrioritySelector } from '@/screens/activities/components/priority-selector'
import { DateTimeField } from '@/screens/activities/components/date-time-field'
import { ActivityStepsEditor } from '@/screens/activities/components/activity-steps-editor'
import { ReminderSelector } from '@/screens/activities/components/reminder-selector'
import { PastDateDialog } from '@/screens/activities/components/past-date-dialog'

export default function EditarAtividadeModal() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { spacing } = useTheme()

  const { activity, isLoading: loadingActivity } = useActivityDetails(id)

  const form = useActivityForm(activity ?? undefined)
  const {
    control,
    errors,
    isSaving,
    saveError,
    handleSubmit,
    save,
    setValue,
    watchedHasTime,
    showPastDateDialog,
    confirmPastDateAndSave,
    dismissPastDateDialog,
    reset,
  } = form

  const watchedFormData = useWatch({ control })

  useEffect(() => {
    if (activity) {
      const dateStr = (() => {
        const d = activity.scheduledAt
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
      })()

      const timeStr = activity.hasTime
        ? `${String(activity.scheduledAt.getHours()).padStart(2, '0')}:${String(activity.scheduledAt.getMinutes()).padStart(2, '0')}`
        : ''

      reset({
        title: activity.title,
        description: activity.description ?? '',
        category: activity.category,
        date: dateStr,
        hasTime: activity.hasTime,
        time: timeStr,
        priority: activity.priority,
        steps: activity.steps.map((s) => ({ _key: s.id, title: s.title })),
        reminderOption: activity.reminder.enabled ? 'atTime' : 'none',
        reminderDate: '',
        reminderTime: '',
        confirmPastDate: false,
      })
    }
  }, [activity, reset])

  const onSubmit = useCallback(
    async (data: any) => {
      const result = await save(data)
      if (result) {
        router.back()
      }
    },
    [save, router],
  )

  if (loadingActivity) {
    return (
      <ThemeView style={[styles.centered, { padding: spacing.xl }]}>
        <ThemeText variant="body">Carregando…</ThemeText>
      </ThemeView>
    )
  }

  if (!activity) {
    return (
      <ThemeView style={[styles.centered, { padding: spacing.xl, gap: spacing.lg }]}>
        <ThemeText variant="title">Atividade não encontrada.</ThemeText>
        <AppButton title="Voltar" onPress={() => router.back()} variant="primary" />
      </ThemeView>
    )
  }

  return (
    <ThemeView style={{ flex: 1 }}>
      <View style={[styles.header, { padding: spacing.xl, gap: spacing.md }]}>
        <ThemeText variant="display">Editar atividade</ThemeText>
        <AppButton title="Cancelar" onPress={() => router.back()} variant="ghost" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxxl + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.lg }}>
          <ThemeText variant="subtitle">Informações principais</ThemeText>

          <FormField
            control={control}
            name="title"
            label="Título"
            required
            placeholder="Ex.: Consulta médica"
          />

          <FormField
            control={control}
            name="description"
            label="Descrição"
            placeholder="Adicione detalhes importantes"
            multiline
            numberOfLines={3}
          />

          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <CategorySelector value={value} onChange={onChange} error={error?.message} />
            )}
          />

          <Controller
            control={control}
            name="priority"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <PrioritySelector value={value} onChange={onChange} error={error?.message} />
            )}
          />
        </View>

        <View style={{ gap: spacing.lg }}>
          <ThemeText variant="subtitle">Data e horário</ThemeText>

          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <DateTimeField
                dateValue={value}
                hasTime={watchedHasTime ?? false}
                timeValue={(watchedFormData as any)?.time || ''}
                onDateChange={onChange}
                onHasTimeChange={(v) => setValue('hasTime', v)}
                onTimeChange={(v) => setValue('time', v)}
                dateError={error?.message}
              />
            )}
          />
        </View>

        <ActivityStepsEditor
          steps={(watchedFormData as any)?.steps || []}
          onChange={(steps) => setValue('steps', steps as any)}
        />

        <Controller
          control={control}
          name="reminderOption"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <ReminderSelector
              value={value}
              onChange={onChange}
              hasTime={watchedHasTime ?? false}
              error={error?.message}
            />
          )}
        />

      {saveError && (
        <ThemeText variant="error" accessibilityRole="alert">
          {saveError}
        </ThemeText>
      )}

      <AppButton
          title="Salvar alterações"
          onPress={handleSubmit(onSubmit)}
          loading={isSaving}
          disabled={isSaving}
          variant="primary"
        />
      </ScrollView>

      <PastDateDialog
        visible={showPastDateDialog}
        onConfirm={handleSubmit((data) => confirmPastDateAndSave(data))}
        onCancel={dismissPastDateDialog}
      />
    </ThemeView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
