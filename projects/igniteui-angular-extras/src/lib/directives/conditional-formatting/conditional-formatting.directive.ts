import { AfterViewInit, Directive, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular/grids/grid';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

export enum ConditionalFormattingType {
    DataBars = 'Data Bars',
    ColorScale = 'Color Scale',
    Top10 = 'Top 10',
    TextContains = 'Text Contains',
    Single = 'Duplicate Values',
    Unique = 'Unique Values',
    Empty = 'Empty'
}
export interface IFormatColors {
    success: string;
    error: string;
    info: string;
    warning: string;
    text: string;
}

@Directive({
    selector: '[igxConditionalFormatting]',
})
export class IgxConditionalFormattingDirective implements AfterViewInit, OnDestroy {
    @Input()
    public formatter: string | ConditionalFormattingType;

    @Input()
    public set formatColors(val: IFormatColors) {
        this._formatColors = val;
    }
    public get formatColors() {
        return this._formatColors;
    }

    @Output()
    public formattersReady = new EventEmitter<string[]>();

    public colorScale = {
        backgroundColor: (_rowData, colname, cellValue, rowIndex) => {
            if (!(typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname))) {
                return;
            }
            return this.lowTresholdValue >= cellValue ? this.formatColors.error :
                this.middleTresholdValue >= cellValue ? this.formatColors.warning : this.formatColors.success;
        }
    };

    public dataBars = {
        backgroundImage: (_rowData, colname, cellValue, rowIndex) => {
            if (!(typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname))) {
                return;
            }
            const treshold = this.threshold;
            let gradientPercents;
            if (cellValue < 0) {
                const negativeStartingPoint = 100 - treshold;
                gradientPercents = this.getNegativePercentage(cellValue);
                return `linear-gradient(to left, transparent 0% ${negativeStartingPoint}%,
                    ${this.formatColors.error} ${negativeStartingPoint}% ${negativeStartingPoint + gradientPercents}%,
                    transparent ${gradientPercents}% 100%)`;
            } else {
                gradientPercents = this.getPositivePercentage(cellValue);
                return `linear-gradient(to right, transparent 0% ${treshold}%,
                    ${this.formatColors.success} ${treshold}% ${treshold + gradientPercents}%,
                    transparent ${treshold + gradientPercents}% 100%)`;
            }
        },
        backgroundSize: '100% 80%',
        backgroundRepeat: 'no-repeat',
        backgroundPositionY: 'center'
    };

    public top10Percent = {
        backgroundColor: (_rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname)
                && cellValue > this.top10PercentTreshold) {
                return this.formatColors.info;
            }
        },
        color: (_rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname)
                && cellValue > this.top10PercentTreshold) {
                return this.formatColors.text;
            }
        }
    };

    public greaterThan = {
        backgroundColor: (_rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname)
                && cellValue > this.avgValue) {
                return this.formatColors.info;
            }
        },
        color: (_rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname)
                && cellValue > this.avgValue) {
                return this.formatColors.text;
            }
        }
    };

    public empty = {
        backgroundColor: (_rowData, colname, cellValue, rowIndex) => {
            if (this.isWithInFormattedRange(rowIndex, colname) && cellValue === undefined) {
                return this.formatColors.info;
            }
        },
        color: (_rowData, colname, cellValue, rowIndex) => {
            if (this.isWithInFormattedRange(rowIndex, colname) && cellValue === undefined) {
                return this.formatColors.text;
            }
        }
    };

    public duplicates = {
        backgroundColor: (_rowData, colname, cellValue, rowIndex) => {
            if (!this.isWithInFormattedRange(rowIndex, colname)) {
                return;
            }
            const arr: any[] = typeof cellValue === 'number' ? this.numericData : this.textData;
            return arr.indexOf(cellValue) !== arr.lastIndexOf(cellValue) ? this.formatColors.info : '';

        },
        color: (_rowData, colname, cellValue, rowIndex) => {
            if (!this.isWithInFormattedRange(rowIndex, colname)) {
                return;
            }
            const arr: any[] = typeof cellValue === 'number' ? this.numericData : this.textData;
            return arr.indexOf(cellValue) !== arr.lastIndexOf(cellValue) ? this.formatColors.text : '';
        }
    };

    public textContains = {
        backgroundColor: (_rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'string' && this.isWithInFormattedRange(rowIndex, colname) &&
                cellValue.toLowerCase().indexOf(this._valueForComparison.toLowerCase()) !== -1) {
                return this.formatColors.info;
            }
        },
        color: (_rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'string' && this.isWithInFormattedRange(rowIndex, colname) &&
                cellValue.toLowerCase().indexOf(this._valueForComparison.toLowerCase()) !== -1) {
                return this.formatColors.text;
            }
        }
    };

    public uniques = {
        backgroundColor: (_rowData, colname, cellValue, rowIndex) => {
            if (!this.isWithInFormattedRange(rowIndex, colname)) {
                return;
            }
            const arr: any[] = typeof cellValue === 'number' ? this.numericData : this.textData;
            return arr.indexOf(cellValue) === arr.lastIndexOf(cellValue) ? this.formatColors.info : '';
        },
        color: (_rowData, colname, cellValue, rowIndex) => {
            if (!this.isWithInFormattedRange(rowIndex, colname)) {
                return;
            }
            const arr: any[] = typeof cellValue === 'number' ? this.numericData : this.textData;
            return arr.indexOf(cellValue) === arr.lastIndexOf(cellValue) ? this.formatColors.text : '';
        }
    };

    private get selectedData() {
        this._selectedData = this.grid.getSelectedData().length ? this.toArray(this.grid.getSelectedData()) :
            this.toArray(this.grid.getSelectedColumnsData());
        return this._selectedData;
    }

    private get textData() {
        return this.selectedData.filter(val => typeof val === 'string');
    }

    private get numericData() {
        return this.selectedData.filter(val => typeof val === 'number');
    }
    private _formatColors: IFormatColors = {
        success: '#4EB862',
        error: '#FF134A',
        warning: '#FBB13C',
        info: '#1377D5',
        text: '#FFF'
    };
    private _numericFormatters = ['Data Bars', 'Color Scale', 'Top 10', 'Greater Than'];
    private _textFormatters = ['Text Contains'];
    private _commonFormattersName = ['Duplicate Values', 'Unique Values', 'Empty'];
    private _selectedData = [];
    private _minValue;
    private _maxValue;
    private _startColumn;
    private _endColumn;
    private _valueForComparison;
    private _formattersData = new Map<string, any>();
    private destroy$ = new Subject<any>();
    private formatedRange: Map<number, Set<number>> = new Map<number, Set<number>>();
    private readonly grid = inject(IgxGridComponent);

    constructor() {
        this._formattersData.set('Data Bars', this.dataBars);
        this._formattersData.set('Color Scale', this.colorScale);
        this._formattersData.set('Top 10', this.top10Percent);
        this._formattersData.set('Greater Than', this.greaterThan);
        this._formattersData.set('Text Contains', this.textContains);
        this._formattersData.set('Duplicate Values', this.duplicates);
        this._formattersData.set('Unique Values', this.uniques);
        this._formattersData.set('Empty', this.empty);
    }

    public ngAfterViewInit(): void {
        this.grid.rangeSelected.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.determineFormatters(false);
        });
        this.grid.columnSelectionChanging.pipe(takeUntil(this.destroy$), debounceTime(200)).subscribe(() => {
            this.determineFormatters(true);
        });
        this.grid.cellEdit.pipe(takeUntil(this.destroy$)).subscribe((args: any) => {
            if ((args.newValue === args.oldValue || !this.formatter)) {
                return;
            }
            if (this.isWithInFormattedRange(args.cellID.rowIndex, args.cellID.columnID - 1)) {
                const value = Number(args.newValue);
                this.selectedData.push(!Number.isNaN(value) && Number.isFinite(value) ? value : args.newValue);
                this.recalcCachedValues();
                this.formatCells(this.formatter, undefined, false);
            }
        });
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public formatCells(formatterName, formatRange?: [], reset = true) {
        if (reset) {
            this.resetRange(formatRange);
        }
        this.clearFormatting();
        this.formatter = formatterName;
        this.grid.visibleColumns.forEach(c => {
            if (c.visibleIndex >= this._startColumn && c.visibleIndex <= this._endColumn) {
                c.cellStyles = this._formattersData.get(this.formatter);
                this.grid.notifyChanges();
            }
        });
    }

    public clearFormatting() {
        this.formatter = undefined;
        this.grid.visibleColumns.forEach(c => {
            c.cellStyles = undefined;
            this.grid.cdr.detectChanges();
        });
    }

    public determineFormatters(fromColumn) {
        const data = fromColumn ? this.grid.getSelectedColumnsData() : this.grid.getSelectedData();
        const numericData = this.toArray(data).some(rec => typeof rec === 'number');
        const textData = this.toArray(data).some(rec => typeof rec === 'string');
        const formatters = Array.of(...this._commonFormattersName);
        if (!(numericData) && textData) {
            formatters.splice(0, 0, ...this._textFormatters);
        } else if (numericData && !textData) {
            formatters.splice(0, 0, ...this._numericFormatters);
        } else {
            formatters.splice(0, 0, ...['Data Bars', 'Color Scale', 'Text Contains']);
        }
        this.formattersReady.emit(formatters);
    }

    public recalcCachedValues(clearAll = false) {
        if (clearAll) {
            if (this.grid.getSelectedRanges().length === 0) {
                const selectedColumns = this.grid.selectedColumns();
                if (selectedColumns.length === 1) {
                    this._startColumn = this._endColumn = selectedColumns[0].visibleIndex;
                } else if (selectedColumns.length > 1) {
                    this._startColumn = Math.min(...selectedColumns.map(c => c.visibleIndex));
                    this._endColumn = Math.max(...selectedColumns.map(c => c.visibleIndex));
                } else {
                    return;
                }
            } else {
                this._startColumn = Math.min(...this.grid.getSelectedRanges().map(r => Number(r.columnStart)));
                this._endColumn = Math.max(...this.grid.getSelectedRanges().map(r => Number(r.columnEnd)));
            }
            this._selectedData = [];
        }
        this._valueForComparison = this.textData[0];
        const hasNegativeValues = this.numericData.some(value => value < 0);
        this._maxValue = Math.max(...this.numericData);
        this._minValue = hasNegativeValues ? Math.min(...this.numericData.filter(value => value < 0)) : 0;
    }

    public isWithInFormattedRange(rowIndex, colID) {
        const visibleIndex = typeof colID === 'string' ? this.grid.getColumnByName(colID).visibleIndex : colID;
        if (!this.formatedRange.size) {
            return false;
        }
        return this.formatedRange.has(rowIndex) && this.formatedRange.get(rowIndex).has(visibleIndex);
    }

    private get middleTresholdValue() {
        return 0.66 * Math.ceil(this._maxValue);
    }

    private get lowTresholdValue() {
        return 0.33 * Math.ceil(this._maxValue);
    }

    private get top10PercentTreshold() {
        return 0.9 * Math.ceil(this._maxValue);
    }

    private get avgValue() {
        return Math.ceil((this.numericData.reduce((a, b) => a + b, 0)) / this.numericData.length);
    }

    private get threshold() {
        return Math.ceil(Math.abs(this._minValue) / (this._maxValue + Math.abs(this._minValue)) * 100);
    }

    private getPositivePercentage(val) {
        return Math.ceil(Math.ceil(val) / (this._maxValue + Math.abs(this._minValue)) * 100);
    }

    private getNegativePercentage(val) {
        return Math.ceil(Math.abs(val) / (this._maxValue + Math.abs(this._minValue)) * 100);
    }

    private resetRange(formatRange?: []) {
        this.formatedRange.clear();
        const selectedRanges = this.grid.getSelectedRanges();
        let customRange;

        // Column selection custom range
        if (selectedRanges.length === 0) {
            const selectedColumns = this.grid.selectedColumns();
            customRange = [];
            selectedColumns.forEach(c => {
                customRange.push({
                    columnEnd: c.visibleIndex,
                    columnStart: c.visibleIndex,
                    rowEnd: this.grid.data.length - 1,
                    rowStart: 0
                });
            });
        } else {
            customRange = formatRange ? formatRange : this.grid.getSelectedRanges();
        }
        customRange.forEach(range => {
            for (let ri = range.rowStart; ri <= Number(range.rowEnd); ri++) {
                for (let ci = Number(range.columnStart); ci <= Number(range.columnEnd); ci++) {
                    this.addToCache(ri, ci);
                }
            }
        });
        this.recalcCachedValues(true);
    }

    private addToCache(rowIndex, colIndex) {
        if (this.formatedRange.has(rowIndex)) {
            this.formatedRange.get(rowIndex).add(colIndex);
        } else {
            this.formatedRange.set(rowIndex, new Set<number>()).get(rowIndex).add(colIndex);
        }
    }

    private toArray(data: any[]) {
        let result = [];
        data.forEach(rec => result = result.concat(Object.values(rec)));
        return result;
    }
}
