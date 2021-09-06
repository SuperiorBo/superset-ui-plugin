import React from 'react';
import { SuperChart, getChartTransformPropsRegistry } from '@superset-ui/core';
import { boolean, number, select, withKnobs } from '@storybook/addon-knobs';
import { EchartsWaterfallChartPlugin } from '../../../../plugins/src';
import transformProps from '../../../../plugins/src/Waterfall/transformProps';
import data from './data';
import { withResizableChartDemo } from '../../../shared/components/ResizableChartDemo';


new EchartsWaterfallChartPlugin().configure({ key: 'echarts-waterfall' }).register();

getChartTransformPropsRegistry().registerValue('echarts-waterfall', transformProps);

export default {
    title: 'Chart Plugins|plugin-chart-echarts/Waterfall',
    decorators: [withKnobs, withResizableChartDemo],
  };
  
export const Waterfall = ({ width, height }) => {
    const forecastEnabled = boolean('Enable forecast', true);

    return (
        <SuperChart
        chartType="echarts-waterfall"
        width={width}
        height={height}
        queriesData={[{ data }]}
        formData={{
            contributionMode: undefined,
            forecastEnabled,
            colorScheme: 'supersetColors',
            seriesType: select(
            'Line type',
            ['line', 'scatter', 'smooth', 'bar', 'start', 'middle', 'end'],
            'line',
            ),
            logAxis: boolean('Log axis', false),
            yAxisFormat: 'SMART_NUMBER',
            stack: boolean('Stack', false),
            area: boolean('Area chart', false),
            markerEnabled: boolean('Enable markers', false),
            markerSize: number('Marker Size', 6),
            minorSplitLine: boolean('Minor splitline', false),
            opacity: number('Opacity', 0.2),
            zoomable: boolean('Zoomable', false),
        }}
        />
    );
};
