module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // NativeWind v4
      'nativewind/babel',
      // Path aliases — mirrors tsconfig.json paths
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@store': './src/store',
            '@utils': './src/utils',
            '@api': './src/api',
            '@assets': './assets',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      // React Native Reanimated must be last
      'react-native-reanimated/plugin',
    ],
  }
}
