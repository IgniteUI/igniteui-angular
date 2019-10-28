
export enum FilterMode {
    quickFilter = 'quickFilter',
    excelStyleFilter = 'excelStyleFilter'
}

export enum GridSummaryPosition {
    top = 'top',
    bottom = 'bottom'
}

export enum GridSummaryCalculationMode {
    rootLevelOnly = 'rootLevelOnly',
    childLevelsOnly = 'childLevelsOnly',
    rootAndChildLevels = 'rootAndChildLevels'
}

export enum GridKeydownTargetType {
    dataCell = 'dataCell',
    summaryCell = 'summaryCell',
    groupRow = 'groupRow',
    hierarchicalRow = 'hierarchicalRow'
}

export enum GridSelectionMode {
    none = 'none',
    single = 'single',
    multiple = 'multiple',
}

export enum ColumnDisplayOrder {
    Alphabetical = 'Alphabetical',
    DisplayOrder = 'DisplayOrder'
}
