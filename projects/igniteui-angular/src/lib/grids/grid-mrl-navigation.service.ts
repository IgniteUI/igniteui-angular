import { Injectable } from '@angular/core';
import { IgxGridBaseDirective } from './grid-base.directive';
import { first } from 'rxjs/operators';
import { IgxColumnComponent } from './columns/column.component';
import { IgxGridNavigationService } from './grid-navigation.service';

/** @hidden */
@Injectable()
export class IgxGridMRLNavigationService extends IgxGridNavigationService {
    public grid: IgxGridBaseDirective;

    protected getNextPosition(rowIndex: number, colIndex: number, key: string, shift: boolean, ctrl: boolean, event: KeyboardEvent) {
        switch (key) {
            case 'tab':
            case ' ':
            case 'spacebar':
            case 'space':
            case 'escape':
            case 'esc':
            case 'enter':
            case 'f2':
                super.getNextPosition(rowIndex, colIndex, key, shift, ctrl, event);
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
                colIndex = ctrl ? 0 : this.getNextHorizontalCellPositon(true).column;
                break;
            case 'arrowright':
            case 'right':
                colIndex = ctrl ? this.lastIndexPerRow : this.getNextHorizontalCellPositon().column;
                break;
            case 'arrowup':
            case 'up':
                const prevPos = this.getPreviousRowIndex();
                colIndex = ctrl ? this.activeNode.column : prevPos.column;
                rowIndex = ctrl ? this.findFirstDataRowIndex() : prevPos.row;
                break;
            case 'arrowdown':
            case 'down':
                const nextPos = this.getNextRowIndex();
                colIndex = ctrl ? this.activeNode.column : nextPos.column;
                rowIndex = ctrl ? this.findLastDataRowIndex() : nextPos.row;
                break;
            default:
                return;
        }
        return { rowIndex, colIndex };
    }

    public isValidPosition(rowIndex: number, colIndex: number): boolean {
        if (rowIndex < 0 || colIndex < 0 || this.grid.dataView.length - 1 < rowIndex ||
            Math.max(...this.grid.visibleColumns.map(col => col.visibleIndex)) < colIndex) {
            return false;
        }
        if (this.activeNode.column !== colIndex && !this.isDataRow(rowIndex, true)) {
            return false;
        }
        return true;
    }

    public shouldPerformVerticalScroll(targetRowIndex: number): boolean {
        if (!super.shouldPerformVerticalScroll(targetRowIndex)) { return false; }

        const targetRow = super.getRowElementByIndex(targetRowIndex);
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const scrollPos = this.getVerticalScrollPositions(targetRowIndex, this.activeNode.column);
        return (!targetRow || targetRow.offsetTop + scrollPos.topOffset < Math.abs(this.containerTopOffset)
            || containerHeight && containerHeight < scrollPos.rowBottom - this.scrollTop);
    }

