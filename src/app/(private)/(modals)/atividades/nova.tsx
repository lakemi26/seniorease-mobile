import { useCallback } from 'react'
import { ScrollView, View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Controller, useWatch } from 'react-hook-form'
import { useTheme } from '@/contexts/theme-context'
import { ThemeView } from '@/components/theme/theme-view'
import { ThemeText } from '@/components/theme/theme-text'
import { AppButton } from '@/components/ui/app-button'
import { FormField } from '@/components/ui/form-field'
import { useActivityForm } from '@/screens/activities/hook/use-activity-form'
import { CategorySelector } from '@/screens/activities/components/category-selector'
import { PrioritySelector } from '@/screens/activities/components/priority-selector'
import { DateTimeField } from '@/screens/activities/components/date-time-field'
import { ActivityStepsEditor } from '@/screens/activities/components/activity-steps-editor'
import { ReminderSelector } from '@/screens/activities/components/reminder-selector'
import { PastDateDialog } from '@/screens/activities/components/past-date-dialog'

export default function NovaAtividadeModal() {
  const router = useRouter()
  const { spacing } = useTheme()

  const form = useActivityForm()
  const { control, errors, isSaving, saveError, handleSubmit, save, setValue, watchedHasTime, showPastDateDialog, confirmPastDateAndSave, dismissPastDateDialog } = form

  const watchedFormData = useWatch({ control })

  const onSubmit = useCallback(
    async (data: any) => {
      const result = await save(data)
      if (result) {
        router.replace(`/atividades/${result.id}` as any)
      }
    },
    [save, router],
  )

  return (
    <ThemeView style={{ flex: 1 }}>
      <View style={[styles.header, { padding: spacing.xl, gap: spacing.md }]}>
        <ThemeText variant="display">Nova atividade</ThemeText>
        <AppButton title="Cancelar" onPress={() => router.replace('/atividades')} variant="ghost" />
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
                timeError={errors.time?.message}
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
          title="Criar atividade"
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
})
