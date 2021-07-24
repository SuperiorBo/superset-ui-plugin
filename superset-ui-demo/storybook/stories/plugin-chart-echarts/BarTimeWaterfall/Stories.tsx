import React from 'react';
import { SuperChart, getChartTransformPropsRegistry } from '@superset-ui/core';
import { boolean, number, select, withKnobs } from '@storybook/addon-knobs';
import { EchartsBarChartPlugin } from '../../../../plugins';
import transformProps from '../../../../plugins/BarTimeWaterfall/transformProps';
import data from './data';
import { withResizableChartDemo } from '../../../shared/components/ResizableChartDemo';

new EchartsBarChartPlugin().configure({ key: 'echarts-bar-time-waterfall' }).register();

getChartTransformPropsRegistry().registerValue('echarts-bar-time-waterfall', transformProps);

export default {
  title: 'Chart Plugins|plugin-chart-echarts/BarTimeWaterfall',
  decorators: [withKnobs, withResizableChartDemo],
};

export const BarTimeWaterfall = ({ width, height }) => {
  return (
    <SuperChart
      chartType="echarts-bar-time-waterfall"
      width={width}
      height={height}
      queriesData={[{ data: data }]}
      formData={{
        colorScheme: 'supersetColors',
        groupby: ['__timestamp'],
        metric: 'SUM(AIR_TIME)',
        numberFormat: 'SMART_NUMBER',
        donut: boolean('Donut', false),
        labelsOutside: boolean('Labels outside', true),
        labelLine: boolean('Label line', true),
        showLabels: boolean('Show labels', true),
        showLegend: boolean('Show legend', false),
        labelType: select(
          'Bar label type',
          ['key', 'value', 'percent', 'key_value', 'key_percent', 'key_value_percent'],
          'key',
        ),
        separator:'__'
      }}
    />
  );
};

