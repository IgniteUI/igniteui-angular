import { Injectable } from '@angular/core';
import { IgxGridBaseDirective } from './grid-base.directive';
import { first } from 'rxjs/operators';
import { IgxColumnComponent } from './columns/column.component';
import { IgxGridNavigationService } from './grid-navigation.service';

/** @hidden */
@Injectable()
export class IgxGridMRLNavigationService extends IgxGridNavigationService {
    public grid: IgxGridBaseDirective;

    protected getNextPosition(rowIndex, colIndex, key, shift, ctrl, event) {
        switch (key) {
            case 'tab':
                this.handleEditing(shift, event);
                break;
            case 'end':
                rowIndex = ctrl ? this.findLastDataRowIndex() : this.activeNode.row;
                colIndex = ctrl ? this.lastColumnIndex : this.lastIndexPerRow;
                break;
            case 'home':
                rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row;
                colIndex = 0;
                break;
            case 'arrowleft':
            case 'left':
                const ccc = this.getLeftCell();
                colIndex  = ctrl ? 0 : ccc.column;
                break;
            case 'arrowright':
            case 'right':
                const r = this.getRightCell();
                colIndex = ctrl ? this.lastIndexPerRow : r.column;
                break;
            case 'arrowup':
            case 'up':
                const bbb = this.getPreviousRowIndex();
                colIndex =  ctrl ? this.activeNode.column : bbb.column;
                rowIndex =  ctrl ? this.findFirstDataRowIndex() : bbb.row;
                break;
            case 'arrowdown':
            case 'down':
                const rowfjfikfm =  this.getNextRowIndex();
                colIndex = ctrl ? this.activeNode.column : rowfjfikfm.column;
                rowIndex = ctrl ? this.findLastDataRowIndex() : rowfjfikfm.row;
                break;
            case 'enter':
            case 'f2':
                const cell = this.grid.getCellByColumnVisibleIndex(this.activeNode.row, this.activeNode.column);
                this.grid.crudService.enterEditMode(cell);
                break;
            case 'escape':
            case 'esc':
                this.grid.crudService.exitEditMode();
                break;
            case ' ':
            case 'spacebar':
            case 'space':
                if (this.grid.isRowSelectable) {
                    const rowObj = this.grid.getRowByIndex(this.activeNode.row);
                    rowObj && rowObj.selected ? this.grid.selectionService.deselectRow(rowObj.rowID, event) :
                    this.grid.selectionService.selectRowById(rowObj.rowID, false, event);
                }
                break;
            default:
                return;
        }
        return {rowIndex, colIndex};
    }

    public navigateInBody(rowIndex, visibleColIndex, cb: Function = null): void {
        if (!this.isValidPositionMRL(rowIndex, visibleColIndex)) { return; }
        this.grid.navigateTo(this.activeNode.row = rowIndex, this.activeNode.column = visibleColIndex, cb);
    }

    private isValidPositionMRL(rowIndex: number, colIndex: number) {
        if (rowIndex < 0 || colIndex < 0 || this.grid.dataView.length - 1 < rowIndex ||
            Math.max(...this.grid.visibleColumns.map(col => col.visibleIndex)) < colIndex) {
            return false;
        }
        if (this.activeNode.column !== colIndex && !this.isDataRow(rowIndex, true)) {
            return false;
        }
        return true;
    }

    public shouldPerformVerticalScroll(targetRowIndex: number) {
        if (!super.shouldPerformVerticalScroll(targetRowIndex)) { return false; }

        const targetRow = super.getRowElementByIndex(targetRowIndex);
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const scrollPos = this.getVerticalScrollPositions(targetRowIndex, this.activeNode.column);
        return (!targetRow || targetRow.offsetTop + scrollPos.topOffset < Math.abs(this.containerTopOffset)
           || containerHeight && containerHeight < scrollPos.rowBottom - this.scrollTop);
    }

