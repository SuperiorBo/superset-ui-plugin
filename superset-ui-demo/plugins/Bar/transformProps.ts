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
import {
  CategoricalColorNamespace,
  DataRecordValue,
  getMetricLabel,
  getNumberFormatter,
  getTimeFormatter,
  NumberFormats,
  NumberFormatter,
} from '@superset-ui/core';
import { CallbackDataParams } from 'echarts/types/src/util/types';
import { EChartsOption, BarSeriesOption } from 'echarts';
import {
  DEFAULT_FORM_DATA as DEFAULT_Bar_FORM_DATA,
  EchartsBarChartProps,
  EchartsBarFormData,
  EchartsBarLabelType,
  BarChartTransformedProps,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA } from '../types';
import {
  extractGroupbyLabel,
  getChartPadding,
  getColtypesMapping,
  getLegendProps,
} from '../utils/series';
import { defaultGrid, defaultTooltip } from '../defaults';

const percentFormatter = getNumberFormatter(NumberFormats.PERCENT_2_POINT);

export function formatBarLabel({
  params,
  labelType,
  numberFormatter,
}: {
  params: CallbackDataParams;
  labelType: EchartsBarLabelType;
  numberFormatter: NumberFormatter;
}): string {
  const { name = '', value, percent } = params;
  const formattedValue = numberFormatter(value as number);
  const formattedPercent = percentFormatter((percent as number) / 100);

  switch (labelType) {
    case EchartsBarLabelType.Key:
      return name;
    case EchartsBarLabelType.Value:
      return formattedValue;
    case EchartsBarLabelType.Percent:
      return formattedPercent;
    case EchartsBarLabelType.KeyValue:
      return `${name}: ${formattedValue}`;
    case EchartsBarLabelType.KeyValuePercent:
      return `${name}: ${formattedValue} (${formattedPercent})`;
    case EchartsBarLabelType.KeyPercent:
      return `${name}: ${formattedPercent}`;
    default:
      return name;
  }
}

export default function transformProps(chartProps: EchartsBarChartProps): BarChartTransformedProps {
  const { formData, height, hooks, filterState, queriesData, width } = chartProps;
  const { data = [] } = queriesData[0];
  const coltypeMapping = getColtypesMapping(queriesData[0]);

  const {
    colorScheme,
    donut,
    groupby,
    innerRadius,
    labelsOutside,
    labelLine,
    labelType,
    legendMargin,
    legendOrientation,
    legendType,
    metric = '',
    numberFormat,
    dateFormat,
    outerRadius,
    showLabels,
    showLegend,
    showLabelsThreshold,
    emitFilter,
    serieName
  }: EchartsBarFormData = { ...DEFAULT_LEGEND_FORM_DATA, ...DEFAULT_Bar_FORM_DATA, ...formData };
  const metricLabel = getMetricLabel(metric);
  const minShowLabelAngle = (showLabelsThreshold || 0) * 3.6;
  const keys = data.map(datum =>
    extractGroupbyLabel({
      datum,
      groupby,
      coltypeMapping,
      timeFormatter: getTimeFormatter(dateFormat),
    }),
  );
  const labelMap = data.reduce((acc: Record<string, DataRecordValue[]>, datum) => {
    const label = extractGroupbyLabel({
      datum,
      groupby,
      coltypeMapping,
      timeFormatter: getTimeFormatter(dateFormat),
    });
    console.log("label", label);
    return {
      ...acc,
      [label]: groupby.map(col => datum[col]),
    };
  }, {});

  const { setDataMask = () => { } } = hooks;

  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);
  const numberFormatter = getNumberFormatter(numberFormat);

  const transformedData: BarSeriesOption[] = data.map(datum => {
    const name = extractGroupbyLabel({
      datum,
      groupby,
      coltypeMapping,
      timeFormatter: getTimeFormatter(dateFormat),
    });

    return {
      value: datum[metricLabel],
      name,
      itemStyle: {
        color: colorFn(name),
      },
    };
  });

  const selectedValues = (filterState.selectedValues || []).reduce(
    (acc: Record<string, number>, selectedValue: string) => {
      const index = transformedData.findIndex(({ name }) => name === selectedValue);
      return {
        ...acc,
        [index]: selectedValue,
      };
    },
    {},
  );

  const formatter = (params: CallbackDataParams) =>
    formatBarLabel({
      params,
      numberFormatter,
      labelType,
    });

  const defaultLabel = {
    formatter,
    show: showLabels,
    color: '#000000',
  };
  const seriesData = data.map(x => {
    return Number(x[metricLabel])
  });
  let total = seriesData[0];
  const seriesHelpData = seriesData.map((item, index, arr) => {
    if (index == 0) return 0
    total = total - item;
    return total
  });
  const series: BarSeriesOption[] = [
    {
      name: '辅助',
      type: 'bar',
      stack: '总量',
      itemStyle: {
        color: 'rgba(0,0,0,0)'
      },
      emphasis: {
        itemStyle: {
          barBorderColor: 'rgba(0,0,0,0)',
          color: 'rgba(0,0,0,0)'
        }
      },
      data: seriesHelpData
    },
    {
      type: 'bar',
      // ...getChartPadding(showLegend, legendOrientation, legendMargin),
      // animation: false,
      // labelLine: labelsOutside && labelLine ? { show: true } : { show: false },
      label: {
        show: true,
        position: 'inside'
      },
      stack: '总量',
      name: serieName,
      data: seriesData,
    },

  ];

  const echartOptions: EChartsOption = {
    grid: {
      ...defaultGrid,
    },
    tooltip: {
      ...defaultTooltip,
      trigger: 'item',
    },
    xAxis: {
      type: 'category',
      splitLine: { show: false },
      data: data.map(x => {
        return extractGroupbyLabel({
          datum: x,
          groupby,
          coltypeMapping,
          timeFormatter: getTimeFormatter(dateFormat),
        });
      })
    },
    yAxis: {
      type: 'value'
    },
    series: series
  };
  console.log("echartOptions", echartOptions);
  return {
    formData,
    width,
    height,
    echartOptions,
    setDataMask,
    emitFilter,
    labelMap,
    groupby,
    selectedValues,
  };
}
