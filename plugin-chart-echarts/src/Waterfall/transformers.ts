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
  CategoricalColorScale,
  getTimeFormatter,
  IntervalAnnotationLayer,
  isTimeseriesAnnotationResult,
  smartDateDetailedFormatter,
  smartDateFormatter,
  TimeFormatter,
  NumberFormatter,
  TimeseriesAnnotationLayer,
  TimeseriesDataRecord,
} from '@superset-ui/core';
import { SeriesOption,BarSeriesOption,LineSeriesOption } from 'echarts';
import {
  CallbackDataParams,
  DefaultExtraStateOpts,
  ItemStyleOption,
  LineStyleOption,
  OptionName,
  ZRLineType,
} from 'echarts/types/src/util/types';
import {
  MarkArea1DDataItemOption,
  MarkArea2DDataItemOption,
} from 'echarts/types/src/component/marker/MarkAreaModel';
import { MarkLine1DDataItemOption } from 'echarts/types/src/component/marker/MarkLineModel';

import { extractForecastSeriesContext } from '../utils/prophet';
import { ForecastSeriesEnum, LegendOrientation } from '../types';
import { WaterfallSeriesEnum,WaterfallSeriesContext } from './types';
import { getChartPadding } from '../utils/series';
import { TIMESERIES_CONSTANTS } from '../constants';
import { groupBy } from 'lodash';
import { useState } from 'react';


const seriesTypeRegex = new RegExp(
  `(.+)(${WaterfallSeriesEnum.WaterfallCumulative})$`,
);
export const extractWaterfallSeriesContext = (seriesName: OptionName): WaterfallSeriesContext => {
  const name = seriesName as string;
  const regexMatch = seriesTypeRegex.exec(name);
  if (!regexMatch) return { name, type: WaterfallSeriesEnum.Observation };
  return {
    name: regexMatch[1],
    type: regexMatch[2] as WaterfallSeriesEnum,
  };
};


function isNumber(value: any | undefined | null) : number{
  if(value === undefined || value === null || typeof value !== 'number') 
    return 0;
  return value;
}

function extractStack(context : WaterfallSeriesContext|undefined, isStack? : boolean):string{
  if(context.name === WaterfallSeriesEnum.WaterfallWorth)
    return context.name;
  if(isStack) return 'stack'
  return context.name;
}

function extractType(key : any):string{
  if(key === null || key === undefined) return "";
  return key.split(',')[1];
}

function extractName(key : any | undefined | null):string{
  if(key === null || key === undefined)
    return key;
  return key.split(',')[0];
}

export function dimensionTimeseriesSeries(
  data: TimeseriesDataRecord[],
  opts:{
    isStack? : boolean;
    isTotal? : boolean;
    labelEnabled? : boolean;
    highPointer? : boolean;}
  ): TimeseriesDataRecord[]
{
  const keys = Object.keys(data[0]).filter(key => key !== '__timestamp');
  const {isTotal} = opts;
  
  let previousTotalValue = new Array(keys.length).fill({});

  if(isTotal) keys.push(WaterfallSeriesEnum.WaterfallWorth);
  return data.map((datum,rowIdx) => {

    if(isTotal)
    {
      let total = keys.reduce((result,currKey)=>{
        result += isNumber(datum[currKey])
        return result
      },0)

      datum[WaterfallSeriesEnum.WaterfallWorth] = total;
    }


    let cumulatve = keys.reduce((result,currKey)=>{
      let key = `${currKey}${WaterfallSeriesEnum.WaterfallCumulative}`;

      if(rowIdx === 0)
        result[key] = 0;
      else
      {
        let preValue = isNumber(data[rowIdx-1][currKey]);
        let curValue = isNumber(datum[currKey]);
        let preTotalValue = isNumber(previousTotalValue[key]); 
        result[key] = preTotalValue;
        if((curValue <= 0 && preValue <= 0) || (curValue > 0 && preValue > 0))
          result[key] = preTotalValue + preValue;
        if(preValue > 0 && curValue < 0)
        {
          result[key] = preTotalValue + preValue + curValue;
        }
      }
      previousTotalValue[key] = result[key];
      
      return result
    },{});

    datum = {...cumulatve,...datum};
    
    return {
      __timestamp: datum.__timestamp || datum.__timestamp === 0 ? new Date(datum.__timestamp) : null
      ,...datum};
  });
}