   public performVerticalScrollToCell(rowIndex: number, cb?: () => void) {
        if (!super.isDataRow(rowIndex)) {
            return super.performVerticalScrollToCell(rowIndex, cb);
        }
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const scrollPos = this.getVerticalScrollPositions(rowIndex, this.activeNode.column);
        const targetRow = super.getRowElementByIndex(rowIndex);
        const isPrevious = (this.scrollTop > scrollPos.rowTop) && (!targetRow ||
            targetRow.offsetTop + scrollPos.topOffset < Math.abs(this.containerTopOffset));
        if (isPrevious) {
            scrollPos.topOffset === 0 ? this.grid.verticalScrollContainer.scrollTo(rowIndex) :
                this.grid.verticalScrollContainer.scrollPosition = scrollPos.rowTop;
        } else {
            this.grid.verticalScrollContainer.addScrollTop(Math.abs(scrollPos.rowBottom - this.scrollTop - containerHeight));
        }
        this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first()).subscribe(() => {
                if (cb) { cb(); }
            });
    }

    public isColumnFullyVisible(visibleColIndex: number): boolean {
        const targetCol = this.grid.getColumnByVisibleIndex(visibleColIndex);
        if (this.isParentColumnFullyVisible(targetCol.parent)) { return true; }

        const scrollPos = this.getChildColumnScrollPositions(visibleColIndex);
        return this.displayContainerWidth >= scrollPos.rightScroll - this.displayContainerScrollLeft &&
            this.displayContainerScrollLeft <= scrollPos.leftScroll;
    }

    private isParentColumnFullyVisible(parent: IgxColumnComponent): boolean {
        const horizontalScroll = this.forOfDir().getScroll();
        if (!horizontalScroll.clientWidth || parent.pinned) { return true; }

        const index = this.forOfDir().igxForOf.indexOf(parent);
        return this.displayContainerWidth >= this.forOfDir().getColumnScrollLeft(index + 1) - this.displayContainerScrollLeft &&
            this.displayContainerScrollLeft <= this.forOfDir().getColumnScrollLeft(index);
    }

    private getChildColumnScrollPositions(visibleColIndex: number) {
        const targetCol: IgxColumnComponent = this.grid.getColumnByVisibleIndex(visibleColIndex);
        const parent = targetCol.parent;
        const parentVIndex = this.forOfDir().igxForOf.indexOf(parent);
        let leftScroll =  this.forOfDir().getColumnScrollLeft(parentVIndex);
        let rightScroll = this.forOfDir().getColumnScrollLeft(parentVIndex + 1);
        parent.children.forEach((c) => {
            if (c.rowStart >= targetCol.rowStart && c.visibleIndex < targetCol.visibleIndex) {
                leftScroll += parseInt(c.width, 10);
            }
            if (c.rowStart <= targetCol.rowStart && c.visibleIndex > targetCol.visibleIndex) {
                rightScroll -= parseInt(c.width, 10);
            }
        });
        return {leftScroll, rightScroll: rightScroll};
    }

    public getVerticalScrollPositions(rowIndex: number, visibleIndex: number) {
        const targetCol = this.grid.getColumnByVisibleIndex(visibleIndex);
        const rowSpan = targetCol.rowEnd && targetCol.rowEnd - targetCol.rowStart ? targetCol.rowEnd - targetCol.rowStart : 1;
        const rows = new Set(targetCol.parent.children.map(c => c.rowStart).filter(index => index < targetCol.rowStart));
        const topOffset = rows.size * this.grid.defaultRowHeight;
        const rowTop = this.grid.verticalScrollContainer.sizesCache[rowIndex] + topOffset;
        return { topOffset, rowTop, rowBottom: rowTop + (this.grid.defaultRowHeight * rowSpan) };
    }

    public performHorizontalScrollToCell(visibleColumnIndex: number, cb?: () => void) {
        if (!this.shouldPerformHorizontalScroll(visibleColumnIndex)) { return; }
        this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                if (cb) { cb(); }
            });
        const scrollPos = this.getChildColumnScrollPositions(visibleColumnIndex);
        const nextScroll = !(this.displayContainerScrollLeft <= scrollPos.leftScroll) &&
        this.displayContainerWidth >= scrollPos.rightScroll - this.displayContainerScrollLeft ?
        scrollPos.leftScroll : scrollPos.rightScroll - this.displayContainerWidth;
        this.forOfDir().getScroll().scrollLeft = nextScroll;
    }

    getRightCell() {
        const parent = this.grid.getColumnByVisibleIndex(this.activeNode.column).parent;
        let column = parent.children.find(col => col.visibleIndex > this.activeNode.column &&
            col.colStart > this.activeNode.layout.colStart && col.rowStart <= this.activeNode.layout.rowStart);
        if (!column) {
            const nextLayoutCol = this.grid.columnList.find(cols => cols.columnLayout && cols.visibleIndex === parent.visibleIndex + 1);
            column = nextLayoutCol.children.find(child => this.rowEnd(child) > this.activeNode.layout.rowStart && child.colStart === 1);
        }
        this.activeNode.layout.colStart = column.colStart;
        return {row: this.activeNode.row, column: column.visibleIndex};
    }

    private rowEnd(column) {
        return column.rowEnd && column.rowEnd - column.rowStart ? column.rowStart + column.rowEnd - column.rowStart : column.rowStart + 1;
    }

    getLeftCell() {
        const parent = this.grid.getColumnByVisibleIndex(this.activeNode.column).parent;
        let column = parent.children.find(col => col.visibleIndex < this.activeNode.column &&
            col.rowStart <= this.activeNode.layout.rowStart && this.rowEnd(col) > this.activeNode.layout.rowStart);
        if (!column || this.activeNode.layout.colStart === 1) {
            const prevLayoutCol = this.grid.columnList.find(cols => cols.columnLayout && cols.visibleIndex === parent.visibleIndex - 1);
            column = prevLayoutCol.children.toArray().reverse().find(child => child.rowStart <= this.activeNode.layout.rowStart);
        }
        this.activeNode.layout.colStart = column.colStart;
        return {row: this.activeNode.row, column: column.visibleIndex};
    }

    getNextRowIndex() {
        const children = this.grid.getColumnByVisibleIndex(this.activeNode.column).parent.children;
        const layout = this.activeNode.layout;
        const rowSpan = layout.rowEnd && layout.rowEnd - layout.rowStart ? layout.rowEnd - layout.rowStart : 1;

        const col = children.filter(c => c.rowStart === this.activeNode.layout.rowStart + rowSpan)
            .reverse().find(c => c.colStart <= this.activeNode.layout.colStart);
        if (col) {
            this.activeNode.layout.rowStart = col.rowStart;
            this.activeNode.layout.rowEnd = col.rowEnd;
            return {row: this.activeNode.row, column: col.visibleIndex};
        } else {
            const columns = children.filter((colu: IgxColumnComponent) => colu.rowStart === 1);
            const c = columns.find(co => co.colStart === this.activeNode.layout.colStart) ||
                columns.find(co => co.colStart <= this.activeNode.layout.colStart);
            this.activeNode.layout.rowStart = c.rowStart;
            this.activeNode.layout.rowEnd = c.rowEnd;
            return {row: this.activeNode.row + 1, column: c.visibleIndex};
        }
    }

    getPreviousRowIndex() {
        const children = this.grid.getColumnByVisibleIndex(this.activeNode.column).parent.children;
        const prev = this.activeNode.layout.rowStart === 1;
        const rowStarts = children.map(c => c.rowStart).reverse();
        const rowStart = prev ? Math.max(...rowStarts) : rowStarts.find(r => r < this.activeNode.layout.rowStart);
        const columns = children.filter((colu: IgxColumnComponent) => colu.rowStart === rowStart);
        const col = columns.find(co => co.colStart === this.activeNode.layout.colStart) ||
            columns.find(co => co.colStart <= this.activeNode.layout.colStart);
        this.activeNode.layout.rowStart = col.rowStart;
        this.activeNode.layout.rowEnd = col.rowEnd;
        return {row: prev ? this.activeNode.row - 1 : this.activeNode.row, column: col.visibleIndex};
    }

    get lastColumnIndex() {
        return this.grid.getColumnByVisibleIndex(this.lastLayoutIndex).parent.children.last.visibleIndex;
    }

    get lastIndexPerRow() {
        const children = this.grid.getColumnByVisibleIndex(this.lastLayoutIndex).parent.children.toArray().reverse();
        return children.find(co => co.rowStart === this.activeNode.layout.rowStart).visibleIndex ||
        children.find(co => co.rowStart <= this.activeNode.layout.rowStart).visibleIndex;
    }

    private get lastLayoutIndex() {
        return Math.max(...this.grid.visibleColumns.filter(c => c.columnLayout).map(col => col.visibleIndex));
    }

    private get scrollTop() {
        return Math.abs(this.grid.verticalScrollContainer.getScroll().scrollTop);
    }
}
