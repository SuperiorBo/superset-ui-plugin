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
  getNumberFormatter,
  TimeseriesChartDataResponseResult,
} from '@superset-ui/core';
import { EChartsOption, SeriesOption } from 'echarts';
import { DEFAULT_FORM_DATA, EchartsWaterfallFormData } from './types';
import { EchartsProps, ForecastSeriesEnum, ProphetValue } from '../types';
import { parseYAxisBound } from '../utils/controls';
import { dedupSeries, extractTimeseriesSeries, getLegendProps } from '../utils/series';
import {
  extractForecastSeriesContext,
  extractProphetValuesFromTooltipParams,
  formatProphetTooltipSeries,
  rebaseTimeseriesDatum,
} from '../utils/prophet';
import { defaultGrid, defaultTooltip, defaultYAxis } from '../defaults';
import {
  getPadding,
  getTooltipTimeFormatter,
  getXAxisFormatter,
  transformSeries,
} from './transformers';
import { TIMESERIES_CONSTANTS } from '../constants';

export default function transformProps(chartProps: ChartProps): EchartsProps {
  console.log(chartProps);
  const { width, height, formData, queriesData } = chartProps;
  const {
    data = []
  } = queriesData[0] as TimeseriesChartDataResponseResult;

  const {
    colorScheme,
    legendOrientation,
    legendType,
    logAxis,
    markerEnabled,
    markerSize,
    showLegend,
    stack,
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
  const rebasedData = rebaseTimeseriesDatum(data);
  const rawSeries = extractTimeseriesSeries(rebasedData, {
    fillNeighborValue: stack ? 0 : undefined,
    stack
  });
  const series: SeriesOption[] = [];
  const formatter = getNumberFormatter(yAxisFormat);

  rawSeries.forEach(entry => {
    const transformedSeries = transformSeries(entry, colorScale, {
      markerEnabled,
      markerSize,
      stack,
    });
    if (transformedSeries) series.push(transformedSeries);
  });

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
        showMinLabel: xAxisShowMinLabel,
        showMaxLabel: xAxisShowMaxLabel,
        formatter: xAxisFormatter,
        rotate: xAxisLabelRotation,
      },
    },
    yAxis: {
      ...defaultYAxis,
      type: logAxis ? 'log' : 'value',
      min,
      max,
      minorTick: { show: true },
      axisLabel: { formatter },
      scale: truncateYAxis,
      name: yAxisTitle,
    },
    tooltip: {
      // ...defaultTooltip,
      trigger: 'axis',
      formatter: (params: any) => {
        console.log(params);
        const value: number = params.value;
        const prophetValue = [params];

        const rows: Array<string> = [`${tooltipFormatter(value)}`];
        console.log(rows);
        // const prophetValues: Record<string, ProphetValue> = extractProphetValuesFromTooltipParams(
        //   prophetValue,
        // );

        // Object.keys(prophetValues).forEach(key => {
        //   const value = prophetValues[key];
        //   rows.push(
        //     formatProphetTooltipSeries({
        //       ...value,
        //       seriesName: key,
        //       formatter,
        //     }),
        //   );
        // });
        // return rows.join('<br />');
      },
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

  console.log(echartOptions);
  return {
    echartOptions,
    width,
    height,
  };
}
