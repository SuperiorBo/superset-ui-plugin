module.exports = {
  "stories": [
    "../storybook/stories/**/[S|s]tories.mdx",
    "../storybook/stories/**/[S|s]tories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    '@storybook/addon-knobs',
    'storybook-addon-jsx',
    '@storybook/addon-actions',
    '@storybook/addon-links'
  ],
  webpackFinal: config => {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: require.resolve('ts-loader'),
          options: {
            transpileOnly: true,
          },
        },
      ],
    });
    return config;
  }
}