'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';

// Define proper TypeScript interfaces for ECharts
interface TooltipCallbackParams {
    componentType: string;
    seriesType: string;
    seriesIndex: number;
    seriesName: string;
    name: string;
    dataIndex: number;
    data: unknown;
    value: (string | number)[];
    color: string;
    percent?: number;
    dataType?: string;
    axisValue?: string | number;
    axisValueLabel?: string;
}

interface CustomSeriesRenderItemParams {
    context: unknown;
    seriesId: string;
    seriesName: string;
    seriesIndex: number;
    dataIndex: number;
    dataIndexInside: number;
    dataInsideIndex: number;
    coordSys: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    encode: {
        [key: string]: number[] | undefined;
        x?: number[];
        y?: number[];
        tooltip?: number[];
        itemName?: number[];
    };
}

interface CustomSeriesRenderItemAPI {
    value: (dim: number | string, dataIdx?: number) => number;
    coord: (point: (number | string)[]) => number[];
    size: (dim: number | string, dataIdx?: number) => number[];
    style: (userProps?: Record<string, unknown>) => Record<string, unknown>;
    visual: (visualType: string) => unknown;
}

export interface GanttDataItem {
    country: string;
    start: string;
    end: string;
}

interface GanttChartProps {
    title: string;
    data: GanttDataItem[];
    color?: string;
}

const GanttChart: React.FC<GanttChartProps> = ({ title, data, color = '#4a68af' }) => {
    const categories = data.map(item => item.country);
    const seriesData = data.map((item, index) => ({
        name: item.country,
        value: [
            index,
            new Date(item.start).getTime(),
            new Date(item.end).getTime()
        ]
    }));

    const option = {
        title: {
            text: title,
            left: 'center',
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            formatter: function(params: TooltipCallbackParams) {
                if (params && 'value' in params) {
                    const start = params.value[1];
                    const end = params.value[2];
                    return `
                        <strong>Start:</strong> ${new Date(start).toLocaleDateString()}<br/>
                        <strong>End:</strong> ${new Date(end).toLocaleDateString()}
                    `;
                }
                return '';
            }
        },
        grid: {
            containLabel: true,
            left: '20%',
            right: '5%'
        },
        xAxis: {
            type: 'time',
            name: 'Year',
            axisLabel: {
                fontSize: 12
            }
        },
        yAxis: {
            type: 'category',
            data: categories,
            inverse: true,
            axisLabel: {
                fontSize: 12
            }
        },
        series: [{
            type: 'custom',
            renderItem: function(params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI) {
                const categoryIndex = api.value(0);
                const start = api.coord([api.value(1), categoryIndex]);
                const end = api.coord([api.value(2), categoryIndex]);
                const height = 20;

                if (!start || !end) {
                    return {
                        type: 'rect',
                        shape: { x: 0, y: 0, width: 0, height: 0 }
                    };
                }

                return {
                    type: 'rect',
                    shape: {
                        x: start[0],
                        y: start[1] - height / 2,
                        width: end[0] - start[0],
                        height
                    },
                    style: {
                        fill: color
                    }
                };
            },
            itemStyle: {
                borderColor: '#333',
                borderWidth: 1
            },
            encode: {
                x: [1, 2],
                y: 0
            },
            data: seriesData
        }]
    };

    return <ReactECharts option={option} style={{ height: 600 }} />;
};

export default GanttChart;