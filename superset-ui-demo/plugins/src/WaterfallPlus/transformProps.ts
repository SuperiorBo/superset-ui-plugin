/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint-disable camelcase */
import {
  CategoricalColorNamespace,
  ChartProps,
  getMetricLabel,
  getNumberFormatter,
  TimeseriesChartDataResponseResult,
} from '@superset-ui/core';
import { EChartsOption, SeriesOption,BarSeriesOption } from 'echarts';
import { DEFAULT_FORM_DATA, EchartsWaterfallFormData } from './types';
import { EchartsProps, ForecastSeriesEnum, ProphetValue } from '../types';
import { parseYAxisBound } from '../utils/controls';
import { dedupSeries, extractTimeseriesSeries, getLegendProps } from '../utils/series';
import {
  extractForecastSeriesContext,
  formatProphetTooltipSeries,
  rebaseTimeseriesDatum,
} from '../utils/prophet';
import { defaultGrid, defaultTooltip, defaultYAxis } from '../defaults';
import {
  getPadding,
  getTooltipTimeFormatter,
  getXAxisFormatter,
  transformSeries,
  dimensionTimeseriesSeries, 
} from './transformers';
import { TIMESERIES_CONSTANTS } from '../constants';

// function formatBarLabel({
//   params,
//   labelType,
//   numberFormatter,
// }: {
//   params: CallbackDataParams;
//   labelType: EchartsBarLabelType;
//   numberFormatter: NumberFormatter;
// }): string {

// }

export default function transformProps(chartProps: ChartProps): EchartsProps {
  console.log('chartProps',chartProps);
  const { width, height, formData, queriesData } = chartProps;
  const {
    data = []
  } = queriesData[0] as TimeseriesChartDataResponseResult;

  const {
    colorScheme,
    legendOrientation,
    legendType,
    logAxis,
    labelEnabled,
    highPointer,
    showLegend,
    stack,
    total,
    truncateYAxis,
    yAxisFormat,
    xAxisShowMinLabel,
    xAxisShowMaxLabel,
    xAxisTimeFormat,
    yAxisBounds,
    yAxisTitle,
    tooltipTimeFormat,
    xAxisLabelRotation,
  }: EchartsWaterfallFormData = { ...DEFAULT_FORM_DATA, ...formData };

  const colorScale = CategoricalColorNamespace.getScale(colorScheme as string);
  let rebasedData = rebaseTimeseriesDatum(data);

  const recordData = dimensionTimeseriesSeries(rebasedData,{
      isStack:stack,
      isTotal:total,
      labelEnabled,
      highPointer,
    });

  // const defaultLabel = {
  //   formatter,
  //   show: showLabels,
  //   color: '#000000',
  // };


  // console.log("recordData",recordData);
  const rawSeries = extractTimeseriesSeries(recordData, {
    fillNeighborValue: stack ? 0 : undefined
  });

  // console.log(rawSeries.filter(series=>series.id !== 'cumulative'))
  // const metricLabel = getMetricLabel('');
  // console.log(metricLabel);
  const series: SeriesOption[] = [];
  const formatter = getNumberFormatter(yAxisFormat);

  rawSeries.forEach(entry => {
    // const barSeries : BarSeriesOption = entry.data;
    const transformedSeries = transformSeries(entry as BarSeriesOption, colorScale, {
      isStack:stack,
      isTotal:total,
      labelEnabled,
      highPointer,
    });
    // console.log('transformedSeries',transformedSeries);

    // console.log(transformedSeries);
    if (transformedSeries) series.push(transformedSeries);
  });
  
  

  // console.log('series',series);

  // yAxisBounds need to be parsed to replace incompatible values with undefined
  let [min, max] = (yAxisBounds || []).map(parseYAxisBound);

  const tooltipFormatter = getTooltipTimeFormatter(tooltipTimeFormat);
  const xAxisFormatter = getXAxisFormatter(xAxisTimeFormat);

  const addYAxisLabelOffset = !!yAxisTitle;
  const padding = getPadding(showLegend, legendOrientation, addYAxisLabelOffset, false);
  const echartOptions: EChartsOption = {
    useUTC: true,
    grid: {
      ...defaultGrid,
      ...padding,
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        show: true,
        formatter: xAxisFormatter,
      },
    },
    yAxis: {
      type:"value"
    },
    tooltip: {
      ...defaultTooltip,
      trigger: 'axis',
      formatter: (params: any) =>
      {
        // console.log(params);
        const value= params[0].value[0]; 
        const row : Array<string> = [`${tooltipFormatter(value)}`];
        params.forEach(param=>{
          const {value,marker,seriesName,seriesIndex} = param;
          if(seriesIndex > 2)
          {
            row.push(`${marker}${seriesName === 'worth' ? '合计':seriesName} : `+value[1] * value[2]); 
          }
        });
        
        return row.join('<br />');

        // const waterfallValues : Record<string, ProphetValue> = extractWaterfallValuesFromTooltipParams(waterfallValue)

        // console.log(value);
        // return value+'<br />';
      }
    },
    legend: {
      ...getLegendProps(legendType, legendOrientation, showLegend, false),
      // @ts-ignore
      data: rawSeries
        .filter(
          entry =>
            extractForecastSeriesContext((entry.name || '') as string).type ===
            ForecastSeriesEnum.Observation,
        )
        .map(entry => entry.name || ''),
    },
    series: dedupSeries(series)
  };

  console.log('echartOptions',echartOptions);
  return {
    echartOptions,
    width,
    height,
  };
}
