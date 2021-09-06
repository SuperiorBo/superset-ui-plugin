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
  AnnotationData,
  AnnotationLayer,
  AnnotationOpacity,
  CategoricalColorScale,
  EventAnnotationLayer,
  getTimeFormatter,
  IntervalAnnotationLayer,
  isTimeseriesAnnotationResult,
  smartDateDetailedFormatter,
  smartDateFormatter,
  TimeFormatter,
  TimeseriesAnnotationLayer,
  TimeseriesDataRecord,
} from '@superset-ui/core';
import { SeriesOption } from 'echarts';
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

import { getChartPadding } from '../utils/series';
import { TIMESERIES_CONSTANTS } from '../constants';
import { groupBy } from 'lodash';

export function transformSeries(
  series: SeriesOption,
  colorScale: CategoricalColorScale,
  opts: {
    markerEnabled?: boolean;
    markerSize?: number;
    stack?: boolean;
  }
): SeriesOption | undefined {
  const { name } = series;
  const {
    markerEnabled,
    markerSize,
    stack
  } = opts;
  console.log(series);
  return {
    ...series,
    name:series.groupby,
    itemStyle: {
      color: colorScale(name),
    },
    type: 'bar',
    stack: stack ? name:undefined,
    showSymbol: true,
    symbolSize: markerSize,
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
