import React from 'react';
import { SuperChart, getChartTransformPropsRegistry } from '@superset-ui/core';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import { EchartsWaterfallChartPlugin } from '@superset-ui/plugin-chart-echarts';
import transformProps from '@superset-ui/plugin-chart-echarts/src/Waterfall/transformProps';
import data from './data';
import { withResizableChartDemo } from '../../../shared/components/ResizableChartDemo';


new EchartsWaterfallChartPlugin().configure({ key: 'echarts-waterfall' }).register();

getChartTransformPropsRegistry().registerValue('echarts-waterfall', transformProps);

export default {
    title: 'Chart Plugins|plugin-chart-echarts/Waterfall',
    decorators: [withKnobs, withResizableChartDemo],
  };
  
export const WaterfallPlus = ({ width, height }) => {
    return (
        <SuperChart
        chartType="echarts-waterfall"
        width={width}
        height={height}
        queriesData={[{ data }]}
        formData={{
            contributionMode: undefined,
            colorScheme: 'supersetColors',
            metric: 'SUM(AIR_TIME)',
            logAxis: boolean('Log axis', false),
            yAxisFormat: 'SMART_NUMBER',
            stack: boolean('Stack', true),
            total:boolean('Total',true),
            highPointer:boolean('High Pointer',true),
            labelEnabled: boolean('Enable label', true),
        }}
        />
    );
};
