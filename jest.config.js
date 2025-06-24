module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native' +
      '|@react-native' +
      '|expo' +
      '|expo-font' +
      '|expo-linking' +
      '|expo-router' +
      '|expo-asset' +
      '|expo-modules-core' +
      '|@expo' +
      '|@expo/metro-runtime' +
      '|@react-navigation' +
      '|react-native-url-polyfill' +
      '|@react-native-community' +
      '|react-native-modal-datetime-picker' +  // <-- ajouté ici
      ')/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(ttf|otf|woff|woff2|eot)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
