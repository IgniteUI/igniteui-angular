import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { take } from 'rxjs/operators';
import { IgxSelectionAPIService } from '../core/selection';
import { KEYCODES } from '../core/utils';
import { DataType } from '../data-operations/data-util';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { IgxGridAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    preserveWhitespaces: false,
    selector: 'igx-grid-cell',
    templateUrl: './cell.component.html'
})
export class IgxGridCellComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input()
    public column: IgxColumnComponent;

    @Input()
    public row: any;

    @Input()
    public cellTemplate: TemplateRef<any>;

    @Input()
    public value: any;

    private get isFirstCell(): boolean {
        return this.columnIndex === 0 || (this.isPinned && this.visibleColumnIndex === 0);
    }

    private get isLastCell(): boolean {
        return this.columnIndex === this.grid.columns.length - 1;
    }

    public highlightClass = 'igx-highlight';
    public activeHighlightClass = 'igx-highlight__active';

    get formatter(): (value: any) => any {
        return this.column.formatter;
    }

    get context(): any {
        return {
            $implicit: this.value,
            cell: this
        };
    }

    get template(): TemplateRef<any> {
        if (this.inEditMode) {
            const inlineEditorTemplate = this.column.inlineEditorTemplate;
            return inlineEditorTemplate ? inlineEditorTemplate : this.inlineEditorTemplate;
        }
        if (this.cellTemplate) {
            return this.cellTemplate;
        }
        return this.defaultCellTemplate;
    }

    get gridID(): any {
        return this.row.gridID;
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    get rowIndex(): number {
        return this.row.index;
    }

    get columnIndex(): number {
        return this.column.index;
    }

    get visibleColumnIndex(): number {
        return this.column.visibleIndex;
    }

    get unpinnedColumnIndex(): number {
        return this.grid.unpinnedColumns.filter(c => !c.columnGroup).indexOf(this.column);
    }

    public get cellID() {
        const primaryKey = this.grid.primaryKey;
        const rowID = primaryKey ? this.row.rowData[primaryKey] : this.row.rowData;
        return { rowID, columnID: this.columnIndex, rowIndex: this.rowIndex };
    }

    get nativeElement(): any {
        return this.element.nativeElement;
    }

    get inEditMode(): boolean {
        const editableCell = this.gridAPI.get_cell_inEditMode(this.gridID);
        if (editableCell) {
            return this.cellID.rowID === editableCell.cellID.rowID &&
            this.cellID.columnID === editableCell.cellID.columnID;
        } else {
            return false;
        }
    }

     set inEditMode(value: boolean) {
        if (this.column.editable && value) {
            this.editValue = this.value;
            this.gridAPI.set_cell_inEditMode(this.gridID, this, value);
        } else {
            this.gridAPI.escape_editMode(this.gridID, this.cellID);
        }

        this.cdr.detectChanges();
    }

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('attr.role')
    public role = 'gridcell';

    @HostBinding('attr.aria-readonly')
    get readonly(): boolean {
        return !this.column.editable;
    }

    get cellInEditMode() {
        return this.inEditMode;
    }

    @HostBinding('attr.aria-describedby')
    get describedby(): string {
        return `${this.row.gridID}_${this.column.field}`;
    }

    @HostBinding('class')
    get styleClasses(): string {
        const defaultClasses = [
            'igx-grid__td igx-grid__td--fw',
            this.column.cellClasses
        ];

        const classList = {
            'igx_grid__cell--edit': this.inEditMode,
            'igx-grid__td--number': this.column.dataType === DataType.Number,
            'igx-grid__td--editing': this.inEditMode,
            'igx-grid__th--pinned': this.column.pinned,
            'igx-grid__th--pinned-last': this.isLastPinned,
            'igx-grid__td--selected': this.selected
        };

        Object.entries(classList).forEach(([klass, value]) => {
            if (value) {
                defaultClasses.push(klass);
            }
        });
        return defaultClasses.join(' ');
    }

    @HostBinding('style.min-width')
    @HostBinding('style.flex-basis')
    get width() {
        const hasVerticalScroll = !this.grid.verticalScrollContainer.dc.instance.notVirtual;
        const colWidth = this.column.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;

        if (colWidth && !isPercentageWidth) {
            let cellWidth = this.isLastUnpinned && hasVerticalScroll ?
                            parseInt(colWidth, 10) - 18 + '' : colWidth;

            if (typeof cellWidth !== 'string' || cellWidth.endsWith('px') === false) {
                cellWidth += 'px';
            }

            return cellWidth;
        } else {
            return colWidth;
        }
    }

    get editModeCSS() {
        return this.inEditMode;
    }

    get focused(): boolean {
        return this.isFocused;
    }

    set focused(val: boolean) {
        this.isFocused = val;
    }

    get isPinned() {
        return this.column.pinned;
    }

    get isLastPinned() {
        const pinnedCols = this.grid.pinnedColumns;
        return pinnedCols[pinnedCols.length - 1] === this.column;
    }

    get isLastUnpinned() {
        const unpinnedColumns = this.grid.unpinnedColumns;
        return unpinnedColumns[unpinnedColumns.length - 1] === this.column;
    }

    get selected() {
        return this.isSelected = this.isCellSelected();
    }

    @HostBinding('attr.aria-selected')
    set selected(val: boolean) {
        this.isSelected = val;
    }

    @ViewChild('defaultCell', { read: TemplateRef })
    protected defaultCellTemplate: TemplateRef<any>;

    @ViewChild('inlineEditor', { read: TemplateRef })
    protected inlineEditorTemplate: TemplateRef<any>;

    @ViewChild(IgxTextHighlightDirective, { read: IgxTextHighlightDirective })
    private highlight: IgxTextHighlightDirective;

    public editValue;
    protected isFocused = false;
    protected isSelected = false;
    protected chunkLoadedHor;
    protected chunkLoadedVer;
    private cellSelectionID: string;
    private prevCellSelectionID: string;
    private previousCellEditMode = false;
    private updateCell = true;

    constructor(
        public gridAPI: IgxGridAPIService,
        public selectionApi: IgxSelectionAPIService,
        public cdr: ChangeDetectorRef,
        private element: ElementRef) { }

    public _updateCellSelectionStatus() {
        this._clearCellSelection();
        this._saveCellSelection();
        if (this.column.editable && this.previousCellEditMode) {
            this.inEditMode = true;
        }
        this.cdr.detectChanges();
    }

    private _clearCellSelection() {
        const cell = this._getLastSelectedCell();
        if (cell) {
            cell.selected = false;
            cell.focused = false;
        }
        const editCell = this.gridAPI.get_cell_inEditMode(this.gridID);
        if (editCell && this.updateCell) {
            if (editCell.cell.column.field === this.gridAPI.get(this.gridID).primaryKey) {
                if (editCell.cellID.rowIndex === this.cellID.rowIndex && editCell.cellID.columnID === this.cellID.columnID) {
                    this.previousCellEditMode = false;
                } else {
                    this.previousCellEditMode = true;
                }
            } else {
                this.previousCellEditMode = true;
            }
            this.gridAPI.submit_value(this.gridID);
            this.cdr.markForCheck();
        } else {
            this.previousCellEditMode = false;
        }
        this._saveCellSelection(new Set());
    }

    private _saveCellSelection(newSelection?: Set<any>) {
        const sel = this.selectionApi.get_selection(this.cellSelectionID);
        if (sel && sel.size > 0) {
            this.selectionApi.set_selection(this.prevCellSelectionID, sel);
        }
        if (!newSelection) {
            newSelection = this.selectionApi.select_item(this.cellSelectionID, this.cellID);
        }
        this.selectionApi.set_selection(this.cellSelectionID, newSelection);
    }

    private _getLastSelectedCell() {
        const cellID = this.selectionApi.get_selection_first(this.cellSelectionID);
        if (cellID) {
            return this.gridAPI.get_cell_by_index(this.gridID, cellID.rowIndex, cellID.columnID);
        }
    }

    public isCellSelected() {
        const selectedCellID = this.selectionApi.get_selection_first(this.cellSelectionID);
        if (selectedCellID) {
            return this.cellID.rowID === selectedCellID.rowID &&
                this.cellID.columnID === selectedCellID.columnID;
        }
        return false;
    }

    public ngOnInit() {
        this.cellSelectionID = this.gridID + '-cell';
        this.prevCellSelectionID = this.gridID + '-prev-cell';
        this.chunkLoadedHor = this.row.virtDirRow.onChunkLoad.subscribe(
            () => {
                if (!this.selected) {
                    this.nativeElement.blur();
                }
                this.cdr.markForCheck();
            });
        this.chunkLoadedVer = this.grid.verticalScrollContainer.onChunkLoad.subscribe(
            () => {
                if (!this.selected) {
                    this.nativeElement.blur();
                }
                this.cdr.markForCheck();
            });
    }

    public update(val: any) {
        const rowSelector = this.cellID.rowID;
        const editableCell = this.gridAPI.get_cell_inEditMode(this.gridID);
        if (editableCell && editableCell.cellID.rowID === this.cellID.rowID
            && editableCell.cellID.columnID === this.cellID.columnID) {
            this.gridAPI.escape_editMode(this.gridID, editableCell.cellID);
        }
        this.gridAPI.update_cell(this.gridID, rowSelector, this.cellID.columnID, val);
        this.cdr.markForCheck();
        this.gridAPI.get(this.gridID).refreshSearch();
    }

    public ngOnDestroy() {
        if (this.chunkLoadedHor) {
            this.chunkLoadedHor.unsubscribe();
        }
        if (this.chunkLoadedVer) {
            this.chunkLoadedVer.unsubscribe();
        }
    }

    public ngAfterViewInit() {
        if (this.highlight && this.grid.lastSearchInfo.searchText) {
            this.highlight.highlight(this.grid.lastSearchInfo.searchText, this.grid.lastSearchInfo.caseSensitive);
            this.highlight.activateIfNecessary();
        }
    }

    focusCell() {
        this.updateCell = false;
        this.nativeElement.focus();
    }

    @HostListener('dblclick', ['$event'])
    public onDoubleClick(event) {
        if (this.column.editable) {
            this.focused = true;
            this.inEditMode = true;
        }

        this.grid.onDoubleClick.emit({
            cell: this,
            event
        });
    }

    @HostListener('click', ['$event'])
    public onClick(event) {
        this.grid.onCellClick.emit({
            cell: this,
            event
        });
    }

    @HostListener('contextmenu', ['$event'])
    public onContextMenu(event) {
        this.grid.onContextMenu.emit({
            cell: this,
            event
        });
    }

    @HostListener('focus', ['$event'])
    public onFocus(event) {
        this.isFocused = true;
        this.selected = true;
        const elementClassList = event.srcElement ? event.srcElement.classList : [];
        const classList = (event.composedPath && event.composedPath().length > 0) ?
            event.composedPath()[0].classList : elementClassList;

        if (this.gridAPI.get_cell_inEditMode(this.gridID) && classList.length > 0 && event.relatedTarget) {
            const targetEditMode = classList.toLocaleString().indexOf('igx-grid__td--editing') !== -1;
            if (targetEditMode) {
                if (classList.length > 0 && event.relatedTarget.classList.length > 0) {
                    if ((event.relatedTarget.classList.toLocaleString().indexOf('igx-checkbox__input') !== -1 ||
                    event.relatedTarget.classList.toLocaleString().indexOf('igx-calendar') !== -1)
                    && classList[0] === 'igx-grid__td') {
                        this.updateCell = false;
                    }
                }
            }
        }
        this._updateCellSelectionStatus();
        this.row.focused = true;
        this.grid.onSelection.emit({
            cell: this,
            event
        });
    }

    @HostListener('blur', ['$event'])
    public onBlur(event) {
        this.updateCell = true;
        this.isFocused = false;
        this.row.focused = false;
    }

    @HostListener('keydown.shift.tab', ['$event'])
    public onShiftTabKey(event) {
        if (this.isFirstCell) {
            this.selectionApi.set_selection(this.cellSelectionID, new Set());
            this.grid.markForCheck();
            return;
        } else {
            this.onKeydownArrowLeft(event);
        }
    }

    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event) {
        if (this.inEditMode) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        const rowIndex = this.rowIndex;
        const columnIndex = this.visibleColumnIndex - 1;

        if (columnIndex >= 0) {
            const target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, columnIndex);
            const targetUnpinnedIndex = this.unpinnedColumnIndex - 1;
            const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
            let bVirtSubscribe = true;

            if (!horVirtScroll && !target) {
                return;
            }

            if (target) {
                const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
                const targetEndLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;
                if (!target.isPinned && targetEndLeftOffset < 0) {
                    // Target cell is not pinned and is partialy visible (left part is cut). Scroll so it is fully visible and then focus.
                    horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex);
                } else {
                    // Target cell is fully visible. Just focus it.
                    target.nativeElement.focus();
                    bVirtSubscribe = false;
                }
            } else {
                if (!this.column.pinned) {
                    this.row.virtDirRow.scrollPrev();
                } else {
                    this.row.virtDirRow.scrollTo(this.grid.unpinnedColumns.filter(c => !c.columnGroup).length - 1);
                }
            }

            /**
             * Determine if we need to subscribe, otherwise if we use navigation and don't scroll, it will bind n-times times.
             * If we scroll the virtual container above, we need to subscribe to onChunkLoad.
             * We do this because it takes time to detect change in scrollLeft of an element
             */
            if (bVirtSubscribe) {
                this.grid._focusNextCell(this.rowIndex, columnIndex, 'left');
            }
        }
    }

    @HostListener('keydown.control.arrowleft')
    public onKeydownCtrlArrowLeft() {
        if (this.inEditMode) {
            return;
        }

        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex, this.row.cells.first.visibleColumnIndex);
        const columnIndex = target.visibleColumnIndex;
        if (target) {
            const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            const targetEndLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;

            if (!target.isPinned && targetEndLeftOffset < 0) {
                // Target cell is not pinned and is partialy visible (left part is cut). Scroll so it is fully visible and then focus.
                const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
                horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(target.unpinnedColumnIndex);

                this.grid._focusNextCell(this.rowIndex, columnIndex, 'left');
            } else {
                target.nativeElement.focus();
            }
        }
    }

    @HostListener('keydown.tab', ['$event'])
    public onTabKey(event) {
        if (this.isLastCell) {
            this.selectionApi.set_selection(this.cellSelectionID, new Set());
            this.grid.markForCheck();
            return;
        } else {
            this.onKeydownArrowRight(event);
        }
    }

    @HostListener('keydown.arrowright', ['$event'])
    public onKeydownArrowRight(event) {
        if (this.inEditMode) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        const visibleColumns = this.grid.visibleColumns.filter(c => !c.columnGroup);
        const rowIndex = this.rowIndex;
        const columnIndex = this.visibleColumnIndex + 1;

        if (columnIndex > -1 && columnIndex <= visibleColumns.length - 1) {
            const target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, columnIndex);
            const targetUnpinnedIndex = this.unpinnedColumnIndex + 1;
            const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
            const verticalVirtScroll = this.grid.verticalScrollContainer.getVerticalScroll();
            const verticalVirtScrollWidth = verticalVirtScroll &&
                verticalVirtScroll.offsetHeight < verticalVirtScroll.children[0].offsetHeight ?
                this.grid.verticalScrollContainer.getVerticalScroll().offsetWidth :
                0;

            // We take into consideration the vertical scroll width sinse it is not calculated in the container inside the row
            const virtContainerSize = parseInt(this.row.virtDirRow.igxForContainerSize, 10) - verticalVirtScrollWidth;
            let bVirtSubscribe = true;

            if (!horVirtScroll && !target) {
                return;
            }

            if (target) {
                const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
                const targetStartLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;
                const targetEndLeftOffset = target.nativeElement.offsetLeft +
                    parseInt(visibleColumns[columnIndex].width, 10) +
                    containerLeftOffset;
                if (!target.isPinned && targetEndLeftOffset > virtContainerSize) {
                    // Target cell is partially visible (right part of it is cut). Scroll to it so it is fully visible then focus.
                    const oldScrollLeft = horVirtScroll.scrollLeft;
                    const targetScrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex + 1) - virtContainerSize;
                    horVirtScroll.scrollLeft = targetScrollLeft;

                    if (oldScrollLeft === horVirtScroll.scrollLeft && oldScrollLeft !== targetScrollLeft) {
                        // There is nowhere to scroll more. Don't subscribe since there won't be triggered event.
                        target.nativeElement.focus();
                        bVirtSubscribe = false;
                    }
                } else if (!target.isPinned && targetStartLeftOffset < 0) {
                    // Target cell is partially visible (left part of it is cut). Happens when going from pinned to unpinned area.
                    horVirtScroll.scrollLeft = 0;
                } else {
                    // Target cell is fully visible. Just focus it.
                    target.nativeElement.focus();
                    bVirtSubscribe = false;
                }
            } else {
                horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex + 1) - virtContainerSize;
            }

            /**
             * Determine if we need to subscribe, otherwise if we use navigation and don't scroll, it will bind n-times.
             * If we scroll the virtual container above, we need to subscribe to onChunkLoad.
             * We do this because it takes time to detect change in scrollLeft of an element
             */
            if (bVirtSubscribe) {
                this.grid._focusNextCell(this.rowIndex, columnIndex, 'right');
            }
        }
    }

    @HostListener('keydown.control.arrowright')
    public onKeydownCtrlArrowRight() {
        if (this.inEditMode) {
            return;
        }

        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex, this.row.cells.last.visibleColumnIndex);
        const columnIndex = target.visibleColumnIndex;
        if (target) {
            const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            const targetEndLeftOffset = target.nativeElement.offsetLeft + parseInt(target.column.width, 10) + containerLeftOffset;
            const verticalVirtScroll = this.grid.verticalScrollContainer.getVerticalScroll();
            const verticalVirtScrollWidth = verticalVirtScroll &&
                verticalVirtScroll.offsetHeight < verticalVirtScroll.children[0].offsetHeight ?
                this.grid.verticalScrollContainer.getVerticalScroll().offsetWidth :
                0;

            // We take into consideration the vertical scroll width sinse it is not calculated in the container inside the row
            const virtContainerSize = parseInt(this.row.virtDirRow.igxForContainerSize, 10) - verticalVirtScrollWidth;
            if (targetEndLeftOffset > virtContainerSize) {
                // Target cell is partially visible (right part of it is cut). Scroll to it so it is fully visible then focus.
                const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
                const oldScrollLeft = horVirtScroll.scrollLeft;
                const targetScrollLeft = this.row.virtDirRow.getColumnScrollLeft(target.unpinnedColumnIndex + 1) - virtContainerSize;
                horVirtScroll.scrollLeft = targetScrollLeft;

                if (oldScrollLeft === horVirtScroll.scrollLeft && oldScrollLeft !== targetScrollLeft) {
                    // There is nowhere to scroll more. Don't subscribe since there won't be triggered event.
                    target.nativeElement.focus();
                } else {
                    this.grid._focusNextCell(this.rowIndex, columnIndex, 'right');
                }
            } else {
                target.nativeElement.focus();
            }
        }
    }

    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event) {
        if (this.inEditMode || this.rowIndex === 0) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        const lastCell = this._getLastSelectedCell();
        const rowIndex = lastCell ? lastCell.rowIndex - 1 : this.grid.rowList.last.index;
        this._clearCellSelection();
        this.grid.navigateUp(rowIndex, this.visibleColumnIndex);
    }

    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrowDown(event) {
        const virtDir = this.grid.verticalScrollContainer;
        const count = virtDir.totalItemCount || virtDir.igxForOf.length;
        if (this.inEditMode || this.rowIndex + 1 === count) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        const lastCell = this._getLastSelectedCell();
        const rowIndex = lastCell ? lastCell.rowIndex + 1 : this.grid.rowList.first.index;
        this._clearCellSelection();
        this.grid.navigateDown(rowIndex, this.visibleColumnIndex);
    }

    @HostListener('keydown.enter')
    @HostListener('keydown.f2')
    public onKeydownEnterEditMode() {
        if (this.column.editable) {
            if (this.inEditMode) {
                this.gridAPI.submit_value(this.gridID);
            } else {
                this.focused = true;
                this.inEditMode = true;
            }
            this.nativeElement.focus();
        }
    }

    @HostListener('keydown.escape')
    public onKeydownExitEditMode() {
        this.inEditMode = false;
        this.nativeElement.focus();
    }

    public highlightText(text: string, caseSensitive?: boolean): number {
        return this.highlight && this.column.searchable ? this.highlight.highlight(text, caseSensitive) : 0;
    }

    public clearHighlight() {
        if (this.highlight && this.column.searchable) {
            this.highlight.clearHighlight();
        }
    }
}
