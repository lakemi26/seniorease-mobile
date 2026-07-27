import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { UserProfile } from '@/modules/authentication/domain/entities'

const KEY_PREFIX = 'seniorease.profile.'

async function canUseSecureStore(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  try {
    return await SecureStore.isAvailableAsync()
  } catch {
    return false
  }
}

function keyFor(uid: string): string {
  return `${KEY_PREFIX}${uid}`
}

export async function readSecureUserProfile(uid: string): Promise<UserProfile | null> {
  if (!(await canUseSecureStore())) return null
  try {
    const raw = await SecureStore.getItemAsync(keyFor(uid))
    return raw ? JSON.parse(raw) as UserProfile : null
  } catch {
    return null
  }
}

export async function writeSecureUserProfile(uid: string, profile: UserProfile | null): Promise<void> {
  if (!profile) {
    await deleteSecureUserProfile(uid)
    return
  }
  if (!(await canUseSecureStore())) return
  try {
    await SecureStore.setItemAsync(keyFor(uid), JSON.stringify(profile), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    })
  } catch {
    // Cache writes must never block auth or profile loading.
  }
}

export async function deleteSecureUserProfile(uid: string): Promise<void> {
  if (!(await canUseSecureStore())) return
  try {
    await SecureStore.deleteItemAsync(keyFor(uid))
  } catch {
    // Ignore cache cleanup failures.
  }
}
