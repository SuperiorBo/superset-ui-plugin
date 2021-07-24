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
import { number } from '@storybook/addon-knobs';

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
    labelsOutside,
    labelLine,
    labelType,
    legendMargin,
    legendOrientation,
    legendType,
    metric = '',
    numberFormat,
    dateFormat,
    showLabels,
    showLegend,
    showLabelsThreshold,
    emitFilter,
    separator
  }: EchartsBarFormData = { ...DEFAULT_LEGEND_FORM_DATA, ...DEFAULT_Bar_FORM_DATA, ...formData };

  const metricLabel = getMetricLabel(metric);
  
  const labelMap = data.reduce((acc: Record<string, DataRecordValue[]>, datum) => {
    
    const label = extractGroupbyLabel({
      datum,
      groupby,
      coltypeMapping,
      timeFormatter: getTimeFormatter(dateFormat),
    });
    return {
      ...acc,
      [label]: groupby.map(col => datum[col]),
    };
  }, {});

  const { setDataMask = () => { } } = hooks;

  const series: BarSeriesOption[] = [];
  const dataKeys = data.length > 0 ? Object.keys(data[0]) : [];
  const seriesTypeRegex = new RegExp(
    `(.+)(${separator})(.+)`,
  );
  const metrics = dataKeys.map(x => {
    const regexMatch = seriesTypeRegex.exec(x);
    if (!regexMatch) return {
      name: x,
      type: ''
    };
    return {
      name: regexMatch[1],
      type: regexMatch[3]
    };
  }).filter(x => !!x.type);
  let legendData = [];
  
  const metricTypes = Array.from(new Set(metrics.map(x => x.type)));
  let metricTypeTotal=Object.fromEntries(metricTypes.map(x=>{
    return [x,0]
  }));
  const getHelpData=(d,type)=>{
    const regex = new RegExp(
      `(.+)(${separator})(${type})`,
    );
    let helpKeys=dataKeys.map(x=>{
      const regexMatch = regex.exec(x);
      if (!regexMatch) return '';
      return regexMatch[1];
    }).filter(x => !!x);
    let total=metricTypeTotal[type];
    metricTypeTotal[type]+=calculateTotal(d,helpKeys);
    return total;
  }
  const calculateTotal=(d,keys)=>{
    let total=0;
    keys.forEach(x => {
      total=total+d[x]
    });
    return total
  }

  metricTypes.forEach(x => {
    series.push({
      name: '辅助',
      type: 'bar',
      stack: x,
      itemStyle: {
        color: 'rgba(0,0,0,0)'
      },
      emphasis: {
        itemStyle: {
          barBorderColor: 'rgba(0,0,0,0)',
          color: 'rgba(0,0,0,0)'
        }
      },
      data: data.map(d => {
        return [Number(d.__timestamp), getHelpData(d,x)]
      })
    });
  });
  metrics.forEach(x => {
    const name = `${x.name}${separator}${x.type}`;
    legendData.push(name);
    series.push({
      name: name,
      type: 'bar',
      stack: x.type,
      label: {
        // show: true,
        position: 'inside'
      },
      data: data.map(d => {
        return [Number(d.__timestamp), Number(d[name])]
      })
    });
  })

  const selectedValues = (filterState.selectedValues || []).reduce(
    (acc: Record<string, number>, selectedValue: string) => {
      const index = series.findIndex(({ name }) => name === selectedValue);
      return {
        ...acc,
        [index]: selectedValue,
      };
    },
    {},
  );

  const echartOptions: EChartsOption = {
    grid: {
      ...defaultGrid,
    },
    tooltip: {
      ...defaultTooltip,
      trigger: 'item',
    },
    legend: {
      data: legendData
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: series
  };
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
