global.__DEV__ = true;
// jest.setup.js
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: 'SafeAreaView', // Mock simple de SafeAreaView
    SafeAreaProvider: 'SafeAreaProvider', // Mock de SafeAreaProvider
    useSafeAreaInsets: jest.fn().mockReturnValue({ top: 0, left: 0, right: 0, bottom: 0 }),
  }));
  