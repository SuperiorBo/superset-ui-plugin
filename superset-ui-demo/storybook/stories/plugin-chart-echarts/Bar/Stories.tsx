import React from 'react';
import { SuperChart, getChartTransformPropsRegistry } from '@superset-ui/core';
import { boolean, number, select, withKnobs } from '@storybook/addon-knobs';
import { EchartsBarChartPlugin1 } from '../../../../../plugin-chart-echarts/src';
import transformProps from '../../../../../plugin-chart-echarts/src/Bar/transformProps';
import { weekday } from './data';
import { withResizableChartDemo } from '../../../shared/components/ResizableChartDemo';

new EchartsBarChartPlugin1().configure({ key: 'echarts-bar' }).register();

getChartTransformPropsRegistry().registerValue('echarts-bar', transformProps);

export default {
  title: 'Chart Plugins|plugin-chart-echarts/Bar',
  decorators: [withKnobs, withResizableChartDemo],
};

export const WeekdayBar = ({ width, height }) => {
  return (
    <SuperChart
      chartType="echarts-bar"
      width={width}
      height={height}
      queriesData={[{ data: weekday }]}
      formData={{
        colorScheme: 'supersetColors',
        groupby: ['Day'],
        metric: 'SUM(AIR_TIME)',
        numberFormat: 'SMART_NUMBER',
        donut: boolean('Donut', false),
        // innerRadius: number('Inner Radius', 30),
        // outerRadius: number('Outer Radius', 70),
        labelsOutside: boolean('Labels outside', true),
        labelLine: boolean('Label line', true),
        showLabels: boolean('Show labels', true),
        showLegend: boolean('Show legend', false),
        labelType: select(
          'Bar label type',
          ['key', 'value', 'percent', 'key_value', 'key_percent', 'key_value_percent'],
          'key',
        ),
        serieName:"生活费"
      }}
    />
  );
};

// export const PopulationBar = ({ width, height }) => {
//   return (
//     <SuperChart
//       chartType="echarts-bar"
//       width={width}
//       height={height}
//       queriesData={[{ data: population }]}
//       formData={{
//         colorScheme: 'supersetColors',
//         groupby: ['Country'],
//         metric: 'Population',
//         numberFormat: 'SMART_NUMBER',
//         donut: boolean('Donut', false),
//         innerRadius: number('Inner Radius', 30),
//         outerRadius: number('Outer Radius', 70),
//         labelsOutside: boolean('Labels outside', false),
//         labelLine: boolean('Label line', true),
//         showLabels: boolean('Show labels', true),
//         showLegend: boolean('Show legend', false),
//         labelType: select(
//           'Bar label type',
//           ['key', 'value', 'percent', 'key_value', 'key_percent', 'key_value_percent'],
//           'key',
//         ),
//       }}
//     />
//   );
// };
