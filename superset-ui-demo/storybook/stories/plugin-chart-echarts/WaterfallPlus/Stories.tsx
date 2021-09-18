import React from 'react';
import { SuperChart, getChartTransformPropsRegistry } from '@superset-ui/core';
import { boolean, number, select, withKnobs } from '@storybook/addon-knobs';
import { EchartsWaterfallPlusChartPlugin } from '@superset-ui/plugin-chart-echarts';
import transformProps from '@superset-ui/plugin-chart-echarts/WaterfallPlus/transformProps';
import data from './data';
import { withResizableChartDemo } from '../../../shared/components/ResizableChartDemo';


new EchartsWaterfallPlusChartPlugin().configure({ key: 'echarts-waterfallplus' }).register();

getChartTransformPropsRegistry().registerValue('echarts-waterfallplus', transformProps);

export default {
    title: 'Chart Plugins|plugin-chart-echarts/Waterfallplus',
    decorators: [withKnobs, withResizableChartDemo],
  };
  
export const WaterfallPlus = ({ width, height }) => {
    return (
        <SuperChart
        chartType="echarts-waterfallplus"
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
