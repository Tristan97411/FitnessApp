console.log('jest.setup.js loaded');

global.__DEV__ = true;

// Mock global Expo object
global.Expo = {
  Constants: {
    platform: {},
  },
};
globalThis.Expo = global.Expo;

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: 'SafeAreaProvider',
  useSafeAreaInsets: jest.fn(() => ({ top: 0, left: 0, right: 0, bottom: 0 })),
}));

// Mock expo-router (empty mock)
jest.mock('expo-router/entry', () => ({}));

// Mock expo-modules-core
jest.mock('expo-modules-core', () => ({
  EventEmitter: jest.fn(),
  requireNativeModule: jest.fn(() => ({})),
  requireOptionalNativeModule: jest.fn(() => ({})),
  NativeModulesProxy: {},
}));

// Mock expo-asset
jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(),
  },
}));

// IMPORTANT : Ne pas mocker toute la lib react-native, juste Platform de façon simple
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios),
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => null,
    Ionicons: () => null,
    MaterialIcons: () => null,
  };
});

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    setParams: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        supabaseUrl: 'EXPO_PUBLIC_SUPABASE_URL',
        supabaseAnonKey: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      },
    },
  },
}));

jest.mock('react-native-modal-datetime-picker', () => {
  return ({ isVisible, onConfirm, onCancel }) => {
    if (!isVisible) return null;
    return (
      <button
        onClick={() => onConfirm(new Date())}
      >
        Mock DateTimePickerModal
      </button>
    );
  };
});

global.alert = jest.fn();
