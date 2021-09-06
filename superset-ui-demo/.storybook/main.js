const path = require('path')

module.exports = {
  "stories": [
    "../storybook/stories/**/[S|s]tories.mdx",
    "../storybook/stories/**/[S|s]tories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    '@storybook/addon-knobs',
    '@storybook/addon-essentials'
  ],
  // webpackFinal: config => {
  //   config.module.rules.push({
  //     test: /\.tsx?$/,
  //     use: [
  //       {
  //         loader: require.resolve('ts-loader'),
  //         options: {
  //           transpileOnly: true,
  //         },
  //       }
  //     ],
  //     include: path.resolve(__dirname,'../node_modules')
  //   });
  //   return config;
  // }
}