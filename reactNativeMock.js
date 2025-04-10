// Mock pour `react-native`
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
    ...jest.requireActual('react-native/Libraries/Utilities/Platform'),
    __DEV__: true,  // Définir __DEV__ comme true dans les tests
  }));
  