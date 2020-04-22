export enum CHART_TYPE {
    PIE= 'Pie',
    COLUMN_GROUPED = 'ColumnGrouped',
    AREA_GROUPED = 'AreaGrouped',
    LINE_GROUPED = 'LineGrouped',
    BAR_GROUPED = 'BarGrouped',
    COLUMN_STACKED = 'ColumnStacked',
    AREA_STACKED = 'AreaStacked',
    LINE_STACKED = 'LineStacked',
    BAR_STACKED = 'BarStacked',
    COLUMN_100_STACKED = 'Column100Stacked',
    AREA_100_STACKED = 'Area100Stacked',
    LINE_100_STACKED = 'Line100Stacked',
    BAR_100_STACKED = 'Bar100Stacked',
    SCATTER_POINT = 'ScatterPoint',
    SCATTER_BUBBLE = 'ScatterBubble',
    SCATTER_LINE = 'ScatterLine'
}

export enum OPTIONS_TYPE {
    CHART = 'chartOptions',
    SERIES = 'seriesModel',
    X_AXIS = 'xAxisOptions',
    Y_AXIS = 'yAxisOptions',
    STACKED_SERIES = 'stackedFragmentOptions'
}
