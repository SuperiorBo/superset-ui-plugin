### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import {
  EchartsTimeseriesChartPlugin,
  EchartsPieChartPlugin,
} from '@superset-ui/plugin-chart-echarts';

new EchartsTimeseriesChartPlugin().configure({ key: 'echarts-ts' }).register();
new EchartsPieChartPlugin().configure({ key: 'echarts-pie' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://apache-superset.github.io/superset-ui/?selectedKind=chart-plugins-plugin-chart-echarts)
for more details.

```js
<SuperChart
  chartType="echarts-ts"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```