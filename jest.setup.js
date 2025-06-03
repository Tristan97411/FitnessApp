global.__DEV__ = true;

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: 'SafeAreaProvider',
  useSafeAreaInsets: jest.fn().mockReturnValue({ top: 0, left: 0, right: 0, bottom: 0 }),
}));

jest.mock('expo-router/entry', () => ({}));
