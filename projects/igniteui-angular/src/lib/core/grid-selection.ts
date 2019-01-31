import { Injectable } from '@angular/core';


export interface GridSelectionRange {
    rowStart: number;
    rowEnd: number;
    columnStart: string | number;
    columnEnd: string | number;
}

@Injectable()
export class IgxGridSelectionService {

    dragMode = false;
    startNode;
    ctrlEnabled = false;
    shiftEnabled = false;
    kbShiftEnabled = false;

    selection = new Map<number, Set<number>>();
    metaSelection: Set<string> = new Set<string>();


    get ranges(): GridSelectionRange[] {
        return Array.from(this.metaSelection).map(range => JSON.parse(range));
    }

    resetState() {
        this.dragMode = false;
        // this.startNode = null;
        this.ctrlEnabled = false;
        this.shiftEnabled = false;
        this.kbShiftEnabled = false;
    }

    add_single(row: number, column: number): void {
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

    initKeyboardState(row: number, column: number, key: string, shiftKeyPressed: boolean) {
        if (!this.kbShiftEnabled && shiftKeyPressed) {
            this.kbShiftEnabled = shiftKeyPressed && key !== 'tab';
            this.startNode = [row, column];
        } else if (this.kbShiftEnabled && !shiftKeyPressed) {
            this.kbShiftEnabled = false;
            this.startNode = null;
        }
    }

    pointerDownShiftKey(row: number, column: number): void {
        this.clear();
        this.updateDragSelection(row, column);
        this.addRangeMeta(row, column);
        this.resetState();
        this.startNode = [row, column];
    }


    updateDragSelection(row: number, column: number): void {

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

    clear(): void {
        this.selection.clear();
        this.metaSelection.clear();
    }
}
