module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|react-navigation)/)',
    'node_modules/(?!(react-native|@react-native|expo-router)/)', // ignore certains node_modules
    'node_modules/(?!(expo-router|react-native|@react-native)/)', // n'ignore pas expo-router
    'node_modules/(?!expo-router|react-native|@react-native|react-navigation)/', // transformer aussi expo-router


  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Réécriture de l'alias @/ vers la racine du projet
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/fileMock.js',  // Le mock de fichier est à la racine

  },
};
