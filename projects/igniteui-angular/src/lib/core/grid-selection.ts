import { Injectable } from '@angular/core';


export interface GridSelectionRange {
    rowStart: number;
    rowEnd: number;
    columnStart: string | number;
    columnEnd: string | number;
}

@Injectable()
export class IgxGridSelectionService {

    inDragMode = false;
    startNode;
    ctrlEnabled = false;
    shiftEnabled = false;
    kbShiftEnabled = false;
    kbStartNode = null;

    selection = new Map<number, Set<number>>();
    metaSelection: Set<string> = new Set<string>();


    resetState() {
        this.inDragMode = false;
        this.startNode = null;
        this.ctrlEnabled = false;
        this.shiftEnabled = false;
        this.kbShiftEnabled = false;
        this.kbStartNode = null;
    }

    add_single(row: number, column: number) {
        this.selection.has(row) ? this.selection.get(row).add(column) :
            this.selection.set(row, new Set<number>()).get(row).add(column);

        this.metaSelection.add(JSON.stringify({
            rowStart: row,
            rowEnd: row,
            columnStart: column,
            columnEnd: column
        }));
    }

    remove_single(row: number, column: number) {

        const r = this.selection.get(row);
        if (r) {
            this.selection.get(row).delete(column);
            if (!this.selection.get(row).size) {
                this.selection.delete(row);
            }
        }

        this.metaSelection.delete(JSON.stringify({
            rowStart: row,
            rowEnd: row,
            columnStart: column,
            columnEnd: column
        }));

    }

    isSelected(row: number, column: number) {
        return (this.selection.has(row) && this.selection.get(row).has(column));
    }

    addRangeMeta(row: number, column: number) {
        const { rowStart, rowEnd, columnStart, columnEnd } = this.getBoundries(row, column);

        this.metaSelection.add(JSON.stringify({
            rowStart,
            rowEnd,
            columnStart,
            columnEnd
        }));
    }

    getBoundries(row: number, column: number) {
        const [dx, dy] = [...this.startNode];
        const rowStart = Math.min(dx, row);
        const rowEnd = Math.max(dx, row);
        const columnStart = Math.min(dy, column);
        const columnEnd = Math.max(dy, column);

        return { rowStart, rowEnd, columnStart, columnEnd };
    }

    updateDragSelection(row: number, column: number) {

        const { rowStart, rowEnd, columnStart, columnEnd } = this.getBoundries(row, column);

        if (!this.ctrlEnabled) {
            this.selection.clear();
        }

        for (let i = rowStart; i <= rowEnd; i++) {
            for (let j = columnStart; j <= columnEnd; j++) {
                this.selection.has(i) ? this.selection.get(i).add(j) :
                    this.selection.set(i, new Set<number>()).get(i).add(j);
            }
        }
    }

    clear() {
        this.selection.clear();
        this.metaSelection.clear();
    }
}
