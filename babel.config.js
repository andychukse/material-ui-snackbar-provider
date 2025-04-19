module.exports = {
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-env'
  ],
  plugins: [
    // Use the correct 'transform' name:
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-object-assign',
    '@babel/plugin-transform-object-rest-spread'
  ]
}
