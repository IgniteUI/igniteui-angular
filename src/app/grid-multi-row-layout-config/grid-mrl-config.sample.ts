import { Component, ViewChild, ElementRef, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { NgFor, NgStyle, NgIf } from '@angular/common';

import { SAMPLE_DATA } from '../shared/sample-data';
import { GridSelectionMode, IDropBaseEventArgs, IDropDroppedEventArgs, IgxButtonDirective, IgxColumnComponent, IgxColumnLayoutComponent, IgxDialogComponent, IgxDragDirective, IgxDropDirective, IgxGridComponent } from 'igniteui-angular';

interface ColumnConfig {
    key: string;
    width: string;
    colStart: number;
    rowStart: number;
    colSpan: number;
    rowSpan: number;
    selected: boolean;
    hovered: boolean;
}

@Component({
    selector: 'app-grid-mrl-config-sample',
    templateUrl: 'grid-mrl-config.sample.html',
    styleUrls: ['grid-mrl-config.sample.scss'],
    imports: [NgFor, IgxDragDirective, NgStyle, IgxDropDirective, NgIf, IgxButtonDirective, IgxGridComponent, IgxColumnLayoutComponent, IgxColumnComponent, IgxDialogComponent]
})
export class GridMRLConfigSampleComponent {

    @ViewChild('jsonDialog', { read: IgxDialogComponent, static: true })
    public jsonDialog: IgxDialogComponent;

    @ViewChild('textArea', { read: ElementRef, static: true })
    public textArea: ElementRef;

    @ViewChild('grid', { read: IgxGridComponent })
    public grid: IgxGridComponent;

    @ViewChildren('gridCell', { read: ElementRef })
    public gridCells: QueryList<ElementRef>;

    @ViewChild('resizeIndicator', { read: ElementRef, static: true })
    public resizeIndicator: ElementRef;

    public rowsCount = 3;
    public colsCount = 6;
    public rowsHeight = '32px';
    public colsWidth = '136px';
    public collection: ColumnConfig[][] = [];
    public gridCollection = [];
    public renderGrid = false;
    public jsonCollection = '';
    public cellSelected;

    public dragStarted = false;
    public dragStartX;
    public dragStartY;

    public curResizedCell;
    public colSpanIncrease = 0;
    public rowSpanIncrease = 0;
    public resizeVisible = false;
    public resizeTop;
    public resizeLeft;
    public resizeRight;
    public resizeInitialWidth = 0;
    public resizeInitialHeight = 0;
    public resizeWidth = 0;
    public resizeHeight = 0;
    public selectionMode;

    public columnsList: {key: string; field: string; hide?: boolean} [] = [
        { key: 'ContactName', field: 'Contact name'},
        { key: 'ContactTitle', field: 'Contact title'},
        { key: 'CompanyName', field: 'Company name'},
        { key: 'Country', field: 'Country'},
        { key: 'Phone', field: 'Phone'},
        { key: 'City', field: 'City'},
        { key: 'Address', field: 'Address'}
    ];
    public columnsConfiguration;

    public data = SAMPLE_DATA;

    constructor(public cdr: ChangeDetectorRef) {
        this.updateCollectionSize();
        this.selectionMode = GridSelectionMode.none;
    }

    public get layoutRowStyle() {
        let style = '';
        this.collection.forEach(() => {
            if (this.rowsHeight.indexOf('px') !== -1 || this.rowsHeight.indexOf('%') !== -1 || isNaN(parseInt(this.rowsHeight, 10))) {
                style += ' ' + this.rowsHeight;
            } else {
                style += ' ' + parseInt(this.rowsHeight, 10) + 'px';
            }
        });
        return style;
    }

    public get layoutColsStyle() {
        let style = '';
        this.collection[0].forEach((col) => {
            for (let i = 0; i < col.colSpan; i++) {
                if (this.colsWidth.indexOf('px') !== -1 || this.colsWidth.indexOf('%') !== -1 || isNaN(parseInt(this.colsWidth, 10))) {
                    style += ' ' + this.colsWidth;
                } else {
                    style += ' ' + parseInt(this.colsWidth, 10) + 'px';
                }
            }
        });
        return style;
    }

    public updateCollectionSize() {
        const newCollection = [];
        for (let rowIndex = 0; rowIndex < this.rowsCount; rowIndex++) {
            const row = [];
            for (let colIndex = 0; colIndex < this.colsCount; colIndex++) {
                if (this.collection[rowIndex] && this.collection[rowIndex][colIndex]) {
                    row.push(this.collection[rowIndex][colIndex]);
                } else {
                    row.push({
                        key: '',
                        width: '',
                        rowStart: rowIndex + 1,
                        colStart: colIndex + 1,
                        colSpan: 1,
                        rowSpan: 1
                    });
                }
            }

            newCollection.push(row);
        }
        this.collection = newCollection;
    }

    public updateCollectionLayout() {
        for (let rowIndex = 0; rowIndex < this.collection.length; rowIndex++) {
            let column = this.collection[rowIndex][0];
            for (let colIndex = 1; colIndex < this.collection[rowIndex].length; colIndex++) {
                if (this.collection[rowIndex][colIndex].key === column.key && this.collection[rowIndex][colIndex].key !== '') {
                    column.colSpan += this.collection[rowIndex][colIndex].colSpan;
                    this.collection[rowIndex].splice(colIndex, 1);
                    colIndex--;
                } else {
                    column = this.collection[rowIndex][colIndex];
                }
            }
        }
    }

    public rowCountChanged(event) {
        this.rowsCount = parseInt(event.target.value, 10);
        this.updateCollectionSize();
    }

    public rowHeightChanged(event) {
        this.rowsHeight = event.target.value;
        this.cdr.detectChanges();
    }

    public colCountChanged(event) {
        this.colsCount = parseInt(event.target.value, 10);
        this.updateCollectionSize();
    }

    public colWidthChanged(event) {
        this.colsWidth = event.target.value;
    }

    public onColEnter(event: IDropBaseEventArgs, rowIndex, colIndex) {
        this.collection[rowIndex][colIndex].hovered = true;
    }

    public onColLeave(event: IDropBaseEventArgs, rowIndex, colIndex) {
        this.collection[rowIndex][colIndex].hovered = false;
    }

    public onColDropped(event: IDropDroppedEventArgs, rowIndex, colIndex) {
        event.cancel = true;
        this.collection[rowIndex][colIndex].key = event.drag.data.key;
        this.updateCollectionLayout();
    }

    public flattenCollection() {
        const result = [];
        this.collection.forEach((row) => {
            row.forEach((col) => {
                const newCol = { ...col };
                delete newCol.width;
                delete newCol.hovered;
                delete newCol.selected;

                result.push(newCol);
            });
        });

        return result;
    }

    public rerenderGrid() {
        this.renderGrid = false;

        // Flatten the current collection for the grid.
        this.gridCollection = this.flattenCollection();

        setTimeout(() => {
            this.renderGrid = true;
        }, 200);
    }

    public renderJson() {
        const flatCollection = this.flattenCollection();
        this.jsonCollection = JSON.stringify(flatCollection);
        this.jsonDialog.open();
    }

    public copyToClipboard() {
        this.textArea.nativeElement.select();
        document.execCommand('copy');
    }

    public clickCell(cellRef, rowIndex, colIndex) {
        this.cellSelected = this.collection[rowIndex][colIndex];
        this.cellSelected.selected = true;

        this.resizeTop = cellRef.offsetTop;
        this.resizeLeft = cellRef.offsetLeft;
        this.resizeHeight = cellRef.offsetHeight;
        this.resizeWidth = cellRef.offsetWidth;
        this.resizeInitialHeight = this.resizeHeight;
        this.resizeInitialWidth = this.resizeWidth;
        this.resizeVisible = true;
    }

    public onBlur(event, rowIndex, colIndex) {
        this.cellSelected = null;
        this.collection[rowIndex][colIndex].selected = false;
        this.resizeVisible = false;
    }

    public pointerDownResize(event, rowIndex, colIndex) {
        this.dragStarted = true;
        this.dragStartX = event.pageX;
        this.dragStartY = event.pageY;
        this.curResizedCell = this.collection[rowIndex][colIndex];

        event.target.setPointerCapture(event.pointerId);
    }

    public pointerMoveResizeLeft(event, cellRef, rowIndex, colIndex) {
        if (this.dragStarted) {
            const curDistance = this.dragStartX - event.pageX;
            const minIncrease = -this.curResizedCell.colSpan;
            const maxIncrease = colIndex;
            this.colSpanIncrease = Math.min(Math.round(curDistance / 136), maxIncrease);
            this.colSpanIncrease = Math.max(this.colSpanIncrease, minIncrease);
            this.resizeWidth = this.resizeInitialWidth + this.colSpanIncrease * 136;
            this.resizeLeft = cellRef.offsetLeft - this.colSpanIncrease * 136;
        }
    }

    public pointerMoveResizeRight(event, cellRef, rowIndex, colIndex) {
        if (this.dragStarted) {
            const curDistance = event.pageX - this.dragStartX;
            const maxIncrease = this.colsCount - (colIndex + this.curResizedCell.colSpan);
            this.colSpanIncrease = Math.min(Math.round(curDistance / 136), maxIncrease);
            this.resizeWidth = this.resizeInitialWidth + this.colSpanIncrease * 136;
        }
    }

    public pointerUpResizeRight(event, cellRef, rowIndex, colIndex) {
        this.dragStarted = false;
        this.resizeVisible = false;

        if (this.colSpanIncrease > 0) {
            for (let i = 0; i < this.colSpanIncrease; i++) {
                const nextCell = this.collection[rowIndex][colIndex + 1];
                if (this.curResizedCell.colStart + this.curResizedCell.colSpan + i !== nextCell.colStart || nextCell.rowSpan > 1) {
                    this.colSpanIncrease = i;
                    break;
                }
                if (this.collection[rowIndex][colIndex + 1].colSpan > 1) {
                    this.collection[rowIndex][colIndex + 1].colStart++;
                    this.collection[rowIndex][colIndex + 1].colSpan--;
                } else {
                    this.collection[rowIndex].splice(colIndex + 1, 1);
                }
            }

            if (this.curResizedCell.rowSpan > 1) {
                for (let row = this.curResizedCell.rowStart; row < this.curResizedCell.rowStart - 1 + this.curResizedCell.rowSpan; row++) {
                    for (let spanIndex = 0; spanIndex < this.colSpanIncrease; spanIndex++) {
                        let borderCellIndex = 0;
                        const borderCell = this.collection[row].find((cell, index) => {
                            borderCellIndex = index;
                            return cell.colStart === this.curResizedCell.colStart + this.curResizedCell.colSpan + spanIndex;
                        });
                        if (borderCell) {
                            if (borderCell.colSpan > 1) {
                                borderCell.colStart++;
                                borderCell.colSpan--;
                            } else {
                                this.collection[row].splice(borderCellIndex, 1);
                            }
                        }
                    }
                }
            }

            this.curResizedCell.colSpan += this.colSpanIncrease;
        } else if (this.colSpanIncrease < 0) {
            this.colSpanIncrease = -1 * Math.min(-1 * this.colSpanIncrease, this.curResizedCell.colSpan);
            const rowEndIndex = this.curResizedCell.rowStart - 1 + this.curResizedCell.rowSpan;

            for (let rowUpdateIndex = rowIndex; rowUpdateIndex < rowEndIndex; rowUpdateIndex++) {
                const firstHalf = [];
                for (const layout of this.collection[rowUpdateIndex]) {
                    if (layout.colStart < this.curResizedCell.colStart + this.curResizedCell.colSpan) {
                        firstHalf.push(layout);
                    } else {
                        break;
                    }
                }

                const secondHalf = this.collection[rowUpdateIndex].slice(firstHalf.length);
                for (let i = 0; i < -1 * this.colSpanIncrease; i++) {
                    secondHalf.unshift({
                        key: '',
                        width: '',
                        rowStart: rowUpdateIndex + 1,
                        colStart: this.curResizedCell.colStart + this.curResizedCell.colSpan - i - 1,
                        colSpan: 1,
                        rowSpan: 1,
                        selected: false,
                        hovered: false
                    });
                }

                this.collection[rowUpdateIndex] = firstHalf.concat(secondHalf);

            }

            this.curResizedCell.colSpan -= -1 * this.colSpanIncrease;
            if (this.curResizedCell.colSpan === 0) {
                this.collection[rowIndex].splice(colIndex + this.curResizedCell.colSpan, 1);
            }
        }
        this.colSpanIncrease = 0;
    }

    public pointerUpResizeLeft(event, cellRef, targetRowIndex, targetColIndex) {
        this.dragStarted = false;
        this.resizeVisible = false;

        const curIndexFromEnd = this.collection[targetRowIndex].length - targetColIndex - 1;
        if (this.colSpanIncrease > 0) {
            // Handle first row
            for (let i = 0; i < this.colSpanIncrease; i++) {
                const curIndexFromStart = this.collection[targetRowIndex].length - curIndexFromEnd - 1;
                const prevCell = this.collection[targetRowIndex][curIndexFromStart - 1];
                if (prevCell.colStart + prevCell.colSpan + i !== this.collection[targetRowIndex][curIndexFromStart].colStart ||
                    prevCell.rowSpan > 1) {
                    this.colSpanIncrease = i;
                    break;
                }
                if (prevCell.colSpan > 1) {
                    prevCell.colSpan--;
                } else {
                    this.collection[targetRowIndex].splice(curIndexFromStart - 1, 1);
                }
            }

            // Handle the rest if it spans more than one row
            if (this.curResizedCell.rowSpan > 1) {
                for (let rowIndex = this.curResizedCell.rowStart;
                        rowIndex < this.curResizedCell.rowStart - 1 + this.curResizedCell.rowSpan;
                        rowIndex++) {
                    let leftSibling;
                    let leftSiblingIndex = 0;
                    for (let m = 0; m < this.collection[rowIndex].length; m++) {
                        if (this.collection[rowIndex][m].colStart >= this.curResizedCell.colStart + this.curResizedCell.colSpan) {
                            break;
                        }
                        leftSiblingIndex = m;
                        leftSibling = this.collection[rowIndex][m];
                    }

                    for (let spanIndex = 0; spanIndex < this.colSpanIncrease; spanIndex++) {
                        if (leftSibling.colSpan > 1) {
                            leftSibling.colSpan--;
                        } else {
                            this.collection[rowIndex].splice(leftSiblingIndex - spanIndex, 1);
                        }
                        leftSibling = this.collection[rowIndex][leftSiblingIndex - spanIndex - 1];
                    }
                }
            }

            this.curResizedCell.colStart -= this.colSpanIncrease;
            this.curResizedCell.colSpan += this.colSpanIncrease;
        } else if (this.colSpanIncrease < 0) {
            this.colSpanIncrease = -1 * Math.min(-1 * this.colSpanIncrease, this.curResizedCell.colSpan);
            const rowEndIndex = this.curResizedCell.rowStart - 1 + this.curResizedCell.rowSpan;
            for (let rowUpdateIndex = targetRowIndex; rowUpdateIndex < rowEndIndex; rowUpdateIndex++) {
                const firstHalf = [];
                for (const layout of this.collection[rowUpdateIndex]) {
                    if (layout.colStart < this.curResizedCell.colStart) {
                        firstHalf.push(layout);
                    } else {
                        break;
                    }
                }

                const secondHalf = this.collection[rowUpdateIndex].slice(firstHalf.length);
                for (let i = 0; i < -1 * this.colSpanIncrease; i++) {
                    firstHalf.push({
                        key: '',
                        width: '',
                        rowStart: rowUpdateIndex + 1,
                        colStart: this.curResizedCell.colStart + i,
                        colSpan: 1,
                        rowSpan: 1,
                        selected: false
                    });
                }

                if (rowUpdateIndex === targetRowIndex && this.curResizedCell.colSpan === 0) {
                    secondHalf.shift();
                }
                this.collection[rowUpdateIndex] = firstHalf.concat(secondHalf);
            }

            this.curResizedCell.colSpan -= -1 * this.colSpanIncrease;
            this.curResizedCell.colStart += -1 * this.colSpanIncrease;
        }
        this.colSpanIncrease = 0;
    }

    public pointerMoveResizeBottom(event, rowIndex) {
        if (this.dragStarted) {
            const curDistance = event.pageY - this.dragStartY;
            const maxIncrease = this.rowsCount - rowIndex - this.curResizedCell.rowSpan;
            this.rowSpanIncrease = Math.min(Math.round(curDistance / 32), maxIncrease);
            this.resizeHeight = this.resizeInitialHeight + this.rowSpanIncrease * 32;
        }
    }

    public pointerUpResizeBottom(rowIndex) {
        this.dragStarted = false;
        this.resizeVisible = false;

        if (this.rowSpanIncrease > 0) {
            for (let increaseIndex = 1; increaseIndex <= this.rowSpanIncrease; increaseIndex++) {
                // Cycle how many rows should the size of the cell increase, and edit them accordingly.
                const curRowIndex = rowIndex + (this.curResizedCell.rowSpan - 1) + increaseIndex;

                for (let j = this.collection[curRowIndex].length - 1; j >= 0 ; j--) {
                    // Cycle all cells backwards because when cell spans in the way it should be cut and cells on the right should be added.
                    const curCell = this.collection[curRowIndex][j];
                    const curCellStart = curCell.colStart;
                    let curCellEnd = curCell.colStart + curCell.colSpan;
                    const resizedCellStart = this.curResizedCell.colStart ;
                    const resizedCellEnd = this.curResizedCell.colStart + this.curResizedCell.colSpan;

                    if (curCellStart < resizedCellEnd && curCellEnd > resizedCellEnd && curCell.rowSpan === 1) {
                        // If current cell spans the way of the resized down cell and the end is spanning more to the right,
                        // cut the current cell and add the needed cells after the resized cell ends.
                        const numNewCells = curCellEnd - resizedCellEnd;
                        for (let i = 0; i < numNewCells; i++) {
                            curCell.colSpan--;
                            curCellEnd--;
                            this.collection[curRowIndex].splice(j + 1, 0, {
                                key: '',
                                width: '',
                                rowStart: curRowIndex + 1,
                                colStart: curCellEnd,
                                colSpan: 1,
                                rowSpan: 1,
                                selected: false,
                                hovered: false
                            });
                        }
                    } else if (curCellStart < resizedCellEnd && curCellEnd > resizedCellEnd && curCell.rowSpan > 1) {
                        // We only need to check the rowSpan because we start from top to bottom and top cells have the rowSpan
                        this.curResizedCell.rowSpan += increaseIndex - 1;
                        this.rowSpanIncrease = 0;
                        return;
                    }

                    if (curCellStart <= resizedCellEnd && curCellEnd >= resizedCellStart && curCellEnd <= resizedCellEnd) {
                        // If current cell is in the way of resized down cell decrease the size of the current cell.
                        curCell.colSpan -= (curCellEnd) - this.curResizedCell.colStart;
                    }

                    if (curCell.colSpan <= 0) {
                        // If the current cell span is <= 0 it should be removed.
                        this.collection[curRowIndex].splice(j, 1);
                    }
                }
            }

            this.curResizedCell.rowSpan += this.rowSpanIncrease;
        } else if (this.rowSpanIncrease < 0) {
            this.rowSpanIncrease = -1 * Math.min(-1 * this.rowSpanIncrease, this.curResizedCell.rowSpan);
            const startIndex = this.curResizedCell.rowStart + this.curResizedCell.rowSpan - 2;
            for (let i = startIndex; i > startIndex + this.rowSpanIncrease; i--) {
                let startCellIndex = 0;

                // Get first cell after current resized multirow cell
                for (let j = 0; j < this.collection[i].length; j++) {
                    if (this.collection[i][j].colStart > this.curResizedCell.colStart) {
                        startCellIndex = j - 1;
                        break;
                    }
                }

                for (let j = 0; j < this.curResizedCell.colSpan; j++) {
                    this.collection[i].splice(startCellIndex + 1 + j, 0, {
                        key: '',
                        width: '',
                        rowStart: i + 1,
                        colStart: this.curResizedCell.colStart + j,
                        colSpan: 1,
                        rowSpan: 1,
                        selected: false,
                        hovered: false
                    });
                }
            }

            this.curResizedCell.rowSpan += this.rowSpanIncrease;
            if (this.curResizedCell.rowSpan === 0) {
                this.collection[rowIndex].splice(this.curResizedCell.colStart - 1 + this.curResizedCell.colSpan, 1);
            }
        }

        this.rowSpanIncrease = 0;
    }

    public onCellKey(event, rowIndex) {
        if (event.key === 'Delete') {
            for (let i = rowIndex; i < rowIndex + this.cellSelected.rowSpan; i++) {
                const rowFirstHalf = [];
                for (const layout of this.collection[i]) {
                    if (layout.colStart < this.cellSelected.colStart) {
                        rowFirstHalf.push(layout);
                    } else {
                        break;
                    }
                }

                const rowSecondHalf = this.collection[i].slice(rowFirstHalf.length + (i === rowIndex ? 1 : 0));
                for (let j = 0; j < this.cellSelected.colSpan; j++) {
                    rowFirstHalf.push({
                        key: '',
                        width: '',
                        rowStart: i + 1,
                        colStart: this.cellSelected.colStart + j,
                        colSpan: 1,
                        rowSpan: 1,
                        selected: false
                    });
                }
                this.collection[i] = rowFirstHalf.concat(rowSecondHalf);
            }

            this.cellSelected = null;
            this.resizeVisible = false;
        }
    }
}
