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
        if (!this.activeNode.layout) {
            this.activeNode.layout = this.layout(this.activeNode.column || 0);
        }
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
                colIndex = ctrl ? this.lastColIndexPerMRLBlock(this.lastLayoutIndex) : this.lastIndexPerRow;
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
                const prevPos = this.getNextVerticalPosition(true);
                colIndex = ctrl ? this.activeNode.column : prevPos.column;
                rowIndex = ctrl ? this.findFirstDataRowIndex() : prevPos.row;
                break;
            case 'arrowdown':
            case 'down':
                const nextPos = this.getNextVerticalPosition();
                colIndex = ctrl ? this.activeNode.column : nextPos.column;
                rowIndex = ctrl ? this.findLastDataRowIndex() : nextPos.row;
                break;
            default:
                return;
        }
        const nextLayout = this.layout(colIndex);
        const newLayout = key.includes('up') || key.includes('down') ? {rowStart: nextLayout.rowStart} : {colStart: nextLayout.colStart};
        Object.assign(this.activeNode.layout, newLayout, {rowEnd: nextLayout.rowEnd});

        if (ctrl && (key === 'home' || key === 'end')) { this.activeNode.layout = nextLayout; }
        return { rowIndex, colIndex };
    }

    public isValidPosition(rowIndex: number, colIndex: number): boolean {
        if (rowIndex < 0 || colIndex < 0 || this.grid.dataView.length - 1 < rowIndex ||
            Math.max(...this.grid.visibleColumns.map(col => col.visibleIndex)) < colIndex ||
            (this.activeNode.column !== colIndex && !this.isDataRow(rowIndex, true))) {
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
        if (!this.forOfDir().getScroll().clientWidth || parent.pinned) { return true; }

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
        const topOffset = this.grid.defaultRowHeight * (targetCol.rowStart - 1);
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
        const children = this.grid.getColumnByVisibleIndex(this.activeNode.column || 0)?.parent.children;
        if (!super.isDataRow(rowIndex) || children.length < 2) { return super.performVerticalScrollToCell(rowIndex, cb); }

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
        if (!this.hasNextHorizontalPosition(previous, parent)) {
            return { row: this.activeNode.row, column: this.activeNode.column };
        }
        const columns = parent.children.filter(c => c.rowStart <= this.activeNode.layout.rowStart);
        let column = previous ?
            columns.reverse().find(col => col.visibleIndex < this.activeNode.column && this.rowEnd(col) > this.activeNode.layout.rowStart) :
            columns.find(col => col.visibleIndex > this.activeNode.column && col.colStart > this.activeNode.layout.colStart);

        if (!column || (previous && this.activeNode.layout.colStart === 1)) {
            const index = previous ? parent.visibleIndex - 1 : parent.visibleIndex + 1;
            const children = this.grid.columnList.find(cols => cols.columnLayout && cols.visibleIndex === index).children;
            column = previous ? children.toArray().reverse().find(child => child.rowStart <= this.activeNode.layout.rowStart) :
                children.find(child => this.rowEnd(child) > this.activeNode.layout.rowStart && child.colStart === 1);
        }
        return { row: this.activeNode.row, column: column.visibleIndex };
    }

    getNextVerticalPosition(previous = false) {
        this.activeNode.column = this.activeNode.column ? this.activeNode.column : 0;
        if (!this.hasNextVerticalPosition(previous)) {
            return { row: this.activeNode.row, column: this.activeNode.column };
        }
        const nextBlock = !this.isDataRow(this.activeNode.row) || (previous ? this.activeNode.layout.rowStart === 1 :
            this.activeNode.column === this.lastColIndexPerMRLBlock());
        const nextRI = previous ? this.activeNode.row - 1 : this.activeNode.row + 1;
        if (nextBlock && !this.isDataRow(nextRI)) {
            return {row: nextRI,  column: this.activeNode.column};
        }
        const children = this.grid.getColumnByVisibleIndex(this.activeNode.column).parent.children;
        const col = previous ? this.getPreviousRowIndex(children, nextBlock) : this.getNextRowIndex(children, nextBlock);
        return { row: nextBlock ? nextRI : this.activeNode.row, column: col.visibleIndex };
    }

    private getNextRowIndex(children, next) {
        const rowStart = next ? 1 : this.rowEnd(this.activeNode.layout);
        const  col = children.filter(c => c.rowStart === rowStart);
        return col.find(co => co.colStart === this.activeNode.layout.colStart) ||
            col.find(co => co.colStart <= this.activeNode.layout.colStart);
    }

    private getPreviousRowIndex(children, prev) {
        const rows = prev ? children.map(c => c.rowStart) : children.map(c => c.rowStart).filter(r => r < this.activeNode.layout.rowStart);
        const columns = children.filter(c => c.rowStart ===  Math.max(...rows));
        return columns.find(co => co.colStart === this.activeNode.layout.colStart) ||
            columns.find(co => co.colStart <= this.activeNode.layout.colStart);
    }

    private get lastIndexPerRow(): number {
        const children = this.grid.getColumnByVisibleIndex(this.lastLayoutIndex).parent.children.toArray().reverse();
        const column = children.find(co => co.rowStart === this.activeNode.layout.rowStart) ||
        children.find(co => co.rowStart <= this.activeNode.layout.rowStart);
        return column.visibleIndex;
    }

    private get lastLayoutIndex(): number {
        return Math.max(...this.grid.visibleColumns.filter(c => c.columnLayout).map(col => col.visibleIndex));
    }

    private get scrollTop(): number {
        return Math.abs(this.grid.verticalScrollContainer.getScroll().scrollTop);
    }

    private lastColIndexPerMRLBlock(visibleIndex = this.activeNode.column): number {
        return this.grid.getColumnByVisibleIndex(visibleIndex).parent.children.last.visibleIndex;
    }

    private rowEnd(column): number {
        return column.rowEnd && column.rowEnd - column.rowStart ? column.rowStart + column.rowEnd - column.rowStart : column.rowStart + 1;
    }

    private layout(visibleIndex) {
        const column = this.grid.getColumnByVisibleIndex(visibleIndex);
        return {colStart: column.colStart, rowStart: column.rowStart,
                colEnd: column.colEnd, rowEnd: column.rowEnd, columnVisibleIndex: column.visibleIndex };
    }

    private hasNextHorizontalPosition(previous = false, parent) {
        if (previous && parent.visibleIndex === 0 && this.activeNode.layout.colStart === 1 ||
            !previous && parent.visibleIndex === this.lastLayoutIndex && this.activeNode.column === this.lastIndexPerRow) {
            return false;
        }
        return true;
    }

    private hasNextVerticalPosition(prev = false) {
        if ((prev && this.activeNode.row === 0 && (!this.isDataRow(this.activeNode.row) || this.activeNode.layout.rowStart === 1)) ||
            (!prev && this.activeNode.row >= this.grid.dataView.length - 1 && this.activeNode.column === this.lastColIndexPerMRLBlock())) {
            return false;
        }
        return true;
    }
}
