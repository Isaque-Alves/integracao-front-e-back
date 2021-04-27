var plugins = [
  [
    'module-resolver',
    {
      alias: {
        '@': './src',
      },
    },
  ],
  ['inline-json-import', {}],
  [
    '@babel/plugin-transform-runtime',
    {
      regenerator: true,
    },
  ],
];

if (process.env.NODE_ENV == 'production') {
  plugins.push('transform-remove-console');
}

module.exports = {
  presets: ['@babel/preset-env'],
  plugins,
};
