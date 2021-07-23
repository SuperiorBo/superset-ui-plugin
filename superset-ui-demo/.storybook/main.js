module.exports = {
  "stories": [
    "../storybook/stories/**/[S|s]tories.mdx",
    "../storybook/stories/**/[S|s]tories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    '@storybook/preset-typescript',
    '@storybook/addon-knobs/register',
    'storybook-addon-jsx/register',
    '@storybook/addon-actions/register',
    '@storybook/addon-links/register',
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