    public isColumnFullyVisible(visibleColIndex: number): boolean {
        const targetCol = this.grid.getColumnByVisibleIndex(visibleColIndex);
        if (this.isParentColumnFullyVisible(targetCol.parent) || super.isColumnPinned(visibleColIndex, this.forOfDir())) { return true; }

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
        const parentVIndex = this.forOfDir().igxForOf.indexOf(targetCol.parent);
        let leftScroll = this.forOfDir().getColumnScrollLeft(parentVIndex);
        let rightScroll = this.forOfDir().getColumnScrollLeft(parentVIndex + 1);
        targetCol.parent.children.forEach((c) => {
            if (c.rowStart >= targetCol.rowStart && c.visibleIndex < targetCol.visibleIndex) {
                leftScroll += parseInt(c.width, 10);
            }
            if (c.rowStart <= targetCol.rowStart && c.visibleIndex > targetCol.visibleIndex) {
                rightScroll -= parseInt(c.width, 10);
            }
        });
        return { leftScroll, rightScroll: rightScroll };
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
        const scrollPos = this.getChildColumnScrollPositions(visibleColumnIndex);
        const startScroll = scrollPos.rightScroll - this.displayContainerScrollLeft;
        const nextScroll = !(this.displayContainerScrollLeft <= scrollPos.leftScroll) && this.displayContainerWidth >= startScroll ?
            scrollPos.leftScroll : scrollPos.rightScroll - this.displayContainerWidth;
        this.forOfDir().getScroll().scrollLeft = nextScroll;
        this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                if (cb) { cb(); }
            });
    }

    public performVerticalScrollToCell(rowIndex: number, cb?: () => void) {
        if (!super.isDataRow(rowIndex)) { return super.performVerticalScrollToCell(rowIndex, cb); }

        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const pos = this.getVerticalScrollPositions(rowIndex, this.activeNode.column);
        const row = super.getRowElementByIndex(rowIndex);
        if ((this.scrollTop > pos.rowTop) && (!row || row.offsetTop + pos.topOffset < Math.abs(this.containerTopOffset))) {
            pos.topOffset === 0 ? this.grid.verticalScrollContainer.scrollTo(rowIndex) :
                this.grid.verticalScrollContainer.scrollPosition = pos.rowTop;
        } else {
            this.grid.verticalScrollContainer.addScrollTop(Math.abs(pos.rowBottom - this.scrollTop - containerHeight));
        }
        this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first()).subscribe(() => {
                if (cb) { cb(); }
            });
    }

    getNextHorizontalCellPositon(previous = false) {
        const parent = this.grid.getColumnByVisibleIndex(this.activeNode.column).parent;
        let column = parent.children.filter(c => c.rowStart <= this.activeNode.layout.rowStart).find((col) => previous ?
                col.visibleIndex < this.activeNode.column && this.rowEnd(col) > this.activeNode.layout.rowStart :
                col.visibleIndex > this.activeNode.column && col.colStart > this.activeNode.layout.colStart);
        if (!column || (previous && this.activeNode.layout.colStart === 1)) {
            const index = previous ? parent.visibleIndex - 1 : parent.visibleIndex + 1;
            const children = this.grid.columnList.find(cols => cols.columnLayout && cols.visibleIndex === index).children;
            column = previous ? children.toArray().reverse().find(child => child.rowStart <= this.activeNode.layout.rowStart) :
                children.find(child => this.rowEnd(child) > this.activeNode.layout.rowStart && child.colStart === 1);
        }
        Object.assign(this.activeNode.layout, {colStart: column.colStart, rowEnd: column.rowEnd});
        return { row: this.activeNode.row, column: column.visibleIndex };
    }

    getNextVerticalPosition() {
        const children = this.grid.getColumnByVisibleIndex(this.activeNode.column).parent.children;

    }

    getNextRowIndex() {
        const children = this.grid.getColumnByVisibleIndex(this.activeNode.column).parent.children;
        const layout = this.activeNode.layout;
        const rowSpan = layout.rowEnd && layout.rowEnd - layout.rowStart ? layout.rowEnd - layout.rowStart : 1;

        let col = children.filter(c => c.rowStart === this.activeNode.layout.rowStart + rowSpan)
            .reverse().find(c => c.colStart <= this.activeNode.layout.colStart);
        const newRI = col ? this.activeNode.row : this.activeNode.row + 1;
        if (!col) {
            const columns = children.filter((colu: IgxColumnComponent) => colu.rowStart === 1);
            col = columns.find(co => co.colStart === this.activeNode.layout.colStart) ||
                columns.find(co => co.colStart <= this.activeNode.layout.colStart);
        }
        Object.assign(this.activeNode.layout, {rowStart: col.rowStart, rowEnd:  col.rowEnd});
        return { row: newRI, column: col.visibleIndex };
    }

    getPreviousRowIndex() {
        const children = this.grid.getColumnByVisibleIndex(this.activeNode.column).parent.children;
        const prev = this.activeNode.layout.rowStart === 1;
        const rowStarts = children.map(c => c.rowStart).reverse();
        const rowStart = prev ? Math.max(...rowStarts) : rowStarts.find(r => r < this.activeNode.layout.rowStart);
        const columns = children.filter((colu: IgxColumnComponent) => colu.rowStart === rowStart);
        const col = columns.find(co => co.colStart === this.activeNode.layout.colStart) ||
            columns.find(co => co.colStart <= this.activeNode.layout.colStart);
        Object.assign(this.activeNode.layout, {rowStart: col.rowStart, rowEnd:  col.rowEnd});
        return { row: prev ? this.activeNode.row - 1 : this.activeNode.row, column: col.visibleIndex };
    }

    get lastColumnIndex(): number {
        return this.grid.getColumnByVisibleIndex(this.lastLayoutIndex).parent.children.last.visibleIndex;
    }

    get lastIndexPerRow(): number {
        const children = this.grid.getColumnByVisibleIndex(this.lastLayoutIndex).parent.children.toArray().reverse();
        return children.find(co => co.rowStart === this.activeNode.layout.rowStart).visibleIndex ||
            children.find(co => co.rowStart <= this.activeNode.layout.rowStart).visibleIndex;
    }

    private get lastLayoutIndex(): number {
        return Math.max(...this.grid.visibleColumns.filter(c => c.columnLayout).map(col => col.visibleIndex));
    }

    private get scrollTop(): number {
        return Math.abs(this.grid.verticalScrollContainer.getScroll().scrollTop);
    }

    private rowEnd(column): number {
        return column.rowEnd && column.rowEnd - column.rowStart ? column.rowStart + column.rowEnd - column.rowStart : column.rowStart + 1;
    }
}
