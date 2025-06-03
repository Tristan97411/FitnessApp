module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'], // pour définir __DEV__ et mocks initiaux
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'], // 👈 ici maintenant
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
  'node_modules/(?!(react-native' +
    '|@react-native' +
    '|expo' +
    '|@expo' +
    '|expo-router' +
    '|expo-asset' +
    '|expo-modules-core' +
    '|@expo/metro-runtime' +
    '|@react-navigation' +
    '|react-native-url-polyfill' + // 👈 ajoute cette ligne
    '|@react-native-community/datetimepicker' +
    ')/)',
],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/fileMock.js',
  },
};