function addHighPoint(series: BarSeriesOption)
{

    let sum = 0
    series.data.forEach(element => {
      sum+= element[1];
    });
    series.markLine = {
      // show:true,
      data: [
        { yAxis: sum }
      ]
    }
}

function addSeriesLabel(series: BarSeriesOption)
{
  series.data = series.data.map((value: any)=>({
    value,
    label: {
      show: true,
      formatter:(params:CallbackDataParams):string=>{
        const {value} = params;
        var sum = value[2] * value[1];
        if( sum !== 0) 
          return sum + '';
        else
          return "";
      },
      position:  value[2] * value[1] > 0 ? 'top':'bottom',
    },
  }));
}

function cumulativeColor(
  series: BarSeriesOption|undefined)
{
  series.itemStyle = {
    color: 'rgba(0,0,0,0)',
  };
  series.emphasis = {
    color: 'rgba(0,0,0,0)',
    barBorderColor: 'rgba(0,0,0,0)',
  };
}

function rebaseSeriesData(
  series: BarSeriesOption,
  context:WaterfallSeriesContext
  )
{
  series.data = series.data.map(datum =>{
    var value = 1;
    if(context.name === WaterfallSeriesEnum.WaterfallWorth)
      value = datum[1] > 0 ? 1 : -1
    return [datum[0],datum[1]*value,value]
  }); 
}



export function transformSeries(
  series: BarSeriesOption,
  colorScale: CategoricalColorScale,
  opts: {
    isStack?: boolean;
    isTotal?: boolean;
    labelEnabled? : boolean;
    highPointer? : boolean;
  }
): SeriesOption | undefined {
  const { id } = series;
  const {
    isStack,
    isTotal,
    labelEnabled,
    highPointer
  } = opts;

  const {name} = series;

  const waterfallSeries = extractWaterfallSeriesContext(name || '');

  // const stack = extractStack(id,isStack);

  // const name = extractName(id);

  // const type = extractType(id);
  // console.log(waterfallSeries);

  if(waterfallSeries.type === WaterfallSeriesEnum.WaterfallCumulative)
  {
    cumulativeColor(series);
  }
  else
  {

    if(highPointer)
      addHighPoint(series);
    
    rebaseSeriesData(series,waterfallSeries);

    if(labelEnabled)
      addSeriesLabel(series);
    
  }
  


  return {
    ...series,
    type:'bar',
    stack:extractStack(waterfallSeries,isStack),
    name:waterfallSeries.name,
    barCategoryGap:'0%',
    barGap:'0%',
  }
}

export function getPadding(
  showLegend: boolean,
  legendOrientation: LegendOrientation,
  addYAxisLabelOffset: boolean,
  zoomable: boolean,
  margin?: string | number | null,
): {
  bottom: number;
  left: number;
  right: number;
  top: number;
} {
  const yAxisOffset = addYAxisLabelOffset ? TIMESERIES_CONSTANTS.yAxisLabelTopOffset : 0;
  return getChartPadding(showLegend, legendOrientation, margin, {
    top: TIMESERIES_CONSTANTS.gridOffsetTop + yAxisOffset,
    bottom: zoomable
      ? TIMESERIES_CONSTANTS.gridOffsetBottomZoomable
      : TIMESERIES_CONSTANTS.gridOffsetBottom,
    left: TIMESERIES_CONSTANTS.gridOffsetLeft,
    right:
      showLegend && legendOrientation === LegendOrientation.Right
        ? 0
        : TIMESERIES_CONSTANTS.gridOffsetRight,
  });
}

export function getTooltipTimeFormatter(format?: string): TimeFormatter | StringConstructor {
  if (format === smartDateFormatter.id) {
    return smartDateDetailedFormatter;
  }
  if (format) {
    return getTimeFormatter(format);
  }
  return String;
}

export function getXAxisFormatter(format?: string): TimeFormatter | StringConstructor | undefined {
  if (format === smartDateFormatter.id || !format) {
    return undefined;
  }
  if (format) {
    return getTimeFormatter(format);
  }
  return String;
}

export function extractWaterfallValuesFromTooltipParams(){

}