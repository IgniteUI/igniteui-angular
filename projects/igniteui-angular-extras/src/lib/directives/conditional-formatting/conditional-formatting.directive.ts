import { AfterViewInit, Directive, EventEmitter, Inject, Input, OnDestroy, Output } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export enum ConditionalFormattingType {
    dataBars = 'Data Bars',
    colorScale = 'Color Scale',
    top10 = 'Top 10',
    textContains = 'Text Contains',
    single = 'Duplicate Values',
    unique = 'Unique Values',
    empty = 'Empty'
}
export interface IFormatColors {
    success: string;
    error: string;
    info: string;
    warning: string;
    text: string;
}

@Directive({
    selector: '[igxConditionalFormatting]'
})
export class IgxConditionalFormattingDirective implements AfterViewInit, OnDestroy {
    @Input()
    public formatter: string | ConditionalFormattingType;

    @Input()
    public set formatColors(val: IFormatColors)  {
        this._formatColors = val;
    }
    public get formatColors() {
        return this._formatColors;
    }

    @Output()
    public onFormattersReady = new EventEmitter<string[]>();

    public colorScale = {
        backgroundColor: (rowData, colname, cellValue, rowIndex) => {
            if (!(typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname))) { return; }
            return this.lowTresholdValue >= cellValue ? this.formatColors.error :
                this.middleTresholdValue >= cellValue ? this.formatColors.warning :  this.formatColors.success;
        }
    };

    public dataBars = {
        backgroundImage: (rowData, colname, cellValue, rowIndex) => {
            if (!(typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname))) { return; }
            const treshold = this.threshold;
            let gradientPercents;
            if (cellValue < 0) {
                const negativeStartingPoint = 100 - treshold;
                gradientPercents = this.getNegativePercentage(cellValue);
                return `linear-gradient(to left, transparent 0% ${negativeStartingPoint}%,
                    ${ this.formatColors.error} ${negativeStartingPoint}% ${negativeStartingPoint + gradientPercents}%,
                    transparent ${gradientPercents}% 100%)`;
            } else {
                gradientPercents = this.getPositivePercentage(cellValue);
                return `linear-gradient(to right, transparent 0% ${treshold}%,
                    ${ this.formatColors.success} ${treshold}% ${treshold + gradientPercents}%,
                    transparent ${treshold + gradientPercents}% 100%)`;
            }
        },
        backgroundSize: '100% 80%',
        backgroundRepeat: 'no-repeat',
        backgroundPositionY: 'center'
    };

    public top10Percent = {
        backgroundColor: (rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname)
                && cellValue > this.top10PercentTreshold) {
                return  this.formatColors.info;
            }
        },
        color: (rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname)
                && cellValue > this.top10PercentTreshold) {
                return  this.formatColors.text;
            }
        }
    };

    public greaterThan = {
        backgroundColor: (rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname)
            && cellValue > this.avgValue) {
                return  this.formatColors.info;
            }
        },
        color: (rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'number' && this.isWithInFormattedRange(rowIndex, colname)
            && cellValue > this.avgValue) {
                return  this.formatColors.text;
            }
        }
    };

    public empty = {
        backgroundColor: (rowData, colname, cellValue, rowIndex) => {
            if (this.isWithInFormattedRange(rowIndex, colname) && cellValue === undefined) {
                return  this.formatColors.info;
            }
        },
        color: (rowData, colname, cellValue, rowIndex) => {
            if (this.isWithInFormattedRange(rowIndex, colname) && cellValue === undefined) {
                return  this.formatColors.text;
            }
        }
    };

    public duplicates = {
        backgroundColor: (rowData, colname, cellValue, rowIndex) => {
            if (!this.isWithInFormattedRange(rowIndex, colname)) { return; }
            const arr: any[] = typeof cellValue === 'number' ? this.numericData : this.textData;
            return arr.indexOf(cellValue) !== arr.lastIndexOf(cellValue) ?  this.formatColors.info : '';

        },
        color: (rowData, colname, cellValue, rowIndex) => {
            if (!this.isWithInFormattedRange(rowIndex, colname)) { return; }
            const arr: any[] = typeof cellValue === 'number' ? this.numericData : this.textData;
            return arr.indexOf(cellValue) !== arr.lastIndexOf(cellValue) ?  this.formatColors.text : '';
        }
    };

    public textContains = {
        backgroundColor: (rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'string' && this.isWithInFormattedRange(rowIndex, colname) &&
                cellValue.toLowerCase().indexOf(this._valueForComparison.toLowerCase()) !== -1) {
                return  this.formatColors.info;
            }
        },
        color: (rowData, colname, cellValue, rowIndex) => {
            if (typeof cellValue === 'string' && this.isWithInFormattedRange(rowIndex, colname) &&
                cellValue.toLowerCase().indexOf(this._valueForComparison.toLowerCase()) !== -1) {
                return  this.formatColors.text;
            }
        }
    };

    public uniques = {
        backgroundColor: (rowData, colname, cellValue, rowIndex) => {
            if (!this.isWithInFormattedRange(rowIndex, colname)) { return; }
            const arr: any[] = typeof cellValue === 'number' ? this.numericData : this.textData;
            return arr.indexOf(cellValue) === arr.lastIndexOf(cellValue) ?  this.formatColors.info : '';
        },
        color: (rowData, colname, cellValue, rowIndex) => {
            if (!this.isWithInFormattedRange(rowIndex, colname)) { return; }
            const arr: any[] = typeof cellValue === 'number' ? this.numericData : this.textData;
            return arr.indexOf(cellValue) === arr.lastIndexOf(cellValue) ?  this.formatColors.text : '';
        }
    };

    private get selectedData() {
        if (!this._selectedData.length) { this._selectedData = this.toArray(this.grid.getSelectedData()); }
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

    constructor(@Inject(IgxGridComponent) public grid: IgxGridComponent) {
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
        this.grid.onRangeSelection.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.determineFormatters();
        });
        this.grid.onCellEdit.pipe(takeUntil(this.destroy$)).subscribe((args: any) => {
            if ((args.newValue === args.oldValue || !this.formatter)) { return; }
            if (this.isWithInFormattedRange(args.cellID.rowIndex, args.cellID.columnID - 1)) {
                const value = Number(args.newValue);
                const valueToBeAdded = !Number.isNaN(value) && Number.isFinite(value) ? value : args.newValue;
                this.selectedData.splice(this.selectedData.indexOf(args.oldValue), 1, valueToBeAdded);
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
        if (reset) { this.resetRange(formatRange); }
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

    public determineFormatters() {
        const numericData = this.toArray(this.grid.getSelectedData()).some(rec => typeof rec === 'number');
        const textData = this.toArray(this.grid.getSelectedData()).some(rec => typeof rec === 'string');
        const formatters =  Array.of(...this._commonFormattersName);
        if (!(numericData) && textData) {
            formatters.splice(0, 0, ...this._textFormatters);
        } else if (numericData && !textData) {
            formatters.splice(0, 0, ...this._numericFormatters);
        } else {
            formatters.splice(0, 0, ...['Data Bars', 'Color Scale', 'Text Contains']);
        }
        this.onFormattersReady.emit(formatters);
    }

    public recalcCachedValues(clearAll = false) {
        if (clearAll) {
            this._startColumn = Math.min(...this.grid.getSelectedRanges().map(r => Number(r.columnStart)));
            this._endColumn = Math.max(...this.grid.getSelectedRanges().map(r => Number(r.columnEnd)));
            this._selectedData = [];
        }
        this._valueForComparison = this.textData[0];
        this._maxValue = Math.max(...this.numericData);
        this._minValue = Math.min(...this.numericData.filter(value => value < 0)) | 0;
    }

    public isWithInFormattedRange(rowIndex, colID) {
        const visibleIndex = typeof colID === 'string' ? this.grid.getColumnByName(colID).visibleIndex : colID;
        if (!this.formatedRange.size) { return false; }
        return this.formatedRange.has(rowIndex) && this.formatedRange.get(rowIndex).has(visibleIndex);
    }

    private get middleTresholdValue() { return 0.66 * Math.ceil(this._maxValue); }

    private get lowTresholdValue() { return 0.33 * Math.ceil(this._maxValue); }

    private get top10PercentTreshold() { return 0.9 * Math.ceil(this._maxValue); }

    private get avgValue() {
        return Math.ceil((this.numericData.reduce((a, b) => a + b, 0)) / this.numericData.length);
    }

    private get threshold() {
        return Math.ceil(Math.abs(this._minValue) / (this._maxValue + Math.abs(this._minValue)) * 100);
    }

    private getPositivePercentage(val) {
        const result = (Math.ceil(val) / (this._maxValue + Math.abs(this._minValue))) * 100;
        return Math.ceil(result);
    }

    private getNegativePercentage(val) {
        const result = (Math.abs(val) / (this._maxValue + Math.abs(this._minValue))) * 100;
        return Math.ceil(result);
    }

    private resetRange(formatRange?: []) {
        this.formatedRange.clear();
        const customRange = formatRange ? formatRange : this.grid.getSelectedRanges();
        customRange.forEach(range => {
            for (let ri = range.rowStart; ri <= Number(range.rowEnd); ri++) {
                for (let ci = Number(range.columnStart); ci <= Number(range.columnEnd); ci++) {
                    this.addToCache(ri, ci);
                }
            }
        });
        this.recalcCachedValues(true);
    }

    private addToCache(rowIndex, colIndex, selection = true) {
        this.formatedRange.has(rowIndex) ? this.formatedRange.get(rowIndex).add(colIndex) :
        this.formatedRange.set(rowIndex, new Set<number>()).get(rowIndex).add(colIndex);
    }

    private toArray(data: any[]) {
        let result = [];
        data.forEach(rec => result = result.concat(Object.values(rec)));
        return result;
    }
}
