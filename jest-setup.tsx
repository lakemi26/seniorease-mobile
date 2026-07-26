import type * as React from 'react'
import { jest } from '@jest/globals'

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}))

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  initialWindowMetrics: { insets: { top: 0, right: 0, bottom: 0, left: 0 }, frame: { x: 0, y: 0, width: 0, height: 0 } },
}))

jest.mock('expo-router', () => ({
  Stack: Object.assign(
    ({ children }: { children: React.ReactNode }) => children,
    {
      Screen: ({ children }: { children?: React.ReactNode }) => children ?? null,
      Protected: ({ children }: { children?: React.ReactNode }) => children ?? null,
      Header: ({ children }: { children?: React.ReactNode }) => children ?? null,
      SearchBar: ({ children }: { children?: React.ReactNode }) => children ?? null,
      Title: ({ children }: { children?: React.ReactNode }) => children ?? null,
      Toolbar: Object.assign(
        ({ children }: { children?: React.ReactNode }) => children ?? null,
        { Button: ({ children }: { children?: React.ReactNode }) => children ?? null, Icon: ({ children }: { children?: React.ReactNode }) => children ?? null },
      ),
    },
  ),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  }),
  useSegments: () => [],
  Redirect: (_props: { href: string }) => null,
  Link: ({ children }: { children: React.ReactNode }) => children,
  Tabs: Object.assign(
    ({ children }: { children: React.ReactNode }) => children,
    { Screen: ({ children }: { children?: React.ReactNode }) => children ?? null },
  ),
  useLocalSearchParams: () => ({}),
  useNavigation: () => ({}),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}))

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  Swipeable: ({ children }: { children: React.ReactNode }) => children,
  DrawerLayout: ({ children }: { children: React.ReactNode }) => children,
  State: {},
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  TapGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  LongPressGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  PinchGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  RotationGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  FlingGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  NativeViewGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  ScrollView: ({ children }: { children: React.ReactNode }) => children,
  FlatList: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('react-native-reanimated', () => ({
  useSharedValue: () => ({ value: 0 }),
  useAnimatedStyle: () => ({}),
  withTiming: () => 0,
  withSpring: () => 0,
  default: {},
  View: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  createAnimatedComponent: (Component: React.ComponentType) => Component,
}))
