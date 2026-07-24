export interface UserProfile {
  id: string
  name: string
  email: string
  firstAccessCompleted: boolean
  onboardingStep: number
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  fontSize: 'normal' | 'large' | 'extraLarge'
  contrast: 'default' | 'high' | 'dark'
  spacing: 'normal' | 'expanded'
  interfaceMode: 'basic' | 'complete'
  enhancedFeedback: boolean
  confirmCriticalActions: boolean
  reduceMotion: boolean
  remindersEnabled: boolean
  updatedAt: string
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  fontSize: 'normal',
  contrast: 'default',
  spacing: 'normal',
  interfaceMode: 'complete',
  enhancedFeedback: true,
  confirmCriticalActions: true,
  reduceMotion: false,
  remindersEnabled: true,
  updatedAt: '',
}
