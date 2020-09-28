import { Injectable } from '@angular/core';
import { IgxGridBaseDirective } from './grid-base.directive';
import { first } from 'rxjs/operators';
import { IgxColumnComponent } from './columns/column.component';
import { IgxGridNavigationService } from './grid-navigation.service';
import { HORIZONTAL_NAV_KEYS, HEADER_KEYS } from '../core/utils';

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
                colIndex = ctrl ? this.lastColIndexPerMRLBlock(this.lastIndexPerRow) : this.lastIndexPerRow;
                break;
            case 'home':
                rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row;
                colIndex = ctrl ? 0 : this.firstIndexPerRow;
                break;
            case 'arrowleft':
            case 'left':
                colIndex = ctrl ? this.firstIndexPerRow : this.getNextHorizontalCellPosition(true).column;
                break;
            case 'arrowright':
            case 'right':
                colIndex = ctrl ? this.lastIndexPerRow : this.getNextHorizontalCellPosition().column;
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

    public shouldPerformVerticalScroll(targetRowIndex: number, visibleColIndex: number): boolean {
        if (!super.shouldPerformVerticalScroll(targetRowIndex, visibleColIndex)) { return false; }
        if (!this.isDataRow(targetRowIndex) || visibleColIndex < 0) { 
            return super.shouldPerformVerticalScroll(targetRowIndex, visibleColIndex); 
        }

        const targetRow = super.getRowElementByIndex(targetRowIndex);
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const scrollPos = this.getVerticalScrollPositions(targetRowIndex, visibleColIndex);
        return (!targetRow || targetRow.offsetTop + scrollPos.topOffset < Math.abs(this.containerTopOffset)
            || containerHeight && containerHeight < scrollPos.rowBottom -  Math.ceil(this.scrollTop));
    }

    public isColumnFullyVisible(visibleColIndex: number): boolean {
        const targetCol = this.grid.getColumnByVisibleIndex(visibleColIndex);
        if (this.isParentColumnFullyVisible(targetCol?.parent) || super.isColumnPinned(visibleColIndex, this.forOfDir())) { return true; }

        const scrollPos = this.getChildColumnScrollPositions(visibleColIndex);
        const colWidth = scrollPos.rightScroll - scrollPos.leftScroll;
        if (this.displayContainerWidth < colWidth && this.displayContainerScrollLeft === scrollPos.leftScroll) { return true; }
        return this.displayContainerWidth >= scrollPos.rightScroll - this.displayContainerScrollLeft &&
            this.displayContainerScrollLeft <= scrollPos.leftScroll;
    }

    private isParentColumnFullyVisible(parent: IgxColumnComponent): boolean {
        if (!this.forOfDir().getScroll().clientWidth || parent?.pinned) { return true; }

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

    public performVerticalScrollToCell(rowIndex: number, visibleColIndex: number, cb?: () => void) {
        const children = this.parentByChildIndex(visibleColIndex || 0)?.children;
        if (!super.isDataRow(rowIndex) || (children && children.length < 2)) {
            return super.performVerticalScrollToCell(rowIndex, visibleColIndex, cb);
        }

        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const pos = this.getVerticalScrollPositions(rowIndex, visibleColIndex);
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

    getNextHorizontalCellPosition(previous = false) {
        const parent = this.parentByChildIndex(this.activeNode.column);
        if (!this.hasNextHorizontalPosition(previous, parent)) {
            return { row: this.activeNode.row, column: this.activeNode.column };
        }
        const columns = previous ? parent.children.filter(c => c.rowStart <= this.activeNode.layout.rowStart)
            .sort((a, b) => b.visibleIndex - a.visibleIndex) : parent.children.filter(c => c.rowStart <= this.activeNode.layout.rowStart);
        let column = columns.find((col) => previous ?
                col.visibleIndex < this.activeNode.column && this.rowEnd(col) > this.activeNode.layout.rowStart :
                col.visibleIndex > this.activeNode.column && col.colStart > this.activeNode.layout.colStart);
        if (!column || (previous && this.activeNode.layout.colStart === 1)) {
            const index = previous ? parent.visibleIndex - 1 : parent.visibleIndex + 1;
            const children = this.grid.columnList.find(cols => cols.columnLayout && cols.visibleIndex === index).children;
            column = previous ? children.toArray().reverse().find(child => child.rowStart <= this.activeNode.layout.rowStart) :
                children.find(child => this.rowEnd(child) > this.activeNode.layout.rowStart && child.colStart === 1);
        }
        return { row: this.activeNode.row, column: column.visibleIndex };
    }

    getNextVerticalPosition(previous = false) {
        this.activeNode.column = this.activeNode.column || 0;
        if (!this.hasNextVerticalPosition(previous)) {
            return { row: this.activeNode.row, column: this.activeNode.column };
        }
        const currentRowStart = this.grid.getColumnByVisibleIndex(this.activeNode.column).rowStart;
        const nextBlock = !this.isDataRow(this.activeNode.row) ||
        (previous ? currentRowStart === 1 : currentRowStart === this.lastRowStartPerBlock());
        const nextRI = previous ? this.activeNode.row - 1 : this.activeNode.row + 1;
        if (nextBlock && !this.isDataRow(nextRI)) {
            return {row: nextRI,  column: this.activeNode.column};
        }
        const children = this.parentByChildIndex(this.activeNode.column).children;
        const col = previous ? this.getPreviousRowIndex(children, nextBlock) : this.getNextRowIndex(children, nextBlock);
        return { row: nextBlock ? nextRI : this.activeNode.row, column: col.visibleIndex };
    }

    private getNextRowIndex(children, next) {
        const rowStart = next ? 1 : this.rowEnd(this.grid.getColumnByVisibleIndex(this.activeNode.column));
        const  col = children.filter(c => c.rowStart === rowStart);
        return col.find(co => co.colStart === this.activeNode.layout.colStart) ||
            col.sort((a, b) => b.visibleIndex - a.visibleIndex).find(co => co.colStart <= this.activeNode.layout.colStart);    }

    private getPreviousRowIndex(children, prev) {
        const end = prev ? Math.max(...children.map(c => this.rowEnd(c))) :
            this.grid.getColumnByVisibleIndex(this.activeNode.column).rowStart;
        const col = children.filter(c => this.rowEnd(c) ===  end);
        return col.find(co => co.colStart === this.activeNode.layout.colStart) ||
            col.sort((a, b) => b.visibleIndex - a.visibleIndex).find(co => co.colStart <= this.activeNode.layout.colStart);
    }

    headerNavigation(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!HEADER_KEYS.has(key)) { return; }
        event.preventDefault();
        if (!this.activeNode.layout) {
            this.activeNode.layout = this.layout(this.activeNode.column || 0);
        }
        const alt = event.altKey;
        const ctrl = event.ctrlKey;
        this.performHeaderKeyCombination(this.grid.getColumnByVisibleIndex(this.activeNode.column), key, event.shiftKey, ctrl, alt, event);
        if (!ctrl && !alt && (key.includes('down') || key.includes('up'))) {
            const children = this.parentByChildIndex(this.activeNode.column).children;
            const col = key.includes('down') ? this.getNextRowIndex(children, false) : this.getPreviousRowIndex(children, false);
            if (!col) { return; }
            this.activeNode.column = col.visibleIndex;
            const newLayout = this.layout(this.activeNode.column);
            Object.assign(this.activeNode.layout, {rowStart: newLayout.rowStart, rowEnd: newLayout.rowEnd});
            return;
        }
        this.horizontalNav(event, key, -1);
    }

    protected horizontalNav(event: KeyboardEvent, key: string, rowIndex: number) {
        const ctrl = event.ctrlKey;
        if (!HORIZONTAL_NAV_KEYS.has(key) || event.altKey) { return; }
        this.activeNode.row = rowIndex;
        if ((key.includes('left') || key === 'home') && this.activeNode.column > 0) {
            this.activeNode.column = ctrl || key === 'home' ? this.firstIndexPerRow : this.getNextHorizontalCellPosition(true).column;
        }
        if ((key.includes('right') || key === 'end') && this.activeNode.column !== this.lastIndexPerRow) {
            this.activeNode.column = ctrl || key === 'end' ? this.lastIndexPerRow : this.getNextHorizontalCellPosition().column;
        }
        const newLayout = this.layout(this.activeNode.column);
        Object.assign(this.activeNode.layout, {colStart: newLayout.colStart, rowEnd: newLayout.rowEnd});
        this.performHorizontalScrollToCell(this.activeNode.column);
    }

    private get lastIndexPerRow(): number {
        const children = this.grid.visibleColumns.find(c => c.visibleIndex === this.lastLayoutIndex && c.columnLayout)
            .children.toArray().reverse();
        const column = children.find(co => co.rowStart === this.activeNode.layout.rowStart) ||
        children.find(co => co.rowStart <= this.activeNode.layout.rowStart);
        return column.visibleIndex;
    }

    private get firstIndexPerRow(): number {
        const children = this.grid.visibleColumns.find(c => c.visibleIndex === 0 && c.columnLayout).children;
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
        return this.parentByChildIndex(visibleIndex).children.last.visibleIndex;
    }

    private lastRowStartPerBlock(visibleIndex = this.activeNode.column) {
        return Math.max(...this.parentByChildIndex(visibleIndex).children.map(c => c.rowStart));
    }

    private rowEnd(column): number {
        return column.rowEnd && column.rowEnd - column.rowStart ? column.rowStart + column.rowEnd - column.rowStart : column.rowStart + 1;
    }

    /**
     * @hidden
     * @internal
     */
    public layout(visibleIndex) {
        const column = this.grid.getColumnByVisibleIndex(visibleIndex);
        return {colStart: column.colStart, rowStart: column.rowStart,
                colEnd: column.colEnd, rowEnd: column.rowEnd, columnVisibleIndex: column.visibleIndex };
    }

    private parentByChildIndex(visibleIndex) {
        return this.grid.getColumnByVisibleIndex(visibleIndex)?.parent;

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
