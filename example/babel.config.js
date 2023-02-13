const path = require('path');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['../'],
        alias: {
          react: path.resolve(__dirname, './node_modules/react'),
          'react-native': path.resolve(
            __dirname,
            './node_modules/react-native'
          ),
          'react-query': path.resolve(
            __dirname,
            './node_modules/react-query'
          ),
          src: '../src',
          lib: '../lib',
        }
      }
    ]
  ]
};