const path = require('path')
const { lstatSync, readdirSync } = require('fs');
const basePath = path.resolve(__dirname, '../node_modules/@superset-ui');
const packages = readdirSync(basePath).filter(name => {
  const stat = lstatSync(path.join(basePath, name));
  return stat.isSymbolicLink();
});


module.exports = {
  "stories": [
    "../storybook/stories/**/[S|s]tories.mdx",
    "../storybook/stories/**/[S|s]tories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    '@storybook/addon-knobs',
    '@storybook/addon-essentials'
  ],
  webpackFinal: config => {

    config.module.rules.push({
      include: [ /plugin-chart-echarts\\src/ ] ,
      exclude: /node_modules/,
      test: /\.jsx?$/,
      use: config.module.rules[0].use,
    });

    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: require.resolve('ts-loader'),
          options: {
            transpileOnly: true,
          },
        }
      ],
      // include: path.resolve(__dirname,'../node_modules')
    });

    // Let webpack know where to find the source code
    // Object.assign(config.resolve.alias, {
    //   ...packages.reduce(
    //     (acc, name) => ({
    //       ...acc,
    //       [`@superset-ui/${name}$`]: path.join(basePath, name, 'src'),
    //     }),
    //     {},
    //   ),
    // });

    return config;
  }
}