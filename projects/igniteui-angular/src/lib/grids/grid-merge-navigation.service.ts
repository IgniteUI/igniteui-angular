import { Injectable } from '@angular/core';
import { IgxGridNavigationService } from './grid-navigation.service';
import { first } from 'rxjs/operators';
/** @hidden */
@Injectable()
export class IgxGridMergeNavigationService extends IgxGridNavigationService {
    public override shouldPerformVerticalScroll(targetRowIndex: number, visibleColIndex: number): boolean {
        const targetRec = this.grid.verticalScrollContainer.igxForOf[targetRowIndex];
        const field = this.grid.visibleColumns[visibleColIndex]?.field;
        const rowSpan = targetRec?.cellMergeMeta?.get(field)?.rowSpan;
        if (rowSpan > 1) {
            const targetRow = super.getRowElementByIndex(targetRowIndex);
            const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
            const scrollPos = this.getVerticalScrollPositions(targetRowIndex, rowSpan);
            return (!targetRow || targetRow.offsetTop < Math.abs(this.containerTopOffset)
                || containerHeight && containerHeight < scrollPos.rowBottom -  Math.ceil(this.scrollTop));
        } else {
            return super.shouldPerformVerticalScroll(targetRowIndex, visibleColIndex);
        }
    }

    public override performVerticalScrollToCell(rowIndex: number, visibleColIndex: number, cb?: () => void) {
        const targetRec = this.grid.verticalScrollContainer.igxForOf[rowIndex];
        const field = this.grid.visibleColumns[visibleColIndex]?.field;
        const rowSpan = targetRec?.cellMergeMeta?.get(field)?.rowSpan;
        if (rowSpan > 1) {
            const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
            const pos = this.getVerticalScrollPositions(rowIndex, rowSpan);
            const row = super.getRowElementByIndex(rowIndex);
            if ((this.scrollTop > pos.rowTop) && (!row || row.offsetTop < Math.abs(this.containerTopOffset))) {
                if (pos.topOffset === 0) {
                    this.grid.verticalScrollContainer.scrollTo(rowIndex);
                } else {
                    this.grid.verticalScrollContainer.scrollPosition = pos.rowTop;
                }
            } else {
                this.grid.verticalScrollContainer.addScrollTop(Math.abs(pos.rowBottom - this.scrollTop - containerHeight));
            }
            this.grid.verticalScrollContainer.chunkLoad
                .pipe(first()).subscribe(() => {
                    if (cb) {
                        cb();
                    }
            });
        } else {
            super.performVerticalScrollToCell(rowIndex, visibleColIndex, cb);
        }
    }

    protected override getNextPosition(rowIndex: number, colIndex: number, key: string, shift: boolean, ctrl: boolean, event: KeyboardEvent) {
        const field = this.grid.visibleColumns[colIndex]?.field;
        const currentRec = this.grid.verticalScrollContainer.igxForOf[this.activeNode.row];
        const currentRootRec = currentRec?.cellMergeMeta?.get(field)?.root;
        const currentIndex = currentRootRec ? this.grid.verticalScrollContainer.igxForOf.indexOf(currentRootRec) : this.activeNode.row;
        switch (key) {
            case 'tab':
            case ' ':
            case 'spacebar':
            case 'space':
            case 'escape':
            case 'esc':
            case 'enter':
            case 'f2':
            case 'left':
            case 'arrowleft':
            case 'arrowright':
            case 'right':
                // same as base for these keys
                return super.getNextPosition(rowIndex, colIndex, key, shift, ctrl, event);
                break;
            case 'end':
                rowIndex = ctrl ? this.findLastDataRowIndex() : this.activeNode.row;
                colIndex = this.lastColumnIndex;
                break;
            case 'home':
                rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row;
                colIndex = 0;
                break;
            case 'arrowup':
            case 'up':
                const prevRec = this.grid.verticalScrollContainer.igxForOf[currentIndex - 1];
                const prevRoot = prevRec?.cellMergeMeta?.get(field)?.root;
                const prev = currentIndex - (prevRoot?.cellMergeMeta?.get(field).rowSpan || 1);
                colIndex = this.activeNode.column !== undefined ? this.activeNode.column : 0;
                rowIndex = ctrl ? this.findFirstDataRowIndex() : prev;
                break;
            case 'arrowdown':
            case 'down':
                const next = currentIndex + ((currentRootRec || currentRec)?.cellMergeMeta?.get(field)?.rowSpan || 1);
                colIndex = this.activeNode.column !== undefined ? this.activeNode.column : 0;
                rowIndex = ctrl ? this.findLastDataRowIndex() : next;
                break;
            default:
                return;
        }
        return { rowIndex, colIndex };
    }

    private getVerticalScrollPositions(rowIndex: number, rowSpan: number) {
        const rowTop = this.grid.verticalScrollContainer.sizesCache[rowIndex];
        const rowBottom = this.grid.verticalScrollContainer.sizesCache[rowIndex + rowSpan];
        const topOffset = rowBottom - rowTop;
        return { topOffset, rowTop, rowBottom };
    }

    private get scrollTop(): number {
        return Math.abs(this.grid.verticalScrollContainer.getScroll().scrollTop);
     }
}
