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
import { AnnotationLayer, TimeGranularity } from '@superset-ui/core';
import { DEFAULT_LEGEND_FORM_DATA, EchartsLegendFormData } from '../types';

export type EchartsWaterfallFormData = {
  colorScheme?: string;
  logAxis: boolean;
  markerEnabled: boolean;
  markerSize: number;
  orderDesc: boolean;
  stack: boolean;
  tooltipTimeFormat?: string;
  truncateYAxis: boolean;
  yAxisFormat?: string;
  yAxisTitle: string;
  xAxisShowMinLabel?: boolean;
  xAxisShowMaxLabel?: boolean;
  xAxisTimeFormat?: string;
  yAxisBounds: [number | undefined | null, number | undefined | null];
  xAxisLabelRotation: number;
} & EchartsLegendFormData;

export const DEFAULT_FORM_DATA: EchartsWaterfallFormData = {
  ...DEFAULT_LEGEND_FORM_DATA,
  logAxis: false,
  markerEnabled: false,
  markerSize: 6,
  orderDesc: true,
  stack: false,
  tooltipTimeFormat: 'smart_date',
  truncateYAxis: true,
  yAxisBounds: [null, null],
  xAxisShowMinLabel: false,
  xAxisShowMaxLabel: false,
  xAxisLabelRotation: 0,
  yAxisTitle: '',
};
